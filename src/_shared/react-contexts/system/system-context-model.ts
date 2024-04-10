export interface SystemContextModel {
    selectedChip?: number;
    isEnableQuickBet?: boolean;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 1,
        isEnableQuickBet: true,
    };
};
