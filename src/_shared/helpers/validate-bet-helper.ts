import { GameConfigs, RoundState } from "../../components/game-base/type";
import { NoticeErrorCode } from "../constants/error-code-dictionary";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";

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
    isMinBet: boolean;
    isMaxBetRound: boolean;
    maxBetPerChoice: number;
    roundMaxBet: number;
    roundMinBet: number;
    currentAmountOfChoice: number;
}

export const validateHedgeBet = (
    hedgeBetGroup: string[],
    ownBets: object,
    notConfirmOwnBets: object,
    betChoice: string,
    amount: number
): boolean => {
    const betTracks = { ...ownBets, ...notConfirmOwnBets };
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

export const isInsufficientFunds = (amount: number, accountBalance: number, totalBetAmount: number, enabledQuickBet: boolean): boolean => {
    if (enabledQuickBet) {
        return amount > accountBalance;
    }

    return totalBetAmount + amount > accountBalance;
};

export const isOptionReachMaxBet = (currentTotalAmountOfChoice: number, maxBetPerChoice: number): boolean => {
    return currentTotalAmountOfChoice > maxBetPerChoice;
};

export const isMinBet = (amount: number, roundMinBet: number): boolean => {
    return amount > 0 && amount < roundMinBet;
};

export const isMaxBetRound = (currentTotalAmount: number, roundMaxBet: number, totalBetAmount: number): boolean => {
    return currentTotalAmount > roundMaxBet || totalBetAmount > roundMaxBet;
};

export const isInPhasePreventBet = (gameStateContext: GameStateContextModel) => {
    return gameStateContext.roundState !== RoundState.InRound;
};

export const isBalanceUnavailable = (
    availableBalance: number,
    amount: number,
    gameStateContext: GameStateContextModel,
    enabledQuickBet: boolean
): boolean => {
    if (enabledQuickBet) {
        return availableBalance === 0;
    }
    const totalBetAmount = getTotalBetAmount(gameStateContext);
    return amount > 0 && availableBalance - totalBetAmount === 0;
};

export const isHedgeBet = (
    hedgeBetGroups: string[],
    betChoice: string,
    amount: number,
    gameStateContext: GameStateContextModel
): boolean => {
    return validateHedgeBet(hedgeBetGroups, gameStateContext.ownBets, gameStateContext?.notConfirmOwnBets, betChoice, amount);
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
    gameStateContext: GameStateContextModel,
    betChoice: string,
    amount: number,
    accountBalance: number,
    enabledQuickBet: boolean,
    handleSuggestBet?: (betChoice: string, availableSuggestBet: IAvailableSuggestBetAmount) => void
): { errorCode: string; args?: object } => {
    const criteria = composeValidationCriteria(
        amount,
        accountBalance,
        gameStateContext,
        betChoice,
        getTotalBetAmount(gameStateContext),
        enabledQuickBet
    );

    if (criteria.suggestAmount > 0 && criteria.isSuggestBet) {
        handleSuggestBet?.(betChoice, criteria);

        return;
    }

    if (criteria?.errorCode) {
        return { errorCode: criteria?.errorCode, args: criteria?.args };
    }

    return { errorCode: NoticeErrorCode.validBet };
};

const composeValidationCriteria = (
    amount: number,
    accountBalance: number,
    context: GameStateContextModel,
    betChoice: string,
    totalBetAmount: number,
    enabledQuickBet: boolean
): IAvailableSuggestBetAmount => {
    const { gameConfigs, userStakeLevel, notConfirmOwnBets, ownBets } = context;
    const { minBet: userMinBet, maxBet: userMaxBet } = userStakeLevel;

    const roundMinBet = getRoundMinBet(gameConfigs, userMinBet);
    const roundMaxBet = getRoundMaxBet(gameConfigs, userMaxBet);
    const maxBetPerChoice = getMaxBetPerChoice(gameConfigs, betChoice);
    const currentAmountOfChoice = getCurrentAmountOfChoice(ownBets, notConfirmOwnBets, betChoice);
    const maxAvailableAmountOfChoice = getMaxAvailableAmountOfChoice(maxBetPerChoice, currentAmountOfChoice, roundMaxBet, totalBetAmount);
    const suggestAmount = Math.min(accountBalance, maxAvailableAmountOfChoice);
    const isOptionReachMaxBetResult = isOptionReachMaxBet(currentAmountOfChoice + amount, maxBetPerChoice);
    const isInsufficientFundsResult = isInsufficientFunds(amount, accountBalance, totalBetAmount, enabledQuickBet);

    const isMinBetResult = isMinBet(amount, roundMinBet);
    const isMaxBetRoundResult = isMaxBetRound(totalBetAmount + amount, roundMaxBet, totalBetAmount);

    return determineBetMode({
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

const determineBetMode = ({
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
        suggestAmount,
        isInsufficientFunds,
        isSuggestBet: condition,
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

const getMinBetMode = (roundMinBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MinBet,
        maxBetPerChoice,
        errorCode: NoticeErrorCode.minBet,
        args: { minBet: roundMinBet },
    };
};

const getMaxBetRoundMode = (roundMaxBet: number, maxBetPerChoice: number): IAvailableSuggestBetAmount => {
    return {
        mode: SuggestBetMode.MaxBetRound,
        maxBetPerChoice,
        errorCode: NoticeErrorCode.roundMaxBet,
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

export const getTotalBetAmount = (gameStateContext: GameStateContextModel): number => {
    return (
        Object.values(gameStateContext.notConfirmOwnBets).reduce((a, b) => a + b, 0) +
        Object.values(gameStateContext.ownBets).reduce((a, b) => a + b, 0)
    );
};
