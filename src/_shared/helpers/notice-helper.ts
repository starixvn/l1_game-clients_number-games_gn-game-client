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

export const createOptionForHedgeBetGroup = (hedgeBetGroup: string[], tolgeeNamespace) => {
    const option = {};
    hedgeBetGroup?.forEach((choice, index) => {
        option[`betChoice${index + 1}`] = getGlossaryTranslate(tolgeeNamespace, choice);
    });
    return option;
};

export const getGlossaryTranslate = (ns: string, key: string) => `${ns}.glossary_${key}`;

export const isKickOutError = (errorCode: string) => ["1001", "1002", "7000", "7001"].includes(String(errorCode));

export const getExtendMessageByErrorCode = (errorCode: string): string => {
    let extendMessage = "";
    if (isKickOutError(errorCode)) {
        extendMessage = ` (${errorCode})`;
    }
    return extendMessage;
};
