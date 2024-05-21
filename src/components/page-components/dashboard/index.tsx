import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import { isMobile, isMobileOnly } from "react-device-detect";
import { GetLocalizedErrorMessage, StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import {
    GetLocalizedErrorMessage,
    localStorageKeys,
    StorageHelper,
} from "../../../_shared/helpers";
import {
    loadURLContext,
    LobbyConnectionContextProvider,
    PlayerContextProvider,
    SettingContextProvider,
    loadURLContext,
    updateURLContext,
} from "../../../_shared/react-contexts";

import SwiperCore from "swiper";
import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
import "../../../games/scoreboards";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import Lobby from "../lobby/lobby";
import ButtonSwipe from "./button-swipe";
import { DashboardHandler } from "./dash-board-handler";
import Styles from "./dashboard.module.scss";
import { DashboardProps, DashboardState } from "./type";
import { registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";

const Games = dynamic(() => import("../../../games/games"));
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.PureComponent<DashboardProps, DashboardState> {
    private readonly dashboardHandler: DashboardHandler;
    private readonly notificationHandler: NotificationHandler;
    private readonly swiperRef = React.createRef<SwiperCore>();
    private updateGameIdDashboardId: string;

    constructor(
        props: DashboardProps,
        state: DashboardState,
        dashboardHandler: DashboardHandler = null,
        notificationHandler: NotificationHandler = null) {
        super(props);

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            isShowErrorModal: false,
            apiError: null,
            isShowAnnouncement: false,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            openGameId: null,
            openGameName: "",
            isLandscapeMode: false,
            isChangedGame: false,
            isChangePrevGame: false,
        };

        this.closeDialog = this.closeDialog.bind(this);
        this.showApiErrorMessage = this.showApiErrorMessage.bind(this);
        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.toggleAnnouncementModal = this.toggleAnnouncementModal.bind(this);
        this.openGame = this.openGame.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.openGameFromLobby = this.openGameFromLobby.bind(this);
        this.changeOrientation = this.changeOrientation.bind(this);
        this.resetGameIdDashboardEvent = this.resetGameIdDashboardEvent.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }

        this.dashboardHandler = dashboardHandler ?? new DashboardHandler(this.props, this.signOut);

        this.notificationHandler = notificationHandler ?? new NotificationHandler(
            this.props.session,
            this.props.setIsUm,
            this.showApiErrorMessage,
            this.signOut);
    }

    async onVisibilityChange() {
        if (!document["hidden"]) {
            this.notificationHandler.handleReCheckIn();
        }
    }

    changeOrientation() {
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            this.setState({ isLandscapeMode });
        }, 100);
    }

    async resetGameIdDashboardEvent() {
        this.setState({ openGameId: 0 });
    }

    async componentDidMount() {
        if (typeof window === "undefined") {
            return;
        }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.updateGameIdDashboardId = registerGlobalMessageEvent(GlobalTransmitterEvent.UPDATE_GAME_ID_DASHBOARD, async () =>
            this.resetGameIdDashboardEvent()
        );

        if (this.dashboardHandler.checkIsNotOfferGame()) {
            this.setState({
                apiError: {
                    message: ErrorNoGameOffer,
                    errorCode: "",
                },
                isShowErrorModal: true,
                isBlockUI: true,
            });
        }

        if (isMobile) {
            this.changeOrientation();
            window.addEventListener("resize", this.changeOrientation);
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }

        const { queryGame } = this.props;
        queryGame && this.openGame(queryGame);
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    componentWillUnmount() {
        unsubscribeGlobalMessageEvent(this.updateGameIdDashboardId as any);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        this.notificationHandler.reset();
        this.dashboardHandler.reset();
    }

    signOut() {
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        this.setState({ userStakeLevel });
    }

    showApiErrorMessage(errorCode: string) {
        this.setState({ isShowErrorModal: true, isBlockUI: false, apiError: { errorCode, message: GetLocalizedErrorMessage(errorCode) } });
    }

    closeDialog() {
        this.setState({ isShowErrorModal: false });
        this.notificationHandler.isKickOut && this.signOut();
    }

    toggleAnnouncementModal() {
        const { isShowAnnouncement } = this.state;
        this.setState({ isShowAnnouncement: !isShowAnnouncement });
    }

    openGame(gameId: number) {
        this.setState({ queryGame: gameId, openGameId: gameId });
        updateURLContext({ gameId });
    }

    renderGames() {
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();

        return (
            <Games
                setApiErrorMessage={this.notificationHandler.handleShowApiErrorMessage}
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
            this.dashboardHandler.removeGameTransmitter(gameId);
            this.setState({ openGameId: gameId });
        } else {
            this.forceUpdate();
        }
    }

    renderLobby() {
        updateURLContext({ backToLobby: true });

        return (
            <LobbyConnectionContextProvider value={this.dashboardHandler.buildLobbyConnectionContextValue()}>
                <Lobby openGame={(gameId: number) => this.openGameFromLobby(gameId)} lobbyConfigs={this.props.lobbyConfigs} />
            </LobbyConnectionContextProvider>
        );
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, isBlockUI, isChangedGame, isChangePrevGame, openGameId } = this.state;
        const offerGames = this.dashboardHandler.getOfferGamesIds();
        const isRenderGames = this.dashboardHandler.shouldRenderGames(offerGames, openGameId);
        const allowSwipeGameOndDesktop = !this.props.directMode && !isMobileOnly && isRenderGames;

        const allowSwipeGameOndDesktopStyle = isChangePrevGame ? Styles["slide-left"] : Styles["slide-right"];
        const changeGameStyle = isChangedGame && allowSwipeGameOndDesktop ? allowSwipeGameOndDesktopStyle : "";
        const isNoGameOffer = this.state.apiError?.message === ErrorNoGameOffer;
        const renderOfferGameContainer = () => (isRenderGames ? this.renderGames() : this.renderLobby());

        return (
            <PlayerContextProvider value={this.dashboardHandler.buildAuthContextValue()}>
                <SettingContextProvider>
                    {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={true} swiper={this.swiperRef} />}
                    <div
                        className={`${Styles["dashboard"]} ${changeGameStyle} ${!isRenderGames ? "no-scroll" : ""} ${
                            isMobileOnly ? Styles["hidden-scrollbar"] : ""
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

    render() {
        if (this.state.isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }

        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
