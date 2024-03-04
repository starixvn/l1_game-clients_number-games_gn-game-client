export interface SystemContextModel {
    selectedChip: number;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 1,
    };
};
