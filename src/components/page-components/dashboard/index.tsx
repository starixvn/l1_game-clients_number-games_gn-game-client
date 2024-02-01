import { Trans, withTranslation } from "next-i18next";
import Head from "next/head";
import { withRouter } from "next/router";
import React from "react";
import { isMobileOnly, isMobile, isSafari } from "react-device-detect";
import { AuthorizeResponse, ReCheckInResponse, UMInfo, Response } from "sc-user-service-client/dist/auth";
import { Props, State } from "./type";
import { getAppSettings } from "../../../_shared/app-settings";
import { getLocalStorageItem, localStorageKeys, storeLocalStorageItem } from "../../../_shared/local-storage";
import LandscapeMode from "../landscape-mode";
import { AuthContextProvider } from "../../../_shared/contexts/auth";
import { GetLocalizedErrorMessage } from "../../../_shared/helpers/notice-helper";
import { authorize, getSettingGames, reCheckIn } from "../../../services/auth-service";
import { updateSignInSMStatus, updateThemeSetting } from "../../../services/user-setting-service";
import BetSettings from "../../page-components/bet-settings";

import Header from "../header";
import BaseDialog from "../../game-components/base-dialog";
import { ModalType } from "../../game-components/base-dialog/type";
import { UserStakeLevel } from "../../game-base/type";
import { GameGuideModal } from "./game-guide-modal";
import { HistoryModal } from "../../page-components/dashboard/history";
import Register from "../../page-components/dashboard/register";
import Styles from "./dashboard.module.scss";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { Themes } from "../../../_shared/constants";
import { AnnouncementModal } from "../../page-components/dashboard/announcement";
import { ToolbarGuide } from "../hide-toolbar-guide";
import { buildUrl } from "../../../_shared/helpers/url-helper";
import Games from "../../../games/games";

const orientationType = { portrait: "portrait", landscape: "landscape" };
class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;
    private showPromotion: NodeJS.Timeout;
    private readonly minutesToMillisecond = 60000;
    private readonly delayTimeShowPromotion = 15 * this.minutesToMillisecond;

    constructor(props: Props) {
        super(props);

        this.state = {
            orientation: "",
            enabledWinningStreakNotification: getLocalStorageItem(localStorageKeys.winningStreakNotification) ?? true,
            enabledPlaySound: getLocalStorageItem(localStorageKeys.playSound) ?? false,
            favoriteGames: getLocalStorageItem(localStorageKeys.favoriteGames) ?? [],
            userStakeLevel: { minBet: 0, maxBet: 0 },
            authorizeInfo: null,
            isShowErrorModal: false,
            apiError: null,
            isShowHistory: false,
            isShowGuide: false,
            isShowAnnouncement: false,
            enabledQuickBet: false,
            betValue: 1,
            isBlockUI: false,
            isShowSlidingChip: isMobileOnly ? false : true,
            isShowBoostedOdds: false,
            isNewPromotion: false,
            promotionNotifications: [],
            promotions: [],
            queryGame: this.props.queryGame,
            isJoinGame: false,
            settingGames: [],
            openGameId: null,
            openGameName: "",
            isShowToolbarGuide: getLocalStorageItem(localStorageKeys.toolbarGuide) ?? true,
        };

        this.handleFirstLogin = this.handleFirstLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.registerMainSocketEvent = this.registerMainSocketEvent.bind(this);
        this.handleKickedOut = this.handleKickedOut.bind(this);
        this.winningStreakNotificationToggle = this.winningStreakNotificationToggle.bind(this);
        this.playSoundToggle = this.playSoundToggle.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.toggleHistoryModal = this.toggleHistoryModal.bind(this);
        this.toggleGuideModal = this.toggleGuideModal.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.updateAuthorizeInfo = this.updateAuthorizeInfo.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.handleShowApiErrorMessage = this.handleShowApiErrorMessage.bind(this);
        this.toggleHistoryModal = this.toggleHistoryModal.bind(this);
        this.toggleGuideModal = this.toggleGuideModal.bind(this);
        this.updateFavoriteGames = this.updateFavoriteGames.bind(this);
        this.setEnabledQuickBet = this.setEnabledQuickBet.bind(this);
        this.setBetValue = this.setBetValue.bind(this);
        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.toggleSlidingChip = this.toggleSlidingChip.bind(this);
        this.handleOrientation = this.handleOrientation.bind(this);
        this.toggleAnnouncementModal = this.toggleAnnouncementModal.bind(this);
        this.handlePromotions = this.handlePromotions.bind(this);
        this.handlePromotionNotifications = this.handlePromotionNotifications.bind(this);
        this.updateQueryGame = this.updateQueryGame.bind(this);
        this.openGame = this.openGame.bind(this);
        this.closeToolbarGuide = this.closeToolbarGuide.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = getLocalStorageItem(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            storeLocalStorageItem(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }
    }

    updateFavoriteGames(favoriteGames: number[]) {
        this.setState({
            favoriteGames: favoriteGames,
        });
        storeLocalStorageItem(localStorageKeys.favoriteGames, favoriteGames);
    }

    updateAuthorizeInfo(authorizeInfo: AuthorizeResponse) {
        this.checkOfferedGame(authorizeInfo);
        this.setState({ authorizeInfo, enabledQuickBet: authorizeInfo?.user?.settings?.quickBet });
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
        this.props.router.push("/timeout", "/timeout", { locale: this.props.i18n.language });
    }

    checkOfferedGame(authorizeInfo) {
        if (authorizeInfo?.user?.offerGames && authorizeInfo?.user?.offerGames.length === 0) {
            this.setState({
                apiError: {
                    message: "messages:noGameOffer",
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
        } else {
            if (response.apiError) {
                this.handleShowApiErrorMessage(response.apiError.errorCode, response.isDisableAccount);
            } else {
                this.updateUserBalance(response.balance);
            }
        }
    }

    handleOrientation() {
        setTimeout(() => {
            this.setState({ orientation: window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait });
        }, 200);
    }

    async componentDidMount() {
        const { session, i18n } = this.props;
        const authorizeResponse = await authorize(session);

        const errorResponse = authorizeResponse as any;

        if (errorResponse && errorResponse.errorCode === "SB0002") {
            this.props.router.push("/timeout", "/timeout", { locale: i18n.language });
            return;
        }

        const authorizeInfo = authorizeResponse as any;

        this.updateAuthorizeInfo(authorizeInfo);

        this.updateUserBalance(authorizeInfo?.user?.red);

        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);

        if (isMobile) {
            window.addEventListener("orientationchange", this.handleOrientation, false);
        }

        // this.connectNotificationSocket();
        await this.updateBetSettingGames();
    }

    componentWillUnmount() {
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
        this.notificationSocket && this.notificationSocket.emit("promotionNotifications");
        this.registerMainSocketEvent(this.notificationSocket);
    }

    registerMainSocketEvent(mainSocket: Socket) {
        mainSocket.on("auth", this.handleAuth);
        mainSocket.on("kickedOut", this.handleKickedOut);
        mainSocket.on("reload", this.handleReload);
        mainSocket.on("promotions", this.handlePromotions);
        mainSocket.on("promotionNotifications", this.handlePromotionNotifications);
    }

    handlePromotions(data) {
        const { promotions, isShowBoostedOdds, settingGames } = this.state;
        const offerGames = settingGames?.map((game: any) => game?.gameId);
        const offerGamePromotions = data.filter(
            (promotion) => offerGames?.includes(promotion.gameId) && getAppSettings().offeredGames.includes(promotion.gameId)
        );

        let haveNewPromotion = offerGamePromotions.length > promotions.length;
        if (!haveNewPromotion) {
            const filterNewPromotion = offerGamePromotions.filter(
                (newPromotion) =>
                    !promotions.some(
                        (currentPromotion) =>
                            newPromotion._id === currentPromotion._id &&
                            new Date(newPromotion.startDateTime).getTime() === new Date(currentPromotion.startDateTime).getTime() &&
                            new Date(newPromotion.endDateTime).getTime() === new Date(currentPromotion.endDateTime).getTime()
                    )
            );
            haveNewPromotion = filterNewPromotion.length > 0;
        }

        if (haveNewPromotion || isShowBoostedOdds) {
            this.setState({ isNewPromotion: true });
            clearTimeout(this.showPromotion);
            this.showPromotion = setTimeout(() => {
                this.setState({ isShowBoostedOdds: true });
            }, this.delayTimeShowPromotion);
        }
        setTimeout(() => {
            this.setState({ isNewPromotion: false });
        }, 10000);
        this.setState({ promotions: offerGamePromotions, isShowBoostedOdds: false });
    }

    async handlePromotionNotifications(data) {
        const { settingGames } = this.state;
        const offerGames = settingGames?.map((game: any) => game?.gameId);
        const newPromotionNotifications = data.filter(
            (promotionNotification) =>
                offerGames?.includes(promotionNotification.gameId) && getAppSettings().offeredGames.includes(promotionNotification.gameId)
        );
        this.setState({ promotionNotifications: newPromotionNotifications });
        if (newPromotionNotifications.length < 1) {
            this.setState({ isShowAnnouncement: false });
        }
    }

    handleAuth(authData) {
        if (!authData.authorized) {
            this.handleKickedOut(authData);
        }
    }

    handleReload() {
        window.location.reload();
    }

    handleKickedOut(data: any) {
        const { umInfo } = data;
        const { router, setIsUm } = this.props;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            storeLocalStorageItem<UMInfo>(localStorageKeys.umInfo, umInfo);
            setTimeout(() => {
                setIsUm(true);
            }, 500);
        } else {
            router.push("/timeout", "/timeout", { locale: this.props.i18n.language });
        }
    }

    handleFirstLogin() {
        const { session } = this.props;
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo && authorizeInfo.authorized) {
            updateSignInSMStatus(session);
            updateThemeSetting(session);

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
        updateThemeSetting(session);

        this.updateAuthorizeInfo(authorizeInfo);
    }

    winningStreakNotificationToggle() {
        const { enabledWinningStreakNotification } = this.state;
        this.setState({ enabledWinningStreakNotification: !enabledWinningStreakNotification });
        storeLocalStorageItem(localStorageKeys.winningStreakNotification, !enabledWinningStreakNotification);
    }

    playSoundToggle() {
        const { enabledPlaySound } = this.state;
        this.setState({ enabledPlaySound: !enabledPlaySound });
        storeLocalStorageItem(localStorageKeys.playSound, !enabledPlaySound);
    }

    setEnabledQuickBet(enabled: boolean) {
        this.setState({ enabledQuickBet: enabled });
    }

    setBetValue(value: number) {
        this.setState({ betValue: value });
    }

    closeDialog() {
        this.setState({ isShowErrorModal: false });
        this.isKickOut && this.signOut();
    }

    toggleHistoryModal() {
        this.setState({ isShowHistory: !this.state.isShowHistory });
    }

    async toggleGuideModal() {
        const { isShowGuide } = this.state;
        if (!isShowGuide) {
            await this.updateBetSettingGames();
            this.notificationSocket && this.notificationSocket.emit("promotions");
        }

        setTimeout(() => {
            this.setState({ isShowGuide: !this.state.isShowGuide });
        }, 100);
    }

    async updateBetSettingGames() {
        const { session } = this.props;
        const betSettings = await getSettingGames(session);
        this.setState({ settingGames: betSettings.settingGames as any });
    }

    toggleSlidingChip() {
        isMobileOnly && this.setState({ isShowSlidingChip: !this.state.isShowSlidingChip });
    }

    toggleAnnouncementModal() {
        this.setState({ isShowAnnouncement: !this.state.isShowAnnouncement });
    }

    updateQueryGame(gameId: number, isJoinGame: boolean, isClearOpenGame = false) {
        const queryGame = isJoinGame ? gameId : this.props.queryGame;
        const openGameId = isClearOpenGame ? null : this.state.openGameId;
        const openGameName = isClearOpenGame ? null : this.state.openGameName;
        this.setState({ queryGame: queryGame, isJoinGame: isJoinGame, openGameId: openGameId, openGameName: openGameName });
    }

    openGame(gameId: number) {
        this.setState({ queryGame: gameId, isJoinGame: true, openGameId: gameId });
    }

    closeToolbarGuide() {
        this.setState({ isShowToolbarGuide: false });
    }

    renderDashBoard() {
        const {
            enabledWinningStreakNotification,
            enabledPlaySound,
            isShowErrorModal,
            isShowHistory,
            isShowGuide,
            isShowAnnouncement,
            userStakeLevel,
            favoriteGames,
            authorizeInfo,
            enabledQuickBet,
            betValue,
            isBlockUI,
            isShowSlidingChip,
            isShowBoostedOdds,
            promotionNotifications,
            isNewPromotion,
            queryGame,
            isJoinGame,
            promotions,
            settingGames,
            openGameId,
            openGameName,
            isShowToolbarGuide,
        } = this.state;
        const authContextValue = {
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
        };
        const offerGames: number[] = authorizeInfo?.user?.offerGames?.map((game: any) => game?.gameId) ?? [];
        return (
            <AuthContextProvider value={authContextValue}>
                <div className={`${Styles["dashboard"]}`}>
                    <Header
                        user={authorizeInfo.user}
                        enabledNotification={enabledWinningStreakNotification}
                        enabledSound={enabledPlaySound}
                        onToggleNotification={this.winningStreakNotificationToggle}
                        onToggleSound={this.playSoundToggle}
                        toggleHistoryModal={this.toggleHistoryModal}
                        toggleGuideModal={this.toggleGuideModal}
                        toggleAnnouncementModal={this.toggleAnnouncementModal}
                        favoriteGames={favoriteGames}
                        offerGames={offerGames}
                        updateFavoriteGames={this.updateFavoriteGames}
                        enabledQuickBet={enabledQuickBet}
                        updateEnabledQuickBet={this.setEnabledQuickBet}
                        isShowBoostedOdds={isShowBoostedOdds}
                        promotionNotifications={promotionNotifications}
                        isShowToolbarGuide={isShowToolbarGuide}
                    />
                    <Games
                        enabledQuickBet={enabledQuickBet}
                        betValue={betValue}
                        enabledWinningStreakNotification={enabledWinningStreakNotification}
                        enabledPlaySound={enabledPlaySound}
                        setApiErrorMessage={this.handleShowApiErrorMessage}
                        userStakeLevel={userStakeLevel}
                        updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                        updateFavoriteGames={this.updateFavoriteGames}
                        favoriteGames={favoriteGames}
                        userOfferGames={offerGames}
                        queryGame={queryGame}
                        isShowSlidingChip={isShowSlidingChip}
                        updateQueryGames={this.updateQueryGame}
                        isJoinGame={isJoinGame}
                        openGameId={openGameId}
                        openGameName={openGameName}
                        fractionalOddsFormat={authorizeInfo.user?.fractionalOddsFormat}
                    />
                    <BetSettings
                        enabledQuickBet={enabledQuickBet}
                        updateEnabledQuickBet={this.setEnabledQuickBet}
                        updateBetValue={this.setBetValue}
                        enabledSound={enabledPlaySound}
                        user={authorizeInfo.user}
                        toggleSlidingChip={this.toggleSlidingChip}
                        isShowSlidingChip={isShowSlidingChip}
                        toggleAnnouncementModal={this.toggleAnnouncementModal}
                        betValue={betValue}
                        isNewPromotion={isNewPromotion}
                        isShowToolbarGuide={isShowToolbarGuide}
                    />

                    {isShowHistory && (
                        <HistoryModal
                            onCloseModal={this.toggleHistoryModal}
                            offerGames={offerGames}
                            fractionalOddsFormat={authorizeInfo.user?.fractionalOddsFormat}
                        />
                    )}
                    {isShowAnnouncement && (
                        <AnnouncementModal
                            onCloseModal={this.toggleAnnouncementModal}
                            promotionNotifications={promotionNotifications}
                            openGame={this.openGame}
                        />
                    )}
                    {isShowGuide && (
                        <GameGuideModal
                            userStakeLevel={userStakeLevel}
                            onCloseModal={this.toggleGuideModal}
                            offerGames={offerGames}
                            promotions={promotions}
                            settingGames={settingGames}
                            fractionalOddsFormat={authorizeInfo.user?.fractionalOddsFormat}
                        />
                    )}
                    {isShowErrorModal && (
                        <div className={Styles["container-modal"]}>
                            <div className={`${Styles["bg-opacity"]} ${isBlockUI ? Styles["block-ui-backdrop"] : ""}`}></div>
                            <BaseDialog
                                type={ModalType.Center}
                                isOpen={isShowErrorModal}
                                onCloseModal={this.closeDialog}
                                isBlockUI={isBlockUI}
                            >
                                <div className={`modal-center ${isBlockUI ? Styles["block-ui-message"] : ""}`}>
                                    {!isBlockUI && <div className={`icon-close modal-icon-close`} onClick={this.closeDialog}></div>}
                                    <Trans t={this.props.t}>
                                        {this.props.t(this.state.apiError?.message, { errorCode: this.state.apiError?.errorCode })}
                                    </Trans>
                                    Không thể cập nhật số tiền trong tài khoản
                                </div>
                            </BaseDialog>
                        </div>
                    )}
                    {isMobileOnly && isSafari && (
                        <ToolbarGuide isShowToolbarGuide={isShowToolbarGuide} onCloseGuide={this.closeToolbarGuide}></ToolbarGuide>
                    )}
                </div>
            </AuthContextProvider>
        );
    }

    renderComponents(authorizeInfo: AuthorizeResponse) {
        const { authorized } = authorizeInfo;
        if (authorized) {
            return this.renderDashBoard();
        }

        return <Register session={this.props.session} handleStateLogin={this.handleRegister} />;
    }

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
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${getAppSettings().googleAnalyticId}', {
                            page_path: window.location.pathname,
                            });
                        `,
                    }}
                />
            </>
        );
    }

    render() {
        const { orientation, authorizeInfo } = this.state;

        if (orientation === orientationType.landscape && isMobileOnly) {
            return <LandscapeMode />;
        }

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

export default withRouter(withTranslation()(Dashboard));
