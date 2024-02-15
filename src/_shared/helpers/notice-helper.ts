import ErrorCodeDictionary, { CommonErrorCodeList } from "../constants/error-code-dictionary";

export const GetLocalizedErrorMessage = (errorCode: string, isPlaceBet = false) => {
    if (!ErrorCodeDictionary[errorCode]) {
        return "message_error_occurred";
    }

    let key = ErrorCodeDictionary[errorCode];
    const isCommonErrorCode = CommonErrorCodeList.includes(ErrorCodeDictionary[errorCode]);
    if (isCommonErrorCode && isPlaceBet) {
        key = `${key}_place_bet`;
    }

    return key;
};
