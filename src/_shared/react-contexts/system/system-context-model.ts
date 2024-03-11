export interface SystemContextModel {
    selectedChip?: number;
    isUserGesture?: boolean;
}

export const initialSystemContextModel = (): SystemContextModel => {
    return {
        selectedChip: 1,
        isUserGesture: false,
    };
};
