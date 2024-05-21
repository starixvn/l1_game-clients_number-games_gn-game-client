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

import SwiperCore from "swiper";
import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import "../../../games/scoreboards";
import { reCheckIn } from "../../../services/auth-service";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import Lobby from "../lobby/lobby";
import ButtonSwipe from "./button-swipe";
import Styles from "./dashboard.module.scss";
import { Props, State } from "./type";
import { GlobalMessageTransmitter, GlobalTransmitterEvent, registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { DashboardHandler } from "./dash-board-handler";

const Games = dynamic(() => import("../../../games/games"));
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;
    private readonly dashboardHandler: DashboardHandler;
    private readonly swiperRef = React.createRef<SwiperCore>();
    private updateGameIdDashboardId: any;

    constructor(props: Props) {
        super(props);

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            isShowErrorModal: false,
            apiError: null,
            isShowAnnouncement: false,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            isJoinGame: false,
            openGameId: null,
            openGameName: "",
            isLandscapeMode: false,
            isChangedGame: false,
            isChangePrevGame: false,
        };

        this.registerMainSocketEvent = this.registerMainSocketEvent.bind(this);
        this.handleKickedOut = this.handleKickedOut.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.handleReload = this.handleReload.bind(this);
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
        this.changeOrientation = this.changeOrientation.bind(this);
        this.updateGameIdDashboardEvent = this.updateGameIdDashboardEvent.bind(this);

        this.dashboardHandler = new DashboardHandler({
            authorizeInfo: this.props.authorizeResponse,
            session: this.props.session,
            lobbyConfigs: this.props.lobbyConfigs
        });

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }
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
    }

    async componentDidMount() {
        if (typeof window === "undefined") {
            return;
        }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        const { queryGame, authorizeResponse, session } = this.props;


        this.updateGameIdDashboardId = registerGlobalMessageEvent("updateGameIdDashboard", async () => this.updateGameIdDashboardEvent());

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeResponse?.user?.red });
        // this.updateUserBalance(authorizeResponse?.user?.red);

        this.checkOfferedGame(authorizeResponse);

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
        this.dashboardHandler.lobbyConnection.closeSocket();
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
                lobbyGamesIds={this.dashboardHandler.getLobbyGamesIds()}
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
        updateURLContext({ backToLobby: true });
        const lobbyConnectionContextValue = {
            socket: this.dashboardHandler.lobbyConnection.getSocket(),
            gameTransmitters: this.dashboardHandler.lobbyConnection.getTransmitters(),
            removeGameTransmitter: this.removeGameTransmitter,
            reconnectGameTransmitter: this.reconnectGameTransmitter,
        };

        return (
            <LobbyConnectionContextProvider value={lobbyConnectionContextValue}>
                <Lobby openGame={(gameId) => this.openGameFromLobby(gameId)} lobbyConfigs={this.props.lobbyConfigs} />
            </LobbyConnectionContextProvider>
        );
    }

    removeGameTransmitter(gameId: number) {
        this.dashboardHandler.lobbyConnection.unsubscribeGame(gameId);
    }

    reconnectGameTransmitter(gameId: number) {
        console.log(`reconnectGameTransmitter: ${gameId}`)
        this.dashboardHandler.lobbyConnection.signInGame(this.props.session, gameId);
        return this.dashboardHandler.lobbyConnection.initGameTransmitter(gameId);
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, isBlockUI, isChangedGame, isChangePrevGame } = this.state;
        const { authorizeResponse } = this.props;

        const authContextValue = {
            authorizeInfo: authorizeResponse,
            session: this.props.session,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeResponse.user?.fractionalOddsFormat ?? false,
            enableQuickBet: true
        };

        const offerGames = getOfferGamesIds(authorizeResponse);
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
        const { isLandscapeMode } = this.state;

        if (isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }

        return this.props.authorizeResponse?.authorized ? <>{this.renderDashboard()}</> : <></>;
    }
}

export default withRouter(Dashboard);
