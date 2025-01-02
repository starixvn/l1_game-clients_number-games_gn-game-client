import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import { isMobile, isMobileOnly } from "react-device-detect";
import SwiperCore from "swiper";

import { getAppSettings } from "../../../_shared/app-settings";
import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import { GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import { GlobalMessageTransmitter, GlobalTransmitterEvent, registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { loadURLContext, PlayerContextProvider, SettingContextProvider, updateURLContext } from "../../../_shared/react-contexts";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";
import { LoadingSpinner } from "../../game-components/game-loading/loading-spinner";
import BottomBar from "../bottom-bar";
import { LobbyGameTransmitter } from "../lobby/lobby-socket-connection";
import GameSelection from "../game-selection";
import ButtonSwipe from "./button-swipe";
import Styles from "./dashboard.module.scss";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import "../../../games/scoreboards";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"));
const Games = dynamic(() => import("../../../games/games"), { loading: () => <LoadingSpinner /> });
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

const gameGroups = Object.values(getAppSettings().gameSettings).reduce<{ name: string, games: any[] }[]>((groups, game) => {
    const existingGroup = groups.find(g => g.name === game.gameGroup);
    if (existingGroup) {
        existingGroup.games.push(game);
    } else {
        groups.push({
            name: game.gameGroup,
            games: [game]
        });
    }
    return groups;
}, []);


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
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeInfo.user.red });
            this.isUpdatingBalance = setBalanceByPlaceBet;
            this.setState({ authorizeInfo });
        }
    };

    onVisibilityChange() {
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

    resetGameIdDashboardEvent() {
        this.setState({ openGameId: 0 });
        this.forceUpdate();
    }

    updateGameTransmitters(gameTransmitters: Record<number, LobbyGameTransmitter>) {
        this.setState({ gameTransmitters });
    }

    shouldComponentUpdate(nextProps: Readonly<DashboardProps>, nextState: Readonly<DashboardState>, nextContext: any): boolean {
        if (this.state.openGameId > 0 && this.isUpdatingBalance) {
            this.isUpdatingBalance = false;
            return false;
        }

        return true;
    }

    async componentDidMount() {
        const { dashBoardHeight } = this.state;

        // const zoomGame = +getComputedStyle(document.getElementById("dashboard")).getPropertyValue("--zoom-game");

        // if (isDesktop && dashBoardHeight !== window.innerHeight) {
        //     const scaleHeight = document.getElementById("dashboard").clientHeight * zoomGame;
        //     this.setState({
        //         dashBoardHeight: window.innerHeight + (window.innerHeight - scaleHeight) * (window.innerHeight / scaleHeight),
        //     });
        // }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.backToLobbyEventId = registerGlobalMessageEvent(GlobalTransmitterEvent.BACK_TO_LOBBY, async () =>
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
        unsubscribeGlobalMessageEvent(this.backToLobbyEventId);
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
        let targetGameId = gameId;
        if (gameId === 0 && gameGroups.length > 0 && gameGroups[0].games.length > 0) {
            targetGameId = gameGroups[0].games[0].id;
        }

        updateURLContext({ backToLobby: true, gameId: targetGameId });
        window.scrollTo(0, 0);
        if (this.state.openGameId !== targetGameId) {
            this.dashboardHandler.removeGameTransmitter(targetGameId);
            this.setState({ openGameId: targetGameId });
        } else {
            this.forceUpdate();
        }
    }

    renderLobby() {
        updateURLContext({ backToLobby: true });

        const lobbyConnectionContextValue = this.dashboardHandler.buildLobbyConnectionContextValue();

        return (
            <GameSelection
                lobbyConfigs={this.props.lobbyConfigs}
                gameTransmitters={this.state.gameTransmitters}
                openGame={this.openGameFromLobby}
                onClose={(gameId: number) => this.openGameFromLobby(gameId)}
                lobbyConnectionContextValue={lobbyConnectionContextValue}
                gameGroups={gameGroups}
                headerRef={this.swiperRef}
            />
        );
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, isChangedGame, isChangePrevGame, openGameId } = this.state;
        const offerGames = this.dashboardHandler.getOfferGamesIds();
        const isRenderGames = this.dashboardHandler.shouldRenderGames(offerGames, openGameId);
        const allowSwipeGameOndDesktop = !this.props.directMode && !isMobileOnly && isRenderGames;

        const allowSwipeGameOndDesktopStyle = isChangePrevGame ? Styles["slide-left"] : Styles["slide-right"];
        const changeGameStyle = isChangedGame && allowSwipeGameOndDesktop ? allowSwipeGameOndDesktopStyle : "";
        const isNoGameOffer = this.state.apiError?.message === ErrorNoGameOffer;
        const renderOfferGameContainer = () => (isRenderGames ? this.renderGames() : this.renderLobby());

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
                    >
                        <SoundSettings />

                        {isNoGameOffer ? <></> : renderOfferGameContainer()}

                        <BottomBar
                            lobbyConfigs={this.props.lobbyConfigs}
                            gameTransmitters={this.state.gameTransmitters}
                            openGame={this.openGame}
                        />
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
