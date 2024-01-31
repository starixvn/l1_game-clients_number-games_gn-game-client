import ErrorCodeDictionary, { CommonErrorCodeList } from "../constants/error-code-dictionary";

export const GetLocalizedErrorMessage = (errorCode: string, isPlaceBet = false) => {
    if (!ErrorCodeDictionary[errorCode]) {
        return "messages:errorOccurred";
    }

    let key = ErrorCodeDictionary[errorCode];
    const isCommonErrorCode = CommonErrorCodeList.includes(ErrorCodeDictionary[errorCode]);
    if (isCommonErrorCode && isPlaceBet) {
        key = `${key}PlaceBet`;
    }

    return `messages:${key}`;
};
