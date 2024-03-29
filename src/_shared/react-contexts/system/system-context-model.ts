export interface SystemContextModel {
    selectedChip?: number;
    isUserGesture?: boolean;
    isEnableQuickBet?: boolean;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 1,
        isUserGesture: false,
        isEnableQuickBet: true,
    };
};
