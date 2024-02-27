import { Attributes, CSSProperties, Component, ComponentType, HTMLAttributes, ReactNode, createElement } from "react";
import styles from "./scoreboard.module.scss";

export type ScoreboardProps<Round> = {
    arrange: <Output>(data: Round[], scoreboard: Scoreboard<Round>) => Output[] | Round[];
    rounds: Round[];
    column?: number;
    row: number;
    element: ComponentType<ScoreboardItemProps<Round>>;
    className?: string;
};

export type ScoreboardItemProps<Round> = {
    round: Round;
    scoreboard?: Scoreboard<Round>;
};

export class Scoreboard<Round> extends Component<ScoreboardProps<Round>> {
    private renderElement(round: Round, props: Attributes | HTMLAttributes<unknown>): ReactNode {
        const { element } = this.props;

        return <div {...props}>{createElement(element, { round, scoreboard: this })}</div>;
    }

    render(): ReactNode {
        const { rounds, className } = this.props;
        const arranged = this.props.arrange(rounds, this);

        return (
            <div className={`${styles.scoreboard} ${className}`} data-testid="scoreboard">
                {arranged.map((round: Round, index: number) => {
                    const column = (index / this.props.row + 1) >> 0;
                    const row = (index % this.props.row) + 1;
                    const style: CSSProperties = {
                        gridColumnStart: column,
                        gridRowStart: row,
                    };

                    return this.renderElement(round, {
                        className: styles["scoreboard-item"],
                        style,
                        key: index,
                    });
                })}
            </div>
        );
    }
}
