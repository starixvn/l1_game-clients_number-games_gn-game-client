import Head from "next/head";
import { withRouter } from "next/router";
import React from "react";
import { AuthorizeResponse, ReCheckInResponse } from "sc-user-service-client/dist/auth";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";

import { getAppSettings } from "../../../_shared/app-settings";
import { Themes } from "../../../_shared/constants";
import { buildUrl, GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import { randomInteger } from "../../../_shared/helpers/number-helper";
import {
    loadURLContext,
    PlayerContextProvider,
    SettingContextProvider,
    updateURLContext,
    URLContextModel,
} from "../../../_shared/react-contexts";
import Games from "../../../games/games";
import { authorize, createNickname, getLobbyConfigs, reCheckIn } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { UserStakeLevel } from "../../game-base/type";
import BaseDialog from "../../game-components/base-dialog";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import { Lobby } from "../lobby/lobby";
import Styles from "./dashboard.module.scss";
import Register from "./register";
import { MAX_AVATAR_ID } from "./register/avatar-gallery";
import NameGenerator from "./register/name-generator";
import { Props, State } from "./type";
import { initLobbySocket, reconnectToGameOnLobby } from "../lobby/lobby-socket-connection";

class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;

    constructor(props: Props) {
        super(props);

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            authorizeInfo: null,
            isShowErrorModal: false,
            apiError: null,
            isShowAnnouncement: false,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            isJoinGame: false,
            lobbyConfigs: {},
            openGameId: null,
            openGameName: "",
            isShowToolbarGuide: StorageHelper.get(localStorageKeys.toolbarGuide) ?? true,
            isOnLobby: true,
            lobbySocket: null,
        };

        this.handleFirstLogin = this.handleFirstLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.registerMainSocketEvent = this.registerMainSocketEvent.bind(this);
        this.handleKickedOut = this.handleKickedOut.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.updateAuthorizeInfo = this.updateAuthorizeInfo.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.handleShowApiErrorMessage = this.handleShowApiErrorMessage.bind(this);
        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.toggleAnnouncementModal = this.toggleAnnouncementModal.bind(this);
        this.updateQueryGame = this.updateQueryGame.bind(this);
        this.openGame = this.openGame.bind(this);
        this.closeToolbarGuide = this.closeToolbarGuide.bind(this);
        this.handleRecheckInResponse = this.handleRecheckInResponse.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.openGameFromLobby = this.openGameFromLobby.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }
    }

    updateAuthorizeInfo(authorizeInfo: AuthorizeResponse) {
        this.checkOfferedGame(authorizeInfo);
        this.setState({ authorizeInfo });
    }

    updateUserBalance(balance: number) {
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo && authorizeInfo.authorized && authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            this.setState({ authorizeInfo });
        }
    }

    handleShowApiErrorMessage(errorCode: string, isDisableAccount = false) {
        if (isDisableAccount || errorCode === "1001" || errorCode === "1002") {
            this.isKickOut = true;
            setTimeout(() => {
                this.signOut();
            }, 10000);
        }

        this.setState({ isShowErrorModal: true, isBlockUI: false, apiError: { errorCode, message: GetLocalizedErrorMessage(errorCode) } });
    }

    signOut() {
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    checkOfferedGame(authorizeInfo) {
        if (authorizeInfo?.user?.offerGames && authorizeInfo?.user?.offerGames.length === 0) {
            this.setState({
                apiError: {
                    message: "Common.message_no_game_offer",
                    errorCode: "",
                },
                isShowErrorModal: true,
                isBlockUI: true,
            });
        }
    }

    handleRecheckInResponse(response: ReCheckInResponse) {
        if (!response || !response.isSuccessful) {
            this.signOut();
        } else if (response.apiError) {
            this.handleShowApiErrorMessage(response.apiError.errorCode, response.isDisableAccount);
        } else {
            this.updateUserBalance(response.balance);
        }
    }

    async onVisibilityChange() {
        if (!document["hidden"]) {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
            this.connectLobbySocket();
        } else {
            this.closeLobbySocket();
        }
    }

    async componentDidMount() {
        if (typeof window === "undefined") {
            return;
        }
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        const { session, directMode, queryGame } = this.props;
        const authorizeResponse = await authorize(session);

        const errorResponse = authorizeResponse as any;

        if (errorResponse && errorResponse.errorCode === "SB0002") {
            this.signOut();
            return;
        }

        const authorizeInfo = authorizeResponse as any;

        const { authorized } = authorizeInfo;
        if (authorized === false && directMode) {
            return await this.autoCreateNickname();
        }

        this.updateAuthorizeInfo(authorizeInfo);

        this.updateUserBalance(authorizeInfo?.user?.red);

        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);

        this.connectNotificationSocket();
        this.connectLobbySocket();
        queryGame && this.openGame(queryGame);
    }

    shouldRenderGames(offerGames) {
        const urlContextModel = StorageHelper.get(localStorageKeys.url) as URLContextModel;
        const backToLobby = urlContextModel.backToLobby || false;
        const ssoRedirectGameId = urlContextModel.gameId || 0;
        return (offerGames.includes(this.state.openGameId) && !backToLobby) || ssoRedirectGameId > 0;
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.notificationSocket?.close();
        clearInterval(this.reCheckInInterval);
    }

    sendMessage(data: any) {
        this.notificationSocket.emit(JSON.stringify(data));
    }

    connectNotificationSocket() {
        const { proxy, enableMsgpackParser } = getAppSettings();
        const { session } = this.props;
        const socketUri = buildUrl();
        const socketOption = {
            forceNew: false,
            transports: ["websocket"],
            upgrade: false,
            auth: {
                ss: session.ss,
                username: session.username,
            },
            path: `${proxy.path}/notification/socket.io`,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };

        this.notificationSocket = io(socketUri, socketOption);
        this.registerMainSocketEvent(this.notificationSocket);
    }

    connectLobbySocket = () => {
        const { authorizeInfo } = this.state;
        if (!authorizeInfo) {
            return;
        }
        const lobbySocket = initLobbySocket(this.props.session, [1001, 1002]);
        this.setState({ lobbySocket });
    };

    closeLobbySocket = () => {
        const { lobbySocket } = this.state;
        lobbySocket?.close();
        this.setState({ lobbySocket: null });
    };

    reconnectToGameOnLobby = (gameId: number) => {
        reconnectToGameOnLobby(this.state.lobbySocket, this.props.session, gameId);
    };

    registerMainSocketEvent(mainSocket: Socket) {
        mainSocket.on("auth", this.handleAuth);
        mainSocket.on("kickedOut", this.handleKickedOut);
        mainSocket.on("reload", this.handleReload);
    }

    handleAuth(authData) {
        if (!authData.authorized) {
            this.handleKickedOut(authData);
        }
    }

    handleReload() {
        globalThis.location.reload();
    }

    handleKickedOut(data: any) {
        const { umInfo } = data;
        const { setIsUm } = this.props;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            StorageHelper.set(localStorageKeys.umInfo, umInfo);
            setTimeout(() => {
                setIsUm(true);
            }, 500);
        } else {
            this.signOut();
        }
    }

    handleFirstLogin() {
        const { session } = this.props;
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo && authorizeInfo.authorized) {
            updateSignInSMStatus(session);

            authorizeInfo.user.settings = { theme: Themes.light };
            authorizeInfo.user.isSignedInSM = true;

            this.updateAuthorizeInfo(authorizeInfo);
        }
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        this.setState({ userStakeLevel: userStakeLevel });
    }

    handleRegister(authorizeInfo: AuthorizeResponse) {
        const { session } = this.props;

        updateSignInSMStatus(session);
        authorizeInfo.user.isSignedInSM = true;

        this.updateAuthorizeInfo(authorizeInfo);
    }

    closeDialog() {
        this.setState({ isShowErrorModal: false });
        this.isKickOut && this.signOut();
    }

    async updateLobbyConfigs() {
        const { session } = this.props;
        const response = await getLobbyConfigs(session);
        this.setState({ lobbyConfigs: response?.lobbyConfigs as any });
    }

    toggleAnnouncementModal() {
        const { isShowAnnouncement } = this.state;
        this.setState({ isShowAnnouncement: !isShowAnnouncement });
    }

    updateQueryGame(gameId: number, isJoinGame: boolean, isClearOpenGame = false) {
        const queryGame = isJoinGame ? gameId : this.props.queryGame;
        const openGameId = isClearOpenGame ? null : this.state.openGameId;
        const openGameName = isClearOpenGame ? null : this.state.openGameName;
        this.setState({ queryGame: queryGame, isJoinGame: isJoinGame, openGameId: openGameId, openGameName: openGameName });
    }

    openGame(gameId: number) {
        this.setState({ queryGame: gameId, isJoinGame: true, openGameId: gameId });

        updateURLContext({ gameId });
    }

    closeToolbarGuide() {
        this.setState({ isShowToolbarGuide: false });
    }

    renderGames() {
        const { userStakeLevel, openGameName, authorizeInfo } = this.state;
        const offerGames: number[] = authorizeInfo?.user?.offerGames?.map((game: any) => game?.gameId) ?? [];
        const urlContext = loadURLContext();
        console.log("renderGames", urlContext.gameId);
        return (
            <Games
                setApiErrorMessage={this.handleShowApiErrorMessage}
                userOfferGames={offerGames}
                userStakeLevel={userStakeLevel}
                updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                openGameId={urlContext.gameId}
                openGameName={openGameName}
            />
        );
    }

    openGameFromLobby(gameId: number) {
        updateURLContext({ backToLobby: true, gameId: gameId });
        console.log("openGameFromLobby", gameId);
        if (this.state.openGameId != gameId) {
            this.setState({ openGameId: gameId });
        } else {
            this.forceUpdate(); // TODO: Temporary force rerender, should review here
        }
    }

    renderLobby() {
        const { lobbyConfigs } = this.state;
        updateURLContext({ backToLobby: true });
        return <Lobby openGame={(gameId) => this.openGameFromLobby(gameId)} lobbyConfigs={lobbyConfigs} socket={this.state.lobbySocket} />;
    }

    renderDashBoard() {
        const { isShowErrorModal, authorizeInfo, isBlockUI, isShowToolbarGuide } = this.state;
        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
        };

        const offerGames: number[] = authorizeInfo?.user?.offerGames?.map((game: any) => game?.gameId) ?? [];
        const isRenderGames = this.shouldRenderGames(offerGames);

        console.log("renderDashBoard", { isRenderGames });

        return (
            <PlayerContextProvider value={authContextValue}>
                <SettingContextProvider>
                    <div className={`${Styles["dashboard"]}`} id={"dashboard"}>
                        <Header
                            openingGameId={this.state.openGameId}
                            user={authorizeInfo.user}
                            toggleAnnouncementModal={this.toggleAnnouncementModal}
                            offerGames={offerGames}
                            isShowToolbarGuide={isShowToolbarGuide}
                            isRenderGames={isRenderGames}
                        />

                        {isRenderGames ? this.renderGames() : this.renderLobby()}

                        <Footer />

                        {isShowErrorModal && (
                            <div className={Styles["container-modal"]}>
                                <div className={`${Styles["bg-opacity"]} ${isBlockUI ? Styles["block-ui-backdrop"] : ""}`}></div>
                                <BaseDialog
                                    type={ModalType.Center}
                                    isOpen={isShowErrorModal}
                                    onCloseModal={this.closeDialog}
                                    isBlockUI={isBlockUI}
                                >
                                    <div className={`modal-center red-color ${isBlockUI ? Styles["block-ui-message"] : ""}`}>
                                        {!isBlockUI && <div className={`icon-close modal-icon-close`} onClick={this.closeDialog}></div>}
                                        <ErrorApiText
                                            errorMessage={this.state.apiError?.message}
                                            errorCode={this.state.apiError?.errorCode}
                                        />
                                    </div>
                                </BaseDialog>
                            </div>
                        )}
                    </div>
                </SettingContextProvider>
            </PlayerContextProvider>
        );
    }

    autoCreateNickname = async () => {
        const { session } = this.props;
        const nickname = NameGenerator.generateName();
        const maxAvatarId = MAX_AVATAR_ID;
        const selectedAvatarId = randomInteger(1, maxAvatarId);
        const response = await createNickname(session, nickname, selectedAvatarId);
        const authorizeResponse = response as any;
        if (authorizeResponse?.authorized) {
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            this.handleRegister(authorizeResponse);
        } else {
            this.signOut();
        }
    };

    renderComponents = (authorizeInfo: AuthorizeResponse) => {
        const { authorized } = authorizeInfo;

        if (authorized) {
            return this.renderDashBoard();
        }

        return <Register session={this.props.session} handleStateLogin={this.handleRegister} />;
    };

    renderGoogleAnalytic() {
        if (getAppSettings().googleAnalyticId == null) {
            return <></>;
        }

        return (
            <>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${getAppSettings().googleAnalyticId}`}></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            globalThis.dataLayer = globalThis.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${getAppSettings().googleAnalyticId}', {
                            page_path: globalThis.location.pathname,
                            });
                        `,
                    }}
                />
            </>
        );
    }

    render() {
        const { authorizeInfo } = this.state;

        return authorizeInfo ? (
            <>
                <Head>{this.renderGoogleAnalytic()}</Head>
                {this.renderComponents(authorizeInfo)}
            </>
        ) : (
            <></>
        );
    }
}

export default withRouter(Dashboard);
