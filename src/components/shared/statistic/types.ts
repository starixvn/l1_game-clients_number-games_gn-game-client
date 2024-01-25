import { Round } from "../../../types";

export type Props = {
    children: React.ReactNode;
    value: string | number;
};

export type PropsFollowPercent = {
    roundHistory: Round<any, any>[];
    statisticRuleEntries: [string, (countResult: object, total: number) => number][];
    activeScoreboardTab?: number;
};
