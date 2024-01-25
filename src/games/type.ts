import { UserStakeLevel } from "../shared/game-base/type";

export type Props = {
    betValue: number;
    enabledQuickBet: boolean;
    enabledWinningStreakNotification: boolean;
    enabledPlaySound: boolean;
    setApiErrorMessage: Function;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: Function;
    updateFavoriteGames: Function;
    favoriteGames: number[];
    queryGame: number;
    userOfferGames: number[];
    isShowSlidingChip: boolean;
    updateQueryGames: (gameId: number, isJoinGame: boolean, isClearOpenGameId: boolean) => void;
    isJoinGame: boolean;
    openGameId: number;
    fractionalOddsFormat: boolean;
};
