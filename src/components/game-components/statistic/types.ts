import { Round } from "../../game-base/type";

export type Props = {
    children: React.ReactNode;
    value: string | number;
    className?: string;
};

export type PercentageStatisticProps = {
    roundHistory: Round<any, any>[];
    statisticRuleEntries: [string, (countResult: object, total: number) => number][];
    activeScoreboardTab?: number;
    group?: number;
    selectedGroup?: number;
    onSelectGroup?: Function;
    className?: string;
    otherStatisticRuleEntries?: [string, (countResult: object, total: number) => number][];
    subBetOptionClass?: {};
};
