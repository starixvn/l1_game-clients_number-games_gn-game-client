import { TFunction } from "next-i18next";

export type BetHistoryItem = {
    time: string;
    phien: number;
    betwin: number;
    refund?: number;
    amount?: number;
    totalAmount?: number;
};

export type PropsBetContainer = {
    gameId: number;
    isRefund: boolean;
    renderResult?: (bet: any, roundId: number, setIsShowResultDetail?: Function, setBetLog?: Function, t?: TFunction) => JSX.Element;
    renderBet?: (bet: any, t: TFunction, mainOdds: object, gameName: string, fractionalOddsFormat: boolean | undefined) => JSX.Element;
    renderResultDetail?: (
        resultDetail: ResultDetail,
        t: TFunction,
        closeModal: () => void,
        gameName: string,
        gameId?: number
    ) => JSX.Element;
    closeModal?: () => void;
    renderBetLogsDetails?: Function;
    nameHeaderOnTable?: string[];
    fractionalOddsFormat?: boolean | undefined;
};

export type ResultDetail = {
    bet: any;
    roundId: number;
};

export type BetLogs = {
    betLogDetails?: [];
    betwin: number;
    freeBet?: boolean;
    name: string;
    phien: number;
    result: object;
    settlementResult: object;
    time: string;
    refund?: number;
    odds?: object;
    amount?: number;
    totalAmount?: number;
};
