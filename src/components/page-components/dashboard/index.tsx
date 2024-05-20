import { withRouter } from "next/router";
import React from "react";
import { isMobile, isMobileOnly } from "react-device-detect";
import { AuthorizeResponse, ReCheckInResponse } from "sc-user-service-client/dist/auth";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";

import dynamic from "next/dynamic";
import { getAppSettings } from "../../../_shared/app-settings";
import {
    buildUrl,
    getLobbyGameIds,
    GetLocalizedErrorMessage,
    getOfferGamesIds,
    isKickOutError,
    localStorageKeys,
    StorageHelper,
} from "../../../_shared/helpers";
import {
    loadURLContext,
    LobbyConnectionContextProvider,
    PlayerContextProvider,
    SettingContextProvider,
    updateURLContext,
} from "../../../_shared/react-contexts";

import { LobbyConfigs, LobbyResponse } from "sc-user-service-client/dist/lobby";
import SwiperCore from "swiper";
import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import "../../../games/scoreboards";
import { getLobbyConfigs, reCheckIn } from "../../../services/auth-service";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import Lobby from "../lobby/lobby";
import { LobbySocketConnection } from "../lobby/lobby-socket-connection";
import ButtonSwipe from "./button-swipe";
import Styles from "./dashboard.module.scss";
import { ILobbyConfigs, Props, State } from "./type";
import { GlobalMessageTransmitter, GlobalTransmitterEvent, registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";

const Games = dynamic(() => import("../../../games/games"));
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;
    private readonly lobbyConnectionHandler: LobbySocketConnection;
    private readonly swiperRef = React.createRef<SwiperCore>();
    private updateGameIdDashboardId: any;

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
            isChangedGame: false,
            isChangePrevGame: false,
            isQuickBet: true,
        };

        this.lobbyConnectionHandler = new LobbySocketConnection();

        this.registerMainSocketEvent = this.registerMainSocketEvent.bind(this);
        this.handleKickedOut = this.handleKickedOut.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.updateAuthorizeInfo = this.updateAuthorizeInfo.bind(this);
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
        this.getLobbyGamesIds = this.getLobbyGamesIds.bind(this);
        this.changeOrientation = this.changeOrientation.bind(this);
        this.updateGameIdDashboardEvent = this.updateGameIdDashboardEvent.bind(this);

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


    handleShowApiErrorMessage(errorCode: string, isDisableAccount = false) {
        if (isDisableAccount || isKickOutError(errorCode)) {
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
                    message: ErrorNoGameOffer,
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
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: response.balance });
        }
    }

    async onVisibilityChange() {
        if (!document["hidden"]) {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
        }
    }

    changeOrientation() {
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            this.setState({ isLandscapeMode });
        }, 100);
    }

    async updateGameIdDashboardEvent() {
        this.setState({ openGameId: 0 });
        console.log("updateGameIdDashboard");
        console.log({ ...this.state.lobbyConfigs });
    }

    async componentDidMount() {
        if (typeof window === "undefined") {
            return; ``
        }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        const { queryGame, authorizeResponse, session, lobbyConfigs } = this.props;
        console.log("componentDidMount");
        console.log("authorizeResponse--------", authorizeResponse, lobbyConfigs);
        this.updateLobbyConfigs(lobbyConfigs as LobbyConfigs);

        this.updateGameIdDashboardId = registerGlobalMessageEvent("updateGameIdDashboard", async () => this.updateGameIdDashboardEvent());

        await this.connectLobbySocket(authorizeResponse, lobbyConfigs);

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeResponse?.user?.red });
        // this.updateUserBalance(authorizeResponse?.user?.red);

        this.updateAuthorizeInfo(authorizeResponse);

        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);

        if (isMobile) {
            this.changeOrientation();
            window.addEventListener("resize", this.changeOrientation);
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }
        this.connectNotificationSocket();
        queryGame && this.openGame(queryGame);
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    shouldRenderGames(offerGames) {
        const urlContextModel = JSON.parse(localStorage.getItem("urlContext")); //StorageHelper.get<URLContextModel>(localStorageKeys.url);
        const backToLobby = urlContextModel.backToLobby || false;
        const ssoRedirectGameId = urlContextModel.gameId || 0;
        return (offerGames.includes(this.state.openGameId) && !backToLobby) || ssoRedirectGameId > 0;
    }

    componentWillUnmount() {
        unsubscribeGlobalMessageEvent(this.updateGameIdDashboardId as any);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.notificationSocket?.close();
        this.lobbyConnectionHandler.closeSocket();
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

    connectLobbySocket = async (authorizeInfo: AuthorizeResponse, lobbyConfigs: ILobbyConfigs) => {

        const { gameId } = loadURLContext();
        const offerGamesIds = getOfferGamesIds(authorizeInfo)?.filter((id) => id !== gameId);
        const { gameSettings } = getAppSettings();
        const lobbyGamesIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId) && gameSettings[gameId]);
        console.log(`connectLobbySocket lobbyGamesIds`)
        console.log({ ...lobbyGamesIds })
        if (!authorizeInfo?.authorized || lobbyGamesIds?.length === 0) {
            console.log(`False connectLobbySocket lobbyGamesIds`)
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
            this.updateLobbyConfigs(lobby?.lobbyConfigs);
        } else {
            console.error("Can not get Lobby configs");
        }
        return lobby?.lobbyConfigs;
    }

    updateLobbyConfigs(lobbyConfigs: LobbyConfigs) {
        this.setState({ lobbyConfigs });
    }

    getLobbyGamesIds = () => {
        const { lobbyConfigs, authorizeInfo } = this.state;
        const offerGamesIds = getOfferGamesIds(authorizeInfo);
        console.log('getLobbyGamesIds')
        console.log({ ...offerGamesIds })
        return getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
    };

    renderGames() {
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();
        return (
            <Games
                setApiErrorMessage={this.handleShowApiErrorMessage}
                userStakeLevel={userStakeLevel}
                updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                openGameId={urlContext.gameId}
                openGameName={openGameName}
                directMode={this.props.directMode}
                lobbyGamesIds={this.getLobbyGamesIds()}
                swiperRef={this.swiperRef}
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
            this.forceUpdate();
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
        console.log(`reconnectGameTransmitter: ${gameId}`)
        this.lobbyConnectionHandler.signInGame(this.props.session, gameId);
        return this.lobbyConnectionHandler.initGameTransmitter(gameId);
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, isChangedGame, isChangePrevGame } = this.state;
        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
        };

        const offerGames = getOfferGamesIds(authorizeInfo);
        const isRenderGames = this.shouldRenderGames(offerGames);
        const allowSwipeGameOndDesktop = !this.props.directMode && !isMobileOnly && isRenderGames;

        const allowSwipeGameOndDesktopStyle = isChangePrevGame ? Styles["slide-left"] : Styles["slide-right"];
        const changeGameStyle = isChangedGame && allowSwipeGameOndDesktop ? allowSwipeGameOndDesktopStyle : "";
        const isNoGameOffer = this.state.apiError?.message === ErrorNoGameOffer;
        const renderOfferGameContainer = () => (isRenderGames ? this.renderGames() : this.renderLobby());
        return (
            <PlayerContextProvider value={authContextValue}>
                <SettingContextProvider>
                    {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={true} swiper={this.swiperRef} />}
                    <div
                        className={`${Styles["dashboard"]} ${changeGameStyle} ${!isRenderGames ? "no-scroll" : ""} ${isMobileOnly ? Styles["hidden-scrollbar"] : ""
                            }`}
                        id={"dashboard"}
                    >
                        <Header />

                        {isNoGameOffer ? <></> : renderOfferGameContainer()}

                        {isNoGameOffer ? <></> : !isRenderGames && <Footer />}
                        {<MusicPlayer />}

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
                    {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={false} swiper={this.swiperRef} />}
                </SettingContextProvider>
            </PlayerContextProvider>
        );
    }

    renderDashboard = () => {
        return this.renderDashBoard();
    };

    render() {
        const { authorizeInfo, isLandscapeMode } = this.state;
        console.log("authorizeInfo--", authorizeInfo);

        if (isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }

        return authorizeInfo?.authorized ? <>{this.renderDashboard()}</> : <></>;
    }
}

export default withRouter(Dashboard);
