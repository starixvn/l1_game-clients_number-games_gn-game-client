import { Round } from "../../game-base/type";

export type Props = {
    children: React.ReactNode;
    value: string | number;
    className?: string;
};

export type PercentageStatisticProps = {
    roundHistory: Round<any, any>[];
    mainChoices: string[];
    activeScoreboardTab?: number;
    choicesInGroups?: string[][];
    selectedGroup?: number;
    onSelectGroup?: Function;
    className?: string;
    subChoices?: string[];
    subChoicesClass?: {};
};
