import { GameConfigs, RoundState } from "../../components/game-base/type";
import { NoticeErrorCode } from "../constants/error-code-dictionary";

export interface IAvailableSuggestBetAmount {
    suggestAmount?: number;
    isInsufficientFunds?: boolean;
    isSuggestBet?: boolean;
    errorCode?: string;
    args?: object;
    maxBetPerChoice?: number;
    mode: SuggestBetMode;
}

enum SuggestBetMode {
    ReachMaxBet = "ReachMaxBet",
    SuggestBet = "SuggestBet",
    MinBet = "MinBet",
    MaxBetRound = "MaxBetRound",
}

interface SuggestBetOptions {
    suggestAmount: number;
    isInsufficientFunds: boolean;
    isOptionReachMaxBet: boolean;
    isMaxBetRound: boolean;
    maxBetPerChoice: number;
    roundMaxBet: number;
    roundMinBet: number;
    currentAmountOfChoice: number;
}

export const validateHedgeBet = (
    hedgeBetGroup: string[],
    ownBets: object,
    betChoice: string,
    amount: number
): boolean => {
    const betTracks = { ...ownBets };
    betTracks[betChoice] = (betTracks[betChoice] ?? 0) + amount;

    return (
        hedgeBetGroup &&
        Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroup.includes(betKey) && hedgeBetGroup.includes(betChoice) && betKey !== betChoice
        )
    );
};

export const getRoundMinBet = (gameConfigs: GameConfigs, userMinBet: number): number => {
    return Math.max(userMinBet, gameConfigs.minBet);
};

export const getRoundMaxBet = (gameConfigs: GameConfigs, userMaxBet: number): number => {
    return Math.min(userMaxBet, gameConfigs.maxBet);
};

export const getMaxBetPerChoice = (gameConfigs: GameConfigs, betChoice: string): number => {
    return gameConfigs.maxBetPerChoices[betChoice] || Infinity;
};

export const getCurrentAmountOfChoice = (ownBets: object, notConfirmOwnBets: object, betChoice: string): number => {
    return (ownBets[betChoice] || 0) + (notConfirmOwnBets[betChoice] || 0);
};

export const isInsufficientFunds = (
    amount: number,
    accountBalance: number,
    totalBetNotConfirmAmount: number,
    enabledQuickBet: boolean
): boolean => {
    if (enabledQuickBet) {
        return amount > accountBalance;
    }

    return totalBetNotConfirmAmount + amount > accountBalance;
};

export const isOptionReachMaxBet = (currentTotalAmountOfChoice: number, maxBetPerChoice: number): boolean => {
    return currentTotalAmountOfChoice > maxBetPerChoice;
};

export const isMinBet = (amount: number, roundMinBet: number, suggestAmount: number): boolean => {
    if (suggestAmount > 0) {
        return suggestAmount < roundMinBet;
    }
    return amount > 0 && amount < roundMinBet;
};

export const isMaxBetRound = (amount: number, roundMaxBet: number, totalBetAmount: number): boolean => {
    return amount + totalBetAmount > roundMaxBet || totalBetAmount > roundMaxBet;
};

export const isInPhasePreventBet = (roundState: RoundState): boolean => {
    return roundState !== RoundState.InRound;
};

export const isHedgeBet = (
    hedgeBetGroups: string[],
    betChoice: string,
    amount: number,
    ownBets: any
): boolean => {
    return validateHedgeBet(hedgeBetGroups, ownBets, betChoice, amount);
};

export const findHedgeBetGroup = (hedgeBetGroups: string[][], betChoice: string): string[] => {
    return hedgeBetGroups?.find((group) => group.includes(betChoice)) ?? [];
};

export const getAccountBalance = (balance: number): number => {
    return Math.trunc(balance || 0);
};

export const getMaxAvailableAmountOfChoice = (
    maxBetPerChoice: number,
    currentAmountOfChoice: number,
    roundMaxBet: number,
    totalBetNotConfirmAmount: number,
    totalBeAmount: number,
    accountBalance: number,
    enabledQuickBet: boolean
): number => {
    if (totalBeAmount === roundMaxBet) {
        return 0;
    }

    if (totalBetNotConfirmAmount > accountBalance) {
        return 0;
    }

    let remainAmount = maxBetPerChoice - currentAmountOfChoice;
    if (remainAmount + totalBeAmount >= roundMaxBet) {
        remainAmount = roundMaxBet - totalBeAmount;
    }
    if (!enabledQuickBet && totalBetNotConfirmAmount + remainAmount > accountBalance) {
        remainAmount = accountBalance - totalBetNotConfirmAmount;
    }
    return remainAmount > 0 ? remainAmount : 0;
};

const determineBetMode = ({
    suggestAmount,
    isInsufficientFunds,
    isOptionReachMaxBet,
    isMaxBetRound,
    maxBetPerChoice,
    roundMaxBet,
    roundMinBet,
    currentAmountOfChoice,
}: SuggestBetOptions): IAvailableSuggestBetAmount => {
    if (suggestAmount === 0) {
        if (isMaxBetRound) {
            return getMaxBetRoundMode(roundMaxBet, maxBetPerChoice);
        }
        if (isOptionReachMaxBet) {
            return getReachMaxBetMode(maxBetPerChoice);
        }
    }

    const isSuggestBet = isSuggestBetAvailable(
        suggestAmount,
        currentAmountOfChoice,
        roundMinBet,
        roundMaxBet,
        isInsufficientFunds,
        isOptionReachMaxBet,
        isMaxBetRound
    );

    return {
        suggestAmount,
        isInsufficientFunds,
        isSuggestBet,
        mode: SuggestBetMode.SuggestBet,
    };
};

const getReachMaxBetMode = (maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.ReachMaxBet,
        errorCode: NoticeErrorCode.optionMaxBet,
        args: { maxBet: maxBetPerChoice },
    };
};

const getMaxBetRoundMode = (roundMaxBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MaxBetRound,
        maxBetPerChoice,
        errorCode: NoticeErrorCode.drawMaxBet,
        args: { maxBet: roundMaxBet },
    };
};

const isSuggestBetAvailable = (
    suggestAmount: number,
    currentAmountOfChoice: number,
    roundMinBet: number,
    roundMaxBet: number,
    isInsufficientFunds: boolean,
    isOptionReachMaxBet: boolean,
    isMaxBetRoundResult: boolean
): boolean => {
    return (
        (suggestAmount + currentAmountOfChoice >= roundMinBet || suggestAmount + currentAmountOfChoice <= roundMaxBet) &&
        (isInsufficientFunds || isOptionReachMaxBet || isMaxBetRoundResult)
    );
};
