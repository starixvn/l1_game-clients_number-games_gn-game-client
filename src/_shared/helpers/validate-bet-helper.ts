import { MessageErrorCode } from "../constants/error-code-dictionary";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";

export interface IAvailableSuggestBetAmount {
    amount?: number;
    isInsufficientFunds?: boolean;
    isAvailable?: boolean;
    errorCode?: string;
    args?: unknown;
    maxBetPerChoice?: number;
    mode: 1 | 2 | 3 | 4;
}

export enum SuggestBetMode {
    ReachMaxBet = 1,
    SuggestBet = 2,
    MinBet = 3,
    MaxBetRound = 4,
}

interface SuggestBetOptions {
    suggestAmount: number;
    isInsufficientFunds: boolean;
    isOptionReachMaxBet: boolean;
    isMinBet: boolean;
    isMaxBetRound: boolean;
    maxBetPerChoice: number;
    roundMaxBet: number;
    roundMinBet: number;
    currentAmountOfChoice: number;
}

export const validateHedgeBet = (
    hedgeBetGroup: Record<any, any>,
    ownBets: Record<any, any>,
    notConfirmOwnBets: Record<any, any>,
    betChoice: string,
    amount: number
): boolean => {
    const betTracks = { ...ownBets, ...notConfirmOwnBets };
    betTracks[betChoice] = (betTracks[betChoice] ?? 0) + amount;

    const isInvalid =
        hedgeBetGroup &&
        Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroup.includes(betKey) && hedgeBetGroup.includes(betChoice) && betKey !== betChoice
        );

    return isInvalid;
};

export const getRoundMinBet = (gameConfigs: GameStateContextModel<unknown, unknown>["gameConfigs"], userMinBet: number): number => {
    return Math.max(userMinBet, gameConfigs.minBet);
};

export const getRoundMaxBet = (gameConfigs: GameStateContextModel<unknown, unknown>["gameConfigs"], userMaxBet: number): number => {
    return Math.min(userMaxBet, gameConfigs.maxBet);
};

export const getMaxBetPerChoice = (gameConfigs: GameStateContextModel<unknown, unknown>["gameConfigs"], betChoice: string): number => {
    return gameConfigs.maxBetPerChoices[betChoice] || Infinity;
};

export const getCurrentAmountOfChoice = (ownBets: unknown, notConfirmOwnBets: unknown, betChoice: string): number => {
    return (ownBets[betChoice] || 0) + (notConfirmOwnBets[betChoice] || 0);
};

export const isInsufficientFunds = (amount: number, accountBalance: number): boolean => {
    return amount > accountBalance;
};

export const isOptionReachMaxBet = (currentTotalAmount: number, maxBetPerChoice: number): boolean => {
    return currentTotalAmount > maxBetPerChoice;
};

export const isMinBet = (amount: number, roundMinBet: number): boolean => {
    return amount > 0 && amount < roundMinBet;
};

export const isMaxBetRound = (currentTotalAmount: number, roundMaxBet: number, totalBetAmount: number): boolean => {
    return currentTotalAmount > roundMaxBet || totalBetAmount > roundMaxBet;
};

export const getMaxAvailableAmountOfChoice = (
    amount: number,
    maxBetPerChoice: number,
    currentAmountOfChoice: number,
    roundMaxBet: number,
    totalBetAmount: number
): number => {
    if (totalBetAmount === roundMaxBet) {
        return 0;
    }
    let remainAmount = maxBetPerChoice - currentAmountOfChoice;
    if (remainAmount + currentAmountOfChoice + totalBetAmount >= roundMaxBet) {
        remainAmount = roundMaxBet - totalBetAmount;
    }

    return remainAmount > 0 ? remainAmount : 0;
};

export const getCriteriaValidateBet = (
    gameStateContext: GameStateContextModel<unknown, unknown>,
    betChoice: string,
    amount: number,
    accountBalance: number,
    handleSuggestBet?: (betChoice: string, availableSuggestBet: IAvailableSuggestBetAmount) => void
): { errorCode: string; args?: unknown } => {
    const criteria = composeValidationCriteria(amount, accountBalance, gameStateContext, betChoice, getTotalBetAmount(gameStateContext));

    if (criteria.amount > 0 && criteria.isAvailable) {
        handleSuggestBet?.(betChoice, criteria);

        return;
    }

    if (criteria?.errorCode) {
        return { errorCode: criteria?.errorCode, args: criteria?.args };
    }

    return { errorCode: MessageErrorCode.validBet };
};

const composeValidationCriteria = (
    amount: number,
    accountBalance: number,
    context: GameStateContextModel<unknown, unknown>,
    betChoice: string,
    totalBetAmount: number
): IAvailableSuggestBetAmount => {
    const { gameConfigs, userStakeLevel, notConfirmOwnBets, ownBets } = context;
    const { minBet: userMinBet, maxBet: userMaxBet } = userStakeLevel;

    const roundMinBet = getRoundMinBet(gameConfigs, userMinBet);
    const roundMaxBet = getRoundMaxBet(gameConfigs, userMaxBet);
    const maxBetPerChoice = getMaxBetPerChoice(gameConfigs, betChoice);
    const currentAmountOfChoice = getCurrentAmountOfChoice(ownBets, notConfirmOwnBets, betChoice);
    const currentTotalAmount = totalBetAmount + amount;
    const maxAvailableAmountOfChoice = getMaxAvailableAmountOfChoice(
        amount,
        maxBetPerChoice,
        currentAmountOfChoice,
        roundMaxBet,
        totalBetAmount
    );
    const suggestAmount = Math.min(accountBalance, maxAvailableAmountOfChoice);
    const isInsufficientFundsResult = isInsufficientFunds(amount, accountBalance);
    const isOptionReachMaxBetResult = isOptionReachMaxBet(currentTotalAmount, maxBetPerChoice);
    const isMinBetResult = isMinBet(amount, roundMinBet);
    const isMaxBetRoundResult = isMaxBetRound(currentTotalAmount, roundMaxBet, totalBetAmount);

    return suggestBetMode({
        suggestAmount,
        isInsufficientFunds: isInsufficientFundsResult,
        isOptionReachMaxBet: isOptionReachMaxBetResult,
        isMinBet: isMinBetResult,
        isMaxBetRound: isMaxBetRoundResult,
        maxBetPerChoice,
        roundMaxBet,
        roundMinBet,
        currentAmountOfChoice,
    });
};

const suggestBetMode = ({
    suggestAmount,
    isInsufficientFunds,
    isOptionReachMaxBet,
    isMinBet,
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

        if (isMinBet) {
            return getMinBetMode(roundMinBet, maxBetPerChoice);
        }
    }

    const condition = isSuggestBetAvailable(
        suggestAmount,
        currentAmountOfChoice,
        roundMinBet,
        roundMaxBet,
        isInsufficientFunds,
        isOptionReachMaxBet,
        isMaxBetRound
    );

    return {
        amount: suggestAmount,
        isInsufficientFunds,
        isAvailable: condition,
        mode: SuggestBetMode.SuggestBet,
    };
};

const getReachMaxBetMode = (maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.ReachMaxBet,
        errorCode: MessageErrorCode.optionMaxBet,
        args: { maxBet: maxBetPerChoice },
    };
};

const getMinBetMode = (roundMinBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MinBet,
        maxBetPerChoice,
        errorCode: MessageErrorCode.minBet,
        args: { minBet: roundMinBet },
    };
};

const getMaxBetRoundMode = (roundMaxBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MaxBetRound,
        maxBetPerChoice,
        errorCode: MessageErrorCode.roundMaxBet,
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

export const getTotalBetAmount = (gameStateContext: GameStateContextModel<unknown, unknown>) => {
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;
    let totalAmount = 0;
    totalAmount += Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
    totalAmount += Object.values(ownBets).reduce((a, b) => a + b, 0);

    return totalAmount;
};
