import { Round } from "../../game-base/type";

export type Props = {
    children: React.ReactNode;
    value: string | number;
};

export type PercentageStatisticProps = {
    roundHistory: Round<any, any>[];
    statisticRuleEntries: [string, (countResult: object, total: number) => number][];
    activeScoreboardTab?: number;
};
