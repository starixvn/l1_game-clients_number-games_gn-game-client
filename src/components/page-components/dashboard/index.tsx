import { withRouter } from "next/router";
import React from "react";
import { isMobile, isMobileOnly } from "react-device-detect";
import { AuthorizeResponse, ReCheckInResponse } from "sc-user-service-client/dist/auth";
import { LobbyResponse } from "sc-user-service-client/dist/lobby";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";

import dynamic from "next/dynamic";
import { getAppSettings } from "../../../_shared/app-settings";
import { Themes } from "../../../_shared/constants";
import {
    buildUrl,
    getLobbyGameIds,
    GetLocalizedErrorMessage,
    getOfferGamesIds,
    getSwipeableGameId,
    localStorageKeys,
    StorageHelper,
} from "../../../_shared/helpers";
import { randomInteger } from "../../../_shared/helpers/number-helper";
import {
    loadURLContext,
    LobbyConnectionContextProvider,
    PlayerContextProvider,
    SettingContextProvider,
    updateURLContext,
    URLContextModel,
} from "../../../_shared/react-contexts";

import "../../../games/scoreboards";
import { authorize, createNickname, getLobbyConfigs, reCheckIn } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import Lobby from "../lobby/lobby";
import { LobbySocketConnection } from "../lobby/lobby-socket-connection";
import Styles from "./dashboard.module.scss";
import Register from "./register";
import { MAX_AVATAR_ID } from "./register/avatar-gallery";
import NameGenerator from "./register/name-generator";
import { ILobbyConfigs, Props, State } from "./type";

const Games = dynamic(() => import("../../../games/games"));
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;
    private readonly lobbyConnectionHandler: LobbySocketConnection;
    private headerRef = React.createRef<HTMLDivElement>();
    private gameStyleInterval: NodeJS.Timeout;

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
            lobbyConfigs: null,
            openGameId: null,
            openGameName: "",
            isOnLobby: true,
            isLandscapeMode: false,
            isUserGesture: null,
            isChangedGame: false,
            isChangePrevGame: false,
        };

        this.lobbyConnectionHandler = new LobbySocketConnection();

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
        this.handleRecheckInResponse = this.handleRecheckInResponse.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.openGameFromLobby = this.openGameFromLobby.bind(this);
        this.removeGameTransmitter = this.removeGameTransmitter.bind(this);
        this.reconnectGameTransmitter = this.reconnectGameTransmitter.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
        // this.swipeableHandler = this.swipeableHandler.bind(this);
        this.changeOrientation = this.changeOrientation.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }
    }

    updateAuthorizeInfo(authorizeInfo: AuthorizeResponse) {
        const clonedAuthorizeInfo = { ...authorizeInfo };
        if (authorizeInfo?.authorized) {
            clonedAuthorizeInfo.user.settings = { ...clonedAuthorizeInfo.user.settings, quickBet: true };
        }

        this.checkOfferedGame(clonedAuthorizeInfo);
        this.setState({ authorizeInfo: clonedAuthorizeInfo });
    }

    updateUserBalance(balance: number) {
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo && authorizeInfo.authorized && authorizeInfo.user.red !== balance) {
            authorizeInfo.user.settings.quickBet = true;
            authorizeInfo.user.red = balance;
            this.setState({ authorizeInfo });
        }
    }

    updateAvatar(avatarId: number) {
        const authorizeInfo = { ...this.state.authorizeInfo };
        authorizeInfo.user.avatarId = avatarId;
        this.setState({ authorizeInfo });
    }

    handleShowApiErrorMessage(errorCode: string, isDisableAccount = false) {
        const kickedOutErrorCodes = ["1001", "1002", "7001"];
        if (isDisableAccount || kickedOutErrorCodes.includes(errorCode)) {
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
            this.setState({ isUserGesture: true });
        } else {
            this.setState({ isUserGesture: false });
        }
    }

    changeOrientation() {
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            this.setState({ isLandscapeMode });
        }, 100);
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
            return this.autoCreateNickname();
        }

        const lobbyConfigs = await this.getAllLobbyConfigs();
        await this.connectLobbySocket(authorizeInfo, lobbyConfigs);
        this.updateAuthorizeInfo(authorizeInfo);
        this.updateUserBalance(authorizeInfo?.user?.red);

        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);

        if (isMobile) {
            this.changeOrientation();
            window.addEventListener("resize", this.changeOrientation);
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }
        this.handleUserGesture();
        this.connectNotificationSocket();
        queryGame && this.openGame(queryGame);
    }

    private handleUserGesture() {
        const timeoutId = setTimeout(() => {
            if (!this.state.isUserGesture) {
                this.setState({ isUserGesture: true });
            }
        }, 10 * 1000);

        if (isMobile) {
            window.addEventListener("touchstart", () => {
                this.enableUserGesture(timeoutId);
            });
        } else {
            window.addEventListener("click", () => {
                this.enableUserGesture(timeoutId);
            });
        }
    }

    private enableUserGesture(timeoutId: NodeJS.Timeout) {
        if (!this.state.isUserGesture) {
            this.setState({ isUserGesture: true });
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    shouldRenderGames(offerGames) {
        const urlContextModel = StorageHelper.get(localStorageKeys.url) as URLContextModel;
        const backToLobby = urlContextModel.backToLobby || false;
        const ssoRedirectGameId = urlContextModel.gameId || 0;
        return (offerGames.includes(this.state.openGameId) && !backToLobby) || ssoRedirectGameId > 0;
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.setState({ isUserGesture: false });
        this.notificationSocket?.close();
        this.lobbyConnectionHandler.closeSocket();
        clearInterval(this.reCheckInInterval);
        clearInterval(this.gameStyleInterval);
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

    connectLobbySocket = async (authorizeInfo: AuthorizeResponse, lobbyConfigs: ILobbyConfigs) => {
        const { gameId } = loadURLContext();
        const offerGamesIds = getOfferGamesIds(authorizeInfo)?.filter((id) => id !== gameId);
        const { gameSettings } = getAppSettings();
        const lobbyGamesIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId) && gameSettings[gameId]);

        if (!authorizeInfo?.authorized || lobbyGamesIds?.length === 0) {
            return;
        }
        await this.lobbyConnectionHandler.initLobbySocket(this.props.session, lobbyGamesIds);
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

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        this.setState({ userStakeLevel: userStakeLevel });
    }

    async handleRegister(authorizeInfo: AuthorizeResponse) {
        const { session } = this.props;

        updateSignInSMStatus(session);
        authorizeInfo.user.isSignedInSM = true;

        const lobbyConfigs = await this.getAllLobbyConfigs();
        await this.connectLobbySocket(authorizeInfo, lobbyConfigs);
        this.updateAuthorizeInfo(authorizeInfo);
    }

    closeDialog() {
        this.setState({ isShowErrorModal: false });
        this.isKickOut && this.signOut();
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

    async getAllLobbyConfigs() {
        const { session } = this.props;
        const lobby: LobbyResponse = await getLobbyConfigs(session);
        if (lobby?.lobbyConfigs) {
            this.setState({ lobbyConfigs: lobby?.lobbyConfigs });
        } else {
            console.error("Can not get Lobby configs");
        }
        return lobby?.lobbyConfigs;
    }

    // swipeableHandler = (isPrevGame: boolean, currentGameId: number) => {
    //     const { lobbyConfigs, authorizeInfo } = this.state;
    //     const offerGamesIds = getOfferGamesIds(authorizeInfo);
    //     const lobbyGamesIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));

    //     this.openGame(getSwipeableGameId(isPrevGame, currentGameId, lobbyGamesIds));

    //     this.setState({ isChangedGame: true });

    //     this.gameStyleInterval && clearInterval(this.gameStyleInterval);

    //     this.gameStyleInterval = setInterval(() => {
    //         this.setState({ isChangedGame: false });
    //     }, 700);
    //     window.scrollTo(0, 0);
    //     this.setState({ isChangePrevGame: isPrevGame });
    // };

    renderGames() {
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();
        console.log("renderGames", urlContext.gameId);
        return (
            <Games
                setApiErrorMessage={this.handleShowApiErrorMessage}
                userStakeLevel={userStakeLevel}
                updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                openGameId={urlContext.gameId}
                openGameName={openGameName}
                directMode={this.props.directMode}
            />
        );
    }

    openGameFromLobby(gameId: number) {
        updateURLContext({ backToLobby: true, gameId: gameId });
        window.scrollTo(0, 0);
        if (this.state.openGameId !== gameId) {
            this.removeGameTransmitter(gameId);
            this.setState({ openGameId: gameId });
        } else {
            this.forceUpdate(); // TODO: Temporary force rerender, should review here
        }
    }

    renderLobby() {
        const { lobbyConfigs } = this.state;
        updateURLContext({ backToLobby: true });
        const lobbyConnectionContextValue = {
            socket: this.lobbyConnectionHandler.getSocket(),
            gameTransmitters: this.lobbyConnectionHandler.getTransmitters(),
            removeGameTransmitter: this.removeGameTransmitter,
            reconnectGameTransmitter: this.reconnectGameTransmitter,
        };
        return (
            <LobbyConnectionContextProvider value={lobbyConnectionContextValue}>
                <Lobby openGame={(gameId) => this.openGameFromLobby(gameId)} lobbyConfigs={lobbyConfigs} />
            </LobbyConnectionContextProvider>
        );
    }

    removeGameTransmitter(gameId: number) {
        this.lobbyConnectionHandler.unsubscribeGame(gameId);
    }

    reconnectGameTransmitter(gameId: number) {
        this.lobbyConnectionHandler.signInGame(this.props.session, gameId);
        return this.lobbyConnectionHandler.initGameTransmitter(gameId);
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, openGameId, isChangedGame, isChangePrevGame } = this.state;
        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
            updateAvatar: this.updateAvatar,
        };

        const offerGames = getOfferGamesIds(authorizeInfo);
        const isRenderGames = this.shouldRenderGames(offerGames);
        const allowSwipeGameOndDesktop = !this.props.directMode && !isMobileOnly && isRenderGames;

        console.log("renderDashBoard", { isRenderGames });

        const changeGameStyle =
            isChangedGame && allowSwipeGameOndDesktop ? (isChangePrevGame ? Styles["slide-left"] : Styles["slide-right"]) : "";

        return (
            <PlayerContextProvider value={authContextValue}>
                <SettingContextProvider>
                    {allowSwipeGameOndDesktop && (
                            <button className={`${Styles["prev-button"]}`}>
                            <span className={`icon-back ${Styles["icon"]}`}></span>
                        </button>
                    )}
                    <div
                        className={`${Styles["dashboard"]} ${changeGameStyle} ${!isRenderGames ? "no-scroll" : ""} ${
                            isMobileOnly ? Styles["hidden-scrollbar"] : {}
                        }`}
                        id={"dashboard"}
                    >
                        <Header headerRef={this.headerRef} openingGameId={openGameId} isRenderGames={isRenderGames} />

                        {isRenderGames ? this.renderGames() : this.renderLobby()}

                        {!isRenderGames && <Footer />}
                        {this.state.isUserGesture != null ? <MusicPlayer isUserGesture={this.state.isUserGesture} /> : <></>}

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
                    {allowSwipeGameOndDesktop && (
                            <button className={`${Styles["next-button"]}`}>
                            <span className={`icon-back ${Styles["icon"]}`}></span>
                        </button>
                    )}
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
            await this.handleRegister(authorizeResponse);
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

    render() {
        const { authorizeInfo, isLandscapeMode } = this.state;

        if (isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }

        return authorizeInfo ? <>{this.renderComponents(authorizeInfo)}</> : <></>;
    }
}

export default withRouter(Dashboard);
