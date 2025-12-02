export interface SystemContextModel {
    selectedChip?: number;
    isEnableQuickBet?: boolean;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 0,
        isEnableQuickBet: true,
    };
};
