export interface SystemContextModel {
    selectedChip: number;
    enabledSound: boolean;
    enabledQuickBet: boolean;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 1,
        enabledSound: true,
        enabledQuickBet: false,
    };
};
