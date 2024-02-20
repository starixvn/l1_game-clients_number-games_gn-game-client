interface DynamicObject {
    [key: string]: any;
}

export const validateBet = (tempBets: { ownBets: DynamicObject }): boolean => {
    return false;
};

const getNoticeObj = (errorCode, extraData) => {
    return {
        errorCode,
        ...extraData,
    };
};
