import { Attributes, CSSProperties, Component, ComponentType, HTMLAttributes, ReactNode, createElement } from "react";
import styles from "./scoreboard.module.scss";

export type ScoreboardProps<Round> = {
    arrange: <Output>(data: Round[], scoreboard: Scoreboard<Round>) => Output[] | Round[];
    rounds: Round[];
    column: number;
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

    private getExtendClassName(column: number, row: number): string {
        return column === 1 && row === 1
            ? styles["top-left"]
            : column === 1 && row === this.props.row
            ? styles["bottom-left"]
            : column === this.props.column && row === 1
            ? styles["top-right"]
            : column === this.props.column && row === this.props.row
            ? styles["bottom-right"]
            : "";
    }

    render(): ReactNode {
        const { rounds, className } = this.props;
        const arranged = this.props.arrange(rounds, this);

        return (
            <div className={className} data-testid="scoreboard">
                <div className={styles.scoreboard}>
                    {arranged.map((round: Round, index: number) => {
                        const column = (index / this.props.row + 1) >> 0;
                        const row = (index % this.props.row) + 1;
                        const style: CSSProperties = {
                            gridColumnStart: column,
                            gridRowStart: row,
                        };
                        const extendClassName = this.getExtendClassName(column, row);

                        return this.renderElement(round, {
                            className: `${styles["scoreboard-item"]} ${extendClassName}`,
                            style,
                            key: index,
                        });
                    })}
                </div>
            </div>
        );
    }
}
