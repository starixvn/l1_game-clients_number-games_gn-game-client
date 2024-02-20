import { Trans, withTranslation } from "next-i18next";
import Head from "next/head";
import { withRouter } from "next/router";
import React from "react";
import { isMobileOnly, isSafari } from "react-device-detect";
import { AuthorizeResponse, ReCheckInResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { buildUrl, GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import { AuthContextProvider } from "../../../_shared/react-contexts";
import { authorize, createNickname, getSettingGames, reCheckIn } from "../../../services/auth-service";
import { updateSignInSMStatus, updateThemeSetting } from "../../../services/user-setting-service";
import { Props, State } from "./type";

import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { Themes } from "../../../_shared/constants";
import { randomInteger } from "../../../_shared/helpers/number-helper";
import Games from "../../../games/games";
import { UserStakeLevel } from "../../game-base/type";
import BaseDialog from "../../game-components/base-dialog";
import { ModalType } from "../../game-components/base-dialog/type";
import { HistoryModal } from "../../page-components/dashboard/history";
import Register from "../../page-components/dashboard/register";
import Header from "../header";
import { ToolbarGuide } from "../hide-toolbar-guide";
import Styles from "./dashboard.module.scss";
import { GameGuideModal } from "./game-guide-modal";
import NameGenerator from "./register/name-generator";

class Dashboard extends React.PureComponent<Props, State> {
    private notificationSocket: Socket = null;
    private reCheckInInterval: NodeJS.Timeout;
    private isKickOut = false;
    private readonly minutesToMillisecond = 60000;

    constructor(props: Props) {
        super(props);

        this.state = {
            enabledWinningStreakNotification: StorageHelper.get(localStorageKeys.winningStreakNotification) ?? true,
            enabledPlaySound: StorageHelper.get(localStorageKeys.playSound) ?? false,
            favoriteGames: StorageHelper.get(localStorageKeys.favoriteGames) ?? [],
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
            queryGame: this.props.queryGame,
            isJoinGame: false,
            settingGames: [],
            openGameId: null,
            openGameName: "",
            isShowToolbarGuide: StorageHelper.get(localStorageKeys.toolbarGuide) ?? true,
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
        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.toggleSlidingChip = this.toggleSlidingChip.bind(this);
        this.toggleAnnouncementModal = this.toggleAnnouncementModal.bind(this);
        this.updateQueryGame = this.updateQueryGame.bind(this);
        this.openGame = this.openGame.bind(this);
        this.closeToolbarGuide = this.closeToolbarGuide.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }
    }

    updateFavoriteGames(favoriteGames: number[]) {
        this.setState({
            favoriteGames: favoriteGames,
        });
        StorageHelper.set(localStorageKeys.favoriteGames, favoriteGames);
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

    async componentDidMount() {
        // console.log("componentDidMount");
        const { session, i18n, directMode } = this.props;
        const authorizeResponse = await authorize(session);

        const errorResponse = authorizeResponse as any;

        if (errorResponse && errorResponse.errorCode === "SB0002") {
            this.props.router.push("/timeout", "/timeout", { locale: i18n.language });
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
        window.location.reload();
    }

    handleKickedOut(data: any) {
        const { umInfo } = data;
        const { router, setIsUm } = this.props;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            StorageHelper.set(localStorageKeys.umInfo, umInfo);
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
        StorageHelper.set(localStorageKeys.winningStreakNotification, !enabledWinningStreakNotification);
    }

    playSoundToggle() {
        const { enabledPlaySound } = this.state;
        this.setState({ enabledPlaySound: !enabledPlaySound });
        StorageHelper.set(localStorageKeys.playSound, !enabledPlaySound);
    }

    setEnabledQuickBet(enabled: boolean) {
        this.setState({ enabledQuickBet: enabled });
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
            queryGame,
            isJoinGame,
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

                    {isShowHistory && (
                        <HistoryModal
                            onCloseModal={this.toggleHistoryModal}
                            offerGames={offerGames}
                            fractionalOddsFormat={authorizeInfo.user?.fractionalOddsFormat}
                        />
                    )}
                    {isShowGuide && (
                        <GameGuideModal
                            userStakeLevel={userStakeLevel}
                            onCloseModal={this.toggleGuideModal}
                            offerGames={offerGames}
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

    autoCreateNickname = async () => {
        console.log(`begin autoCreateNickname `);
        const { session } = this.props;
        const nickname = NameGenerator.generateName();
        const maxAvatarId = 88;
        const selectedAvatarId = randomInteger(1, maxAvatarId);
        const response = await createNickname(session, nickname, selectedAvatarId);
        const authorizeResponse = response as any;
        if (authorizeResponse && authorizeResponse.authorized) {
            updateThemeSetting(session);
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            this.handleRegister(authorizeResponse);
        } else {
            console.log(`autoCreateNickname failed: ${authorizeResponse?.errorCode}`);
            this.props.router.push("/timeout", "/timeout", { locale: this.props.i18n.language });
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

export default withRouter(withTranslation()(Dashboard));
