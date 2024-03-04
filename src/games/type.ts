import { UserStakeLevel } from "../components/game-base/type";

export type Props = {
    enabledWinningStreakNotification: boolean;
    setApiErrorMessage: Function;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: Function;
    queryGame: number;
    userOfferGames: number[];
    updateQueryGames: (gameId: number, isJoinGame: boolean, isClearOpenGameId: boolean) => void;
    isJoinGame: boolean;
    openGameId: number;
    openGameName: string;
};
