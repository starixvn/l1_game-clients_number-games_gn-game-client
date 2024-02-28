import { BigRoadScoreboard, BigRoadScoreboardPoint, Converter } from "sc-scoreboards";
import type { Scoreboard, ScoreboardItemProps } from "../scoreboard";

import { Component, ReactNode } from "react";
import { toFlattenColumns } from "./utilities";

export type BigRoadRound<T> = BigRoadScoreboardPoint<T>;

export abstract class BigRoadElement<Round> extends Component<ScoreboardItemProps<BigRoadRound<Round>>> {
    static arrange<Round>(converter: Converter<Round>) {
        return function (rounds: Round[], scoreboard: Scoreboard<Round>): BigRoadRound<Round>[] {
            const height = scoreboard.props.row;
            const bigRoad = new BigRoadScoreboard({ converter, height });
            const input = [...rounds].reverse();

            bigRoad.initialize(input);

            const rows = bigRoad.rows();

            return toFlattenColumns(rows);
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
