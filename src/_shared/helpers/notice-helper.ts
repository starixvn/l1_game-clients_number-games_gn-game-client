import ErrorCodeDictionary, { CommonErrorCodeList } from "../constants/error-code-dictionary";

export interface INotice {
    errorCode: string;
    hedgeBetGroup?: string[];
    minBet?: number;
    maxBet?: number;
    gameRoundId?: number;
    gameTypeId?: number;
    isPlaceBetFailed?: boolean;
}
export const GetLocalizedErrorMessage = (errorCode: string, isPlaceBet = false) => {
    if (!ErrorCodeDictionary[errorCode]) {
        return "Common.message_error_occurred";
    }

    let key = ErrorCodeDictionary[errorCode];
    const isCommonErrorCode = CommonErrorCodeList.includes(ErrorCodeDictionary[errorCode]);
    if (isCommonErrorCode && isPlaceBet) {
        key = `${key}_place_bet`;
    }

    return key;
};

export const createOptionForHedgeBetGroup = (hedgeBetGroup: string[]) => {
    const option = {};
    hedgeBetGroup?.forEach((choice, index) => {
        option[`betChoice${index + 1}`] = `glossary_${choice}`;
    });
    return option;
};
