import "../../../games/scoreboards";

import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import { isDesktop, isMobile, isMobileOnly } from "react-device-detect";
import SwiperCore from "swiper";

import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import { GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import {
    GlobalMessageTransmitter,
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
import {
    loadURLContext,
    LobbyConnectionContextProvider,
    PlayerContextProvider,
    SettingContextProvider,
    updateURLContext,
} from "../../../_shared/react-contexts";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import Footer from "../../game-components/footer";
import Header from "../header";
import Lobby from "../lobby/lobby";
import { LobbyGameTransmitter } from "../lobby/lobby-socket-connection";
import ButtonSwipe from "./button-swipe";
import Styles from "./dashboard.module.scss";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import { LoadingSpinner } from "../../game-components/game-loading/loading-spinner";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"));
const Games = dynamic(() => import("../../../games/games"), { loading: () => <LoadingSpinner /> });
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.Component<DashboardProps, DashboardState> {
    private readonly dashboardHandler: DashboardHandler;
    private readonly notificationHandler: NotificationHandler;
    private readonly swiperRef = React.createRef<SwiperCore>();
    private backToLobbyEventId = null;
    private isUpdatingBalance = false;

    constructor(
        props: DashboardProps,
        state: DashboardState,
        dashboardHandler: DashboardHandler = null,
        notificationHandler: NotificationHandler = null
    ) {
        super(props);

        // console.log("[Dashboard] constructor - Props received:", {
        //     queryGame: props.queryGame,
        //     directMode: props.directMode,
        //     authorizeResponse: props.authorizeResponse,
        //     lobbyConfigs: props.lobbyConfigs
        // });

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            authorizeInfo: this.props.authorizeResponse,
            isShowErrorModal: false,
            apiError: null,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            openGameId: null,
            openGameName: "",
            isLandscapeMode: false,
            isChangedGame: false,
            isChangePrevGame: false,
            gameTransmitters: {},
            dashBoardHeight: 0,
        };

        // console.log("[Dashboard] constructor - Initial state set:", {
        //     queryGame: this.state.queryGame,
        //     openGameId: this.state.openGameId,
        //     authorizeInfo: this.state.authorizeInfo
        // });

        this.closeDialog = this.closeDialog.bind(this);
        this.showApiErrorMessage = this.showApiErrorMessage.bind(this);
        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.openGame = this.openGame.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.openGameFromLobby = this.openGameFromLobby.bind(this);
        this.changeOrientation = this.changeOrientation.bind(this);
        this.resetGameIdDashboardEvent = this.resetGameIdDashboardEvent.bind(this);
        this.updateGameTransmitters = this.updateGameTransmitters.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }

        this.dashboardHandler = dashboardHandler ?? new DashboardHandler(this.props, this.updateGameTransmitters);

        this.notificationHandler =
            notificationHandler ??
            new NotificationHandler(this.props.session, this.props.setIsUm, this.updateUserBalance, this.showApiErrorMessage, this.signOut);

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: this.props.authorizeResponse.user.red });

        // console.log("[Dashboard] constructor - Dashboard initialized successfully");
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        // console.log("[Dashboard] updateUserBalance - Called with:", { balance, setBalanceByPlaceBet, currentBalance: this.state.authorizeInfo.user.red });

        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeInfo.user.red });
            this.isUpdatingBalance = setBalanceByPlaceBet;
            this.setState({ authorizeInfo });
            // console.log("[Dashboard] updateUserBalance - Balance updated to:", balance);
        } else {
            // console.log("[Dashboard] updateUserBalance - Balance unchanged, no update needed");
        }
    };

    onVisibilityChange() {
        // console.log("[Dashboard] onVisibilityChange - Document visibility changed, hidden:", document["hidden"]);
        if (!document["hidden"]) {
            // console.log("[Dashboard] onVisibilityChange - Document became visible, calling handleReCheckIn");
            this.notificationHandler.handleReCheckIn();
        }
    }

    changeOrientation() {
        // console.log("[Dashboard] changeOrientation - Called");
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            // console.log("[Dashboard] changeOrientation - Setting landscape mode:", isLandscapeMode);
            this.setState({ isLandscapeMode });
        }, 100);
    }

    resetGameIdDashboardEvent() {
        // console.log("[Dashboard] resetGameIdDashboardEvent - Resetting openGameId to 0");
        this.setState({ openGameId: 0 });
        this.forceUpdate();
    }

    updateGameTransmitters(gameTransmitters: Record<number, LobbyGameTransmitter>) {
        // console.log("[Dashboard] updateGameTransmitters - Updating game transmitters:", Object.keys(gameTransmitters));
        this.setState({ gameTransmitters });
    }

    shouldComponentUpdate(nextProps: Readonly<DashboardProps>, nextState: Readonly<DashboardState>, nextContext: any): boolean {
        if (this.state.openGameId > 0 && this.isUpdatingBalance) {
            // console.log("[Dashboard] shouldComponentUpdate - Blocking update due to balance update in progress");
            this.isUpdatingBalance = false;
            return false;
        }

        return true;
    }

    async componentDidMount() {
        // console.log("[Dashboard] componentDidMount - Starting component initialization");

        const { dashBoardHeight } = this.state;

        const zoomGame = +getComputedStyle(document.getElementById("dashboard")).getPropertyValue("--zoom-game");

        if (isDesktop && dashBoardHeight !== window.innerHeight) {
            const scaleHeight = document.getElementById("dashboard").clientHeight * zoomGame;
            this.setState({
                dashBoardHeight: window.innerHeight + (window.innerHeight - scaleHeight) * (window.innerHeight / scaleHeight),
            });
        }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.backToLobbyEventId = registerGlobalMessageEvent(GlobalTransmitterEvent.BACK_TO_LOBBY, async () =>
            this.resetGameIdDashboardEvent()
        );

        // console.log("[Dashboard] componentDidMount - Checking if game is not in offer");
        if (this.dashboardHandler.checkIsNotOfferGame()) {
            // console.log("[Dashboard] componentDidMount - Game not in offer, showing error modal");
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
        if (queryGame) {
            // console.log("[Dashboard] componentDidMount - Opening game from queryGame:", queryGame);
            this.openGame(queryGame);
        } else {
            // console.log("[Dashboard] componentDidMount - No queryGame provided");
        }

        // console.log("[Dashboard] componentDidMount - Component initialization complete");
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    componentWillUnmount() {
        // console.log("[Dashboard] componentWillUnmount - Cleaning up component");
        unsubscribeGlobalMessageEvent(this.backToLobbyEventId);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        this.notificationHandler.reset();
        this.dashboardHandler.reset();
    }

    signOut() {
        // console.log("[Dashboard] signOut - Redirecting to timeout page");
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        // console.log("[Dashboard] handleUpdateUserStakeLevel - Updating stake level:", userStakeLevel);
        this.setState({ userStakeLevel });
    }

    showApiErrorMessage(errorCode: string) {
        // console.log("[Dashboard] showApiErrorMessage - Showing error modal for code:", errorCode);
        this.setState({ isShowErrorModal: true, isBlockUI: false, apiError: { errorCode, message: GetLocalizedErrorMessage(errorCode) } });
    }

    closeDialog() {
        // console.log("[Dashboard] closeDialog - Closing error modal");
        this.setState({ isShowErrorModal: false });
        this.notificationHandler.isKickOut && this.signOut();
    }

    openGame(gameId: number) {
        // console.log("[Dashboard] openGame - Opening game:", gameId);
        this.setState({ queryGame: gameId, openGameId: gameId });
        updateURLContext({ gameId });
        // console.log("[Dashboard] openGame - Game opened and URL context updated");
    }

    renderGames() {
        // console.log("[Dashboard] renderGames - Rendering Games component");
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();

        // console.log("[Dashboard] renderGames - URL context:", urlContext);
        // console.log("[Dashboard] renderGames - Props for Games:", {
        //     openGameId: urlContext.gameId,
        //     openGameName,
        //     directMode: this.props.directMode,
        //     lobbyGamesIds: this.dashboardHandler.getLobbyGamesIds()
        // });

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
        // console.log("[Dashboard] openGameFromLobby - Opening game from lobby:", gameId);
        updateURLContext({ backToLobby: true, gameId: gameId });
        window.scrollTo(0, 0);
        if (this.state.openGameId !== gameId) {
            // console.log("[Dashboard] openGameFromLobby - Game changed, removing transmitter for:", this.state.openGameId);
            this.dashboardHandler.removeGameTransmitter(gameId);
            this.setState({ openGameId: gameId });
        } else {
            // console.log("[Dashboard] openGameFromLobby - Same game, forcing update");
            this.forceUpdate();
        }
    }

    renderLobby() {
        // console.log("[Dashboard] renderLobby - Rendering Lobby component");
        updateURLContext({ backToLobby: true });

        return (
            <LobbyConnectionContextProvider value={this.dashboardHandler.buildLobbyConnectionContextValue()}>
                <Lobby
                    openGame={(gameId: number) => this.openGameFromLobby(gameId)}
                    lobbyConfigs={this.props.lobbyConfigs}
                    gameTransmitters={this.state.gameTransmitters}
                />
            </LobbyConnectionContextProvider>
        );
    }

    setDashBoardStyle(isRenderGames: boolean) {
        return isDesktop && isRenderGames ? { height: this.state.dashBoardHeight } : {};
    }

    renderDashBoard() {
        // console.log("[Dashboard] renderDashBoard - Starting dashboard render");
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, isChangedGame, isChangePrevGame, openGameId } = this.state;
        const offerGames = this.dashboardHandler.getOfferGamesIds();
        const isRenderGames = this.dashboardHandler.shouldRenderGames(offerGames, openGameId);

        // console.log("[Dashboard] renderDashBoard - Render state:", {
        //     openGameId,
        //     offerGames,
        //     isRenderGames,
        //     isShowErrorModal,
        //     isBlockUI,
        //     isChangedGame,
        //     isChangePrevGame
        // });

        const allowSwipeGameOndDesktop = !this.props.directMode && !isMobileOnly && isRenderGames;

        const allowSwipeGameOndDesktopStyle = isChangePrevGame ? Styles["slide-left"] : Styles["slide-right"];
        const changeGameStyle = isChangedGame && allowSwipeGameOndDesktop ? allowSwipeGameOndDesktopStyle : "";
        const isNoGameOffer = this.state.apiError?.message === ErrorNoGameOffer;
        const renderOfferGameContainer = () => (isRenderGames ? this.renderGames() : this.renderLobby());

        // console.log("[Dashboard] renderDashBoard - Render decisions:", {
        //     allowSwipeGameOndDesktop,
        //     isNoGameOffer,
        //     willRenderGames: isRenderGames
        // });

        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
            enableQuickBet: true,
            locale: this.props.tolgee.getLanguage(),
        };

        return (
            <PlayerContextProvider value={authContextValue}>
                <SettingContextProvider>
                    {allowSwipeGameOndDesktop && <ButtonSwipe isPrev={true} swiper={this.swiperRef} />}
                    <div
                        className={`${Styles["dashboard"]} ${changeGameStyle} ${!isRenderGames ? "no-scroll" : ""} ${isMobileOnly ? Styles["hidden-scrollbar"] : ""
                            }`}
                        id={"dashboard"}
                        style={this.setDashBoardStyle(isRenderGames)}
                    >
                        <Header />
                        <SoundSettings />

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
        // console.log("[Dashboard] render - Component render called");

        if (this.state.isLandscapeMode && isMobileOnly) {
            // console.log("[Dashboard] render - Rendering landscape mode");
            return <LandscapeMode />;
        }

        // console.log("[Dashboard] render - Rendering dashboard");
        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
