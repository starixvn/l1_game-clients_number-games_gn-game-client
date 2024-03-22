import { Attributes, CSSProperties, Component, ComponentType, HTMLAttributes, ReactNode, createElement } from "react";
import { TranslatorProps } from "../../../page-components/translator";
import styles from "./scoreboard.module.scss";
import { chunk } from "./utilities";

export type ScoreboardProps<Round> = {
    arrange: (data: unknown[], scoreboard: unknown) => unknown[];
    rounds: Round[];
    column?: number;
    row: number;
    element: ComponentType<any>;
    className?: string;
    elementClassName?: string;
    blockClassName?: string;
    block?: number;
} & HTMLAttributes<unknown>;

export type ScoreboardItemProps<Round> = {
    round: Round;
    scoreboard?: Scoreboard<Round>;
} & TranslatorProps;

export class Scoreboard<Round> extends Component<ScoreboardProps<Round>> {
    static defaultProps: Partial<ScoreboardProps<unknown>> = {
        column: 17,
        row: 6,
        className: "",
        elementClassName: "",
        block: 1,
        blockClassName: "",
    };

    private renderElement(round: Round, props: Attributes | HTMLAttributes<unknown>): ReactNode {
        const { element } = this.props;

        return <div {...props}>{createElement(element, { round, scoreboard: this })}</div>;
    }

    private createGroup(rounds: Round[] | unknown[]) {
        const { block, row } = this.props;
        const rowByGroup = (row / block) >> 0;

        const horizontalGroups = chunk(rounds, block);
        const columns = chunk(horizontalGroups, rowByGroup);
        const verticalGroups = chunk(columns, block);

        const groups = verticalGroups.flatMap((vertical) => {
            const blocks = [];

            for (let row = 0; row < rowByGroup; row++) {
                const block = [];

                for (let horizontal of vertical) {
                    block.push(...horizontal[row]);
                }

                blocks.push(block);
            }

            return blocks;
        });

        return groups;
    }

    getHTMLAttributes() {
        const { rounds, className, elementClassName, block, row: originalRow, element, arrange, blockClassName, ...htmlProps } = this.props;

        return htmlProps;
    }

    render(): ReactNode {
        const { rounds, className, elementClassName, blockClassName, block, row: originalRow, arrange } = this.props;
        const htmlProps = this.getHTMLAttributes();
        const arranged = arrange(rounds, this);
        const groupItems = this.createGroup(arranged);

        return (
            <div className={`${styles.scoreboard} ${className}`} {...htmlProps} data-testid="scoreboard">
                {groupItems.map((items: Round[], index: number) => {
                    const rowByGroup = (originalRow / block) >> 0;
                    const column = (index / rowByGroup + 1) >> 0;
                    const row = (index % rowByGroup) + 1;
                    const style: CSSProperties = {
                        gridColumnStart: column,
                        gridRowStart: row,
                    };

                    return (
                        <div className={`${styles["scoreboard-block"]} ${blockClassName}`} key={index} style={style}>
                            {items.map((round, index) => {
                                const column = (index / block + 1) >> 0;
                                const row = (index % block) + 1;
                                const style: CSSProperties = {
                                    gridColumnStart: column,
                                    gridRowStart: row,
                                };

                                return this.renderElement(round, {
                                    className: `${styles["scoreboard-item"]} ${elementClassName}`,
                                    style,
                                    key: index,
                                });
                            })}
                        </div>
                    );
                })}
            </div>
        );
    }
}
