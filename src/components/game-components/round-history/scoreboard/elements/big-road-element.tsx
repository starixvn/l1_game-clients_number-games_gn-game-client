import { BigRoadScoreboard, Converter } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";

export type BigRoadRound<T> = {
    data: T[];
};

export abstract class BigRoadElement<Round> extends Component<ScoreboardItemProps<BigRoadRound<Round>>> {
    static arrange<Round>(converter: Converter<Round>) {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): Round[] {
            const height = scoreboard.props.row;
            const bigRoad = new BigRoadScoreboard({ converter, height });
            const input = [...rounds].reverse();

            bigRoad.initialize(input);

            const rows = bigRoad.rows();
            const result = {};

            rows.forEach((row, rowIndex) => {
                row.forEach((cell, columnIndex) => {
                    if (result[columnIndex]) {
                        result[columnIndex][rowIndex] = cell;
                    } else {
                        result[columnIndex] = { [rowIndex]: cell };
                    }
                });
            });

            return Object.values(result).flatMap((data) => Object.values(data));
        };
    }

    abstract renderElement(round: BigRoadRound<Round>): ReactNode;

    render(): ReactNode {
        const { round } = this.props;

        if (round?.data.length !== 0) {
            return this.renderElement(round);
        }
    }
}
