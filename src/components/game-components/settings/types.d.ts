export interface Props {
    enabledSound: boolean;
    enabledNotification: boolean;
    onToggleSound: Function;
    onToggleNotification: Function;
    toggleGuideModal: Function;
    toggleHistoryModal: Function;
    toggleAnnouncementModal: Function;
    favoriteGames: number[];
    offerGames: number[];
    updateFavoriteGames: Function;
    enabledQuickBet?: boolean;
    updateEnabledQuickBet?: Function;
    isShowQuickBet?: boolean;
    isShowBoostedOdds: boolean;
    promotionNotifications: [];
    isShowToolbarGuide: boolean;
}
