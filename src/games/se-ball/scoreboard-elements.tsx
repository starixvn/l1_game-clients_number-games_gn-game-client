import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "../../components/game-base/type";
import { BeadRoadElement, BigRoadElement, BigRoadRound } from "../../components/game-components/round-history/scoreboard/elements";
import { registerBigRoadElement } from "../../components/page-components/lobby/games/components/scoreboard";
import { withTranslator } from "../../components/page-components/translator";
import { SeBallBetOptions } from "./se-ball-constants";
import styles from "./scoreboard-elements.module.scss";
import { SeBallResult, SeBallSettlementResult } from "./types";

export const ODD_EVEN_AS_DEFAULT_SCOREBOARD = true;

export function createBeadRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    class Element extends BeadRoadElement<Round<SeBallResult, SeBallSettlementResult>> {
        renderElement(round: Round<SeBallResult, SeBallSettlementResult>, t?: (key: string) => string): ReactNode {
            const character = (betChoice: string) => t(`SeBall.beadboard_${betChoice}`);

            if (!round.settlementResult) {
                return <span className={`${styles.blink}`}></span>;
            } else if (round.settlementResult.odd) {
                return <span className={styles[SeBallBetOptions.ODD]}>{character(SeBallBetOptions.ODD)}</span>;
            } else if (round.settlementResult.even) {
                return <span className={styles[SeBallBetOptions.EVEN]}>{character(SeBallBetOptions.EVEN)}</span>;
            }
        }

        render(): ReactNode {
            const { round, t } = this.props;

            if (round) {
                return this.renderElement(round, t);
            }
        }
    }

    return withTranslator(Element);
}

export class SeBallBigRoadConverter extends Converter<SeBallSettlementResult> {
    static addBlinkNode(rounds: SeBallSettlementResult[]) {}

    static instance = SeBallBigRoadConverter.getInstance(ODD_EVEN_AS_DEFAULT_SCOREBOARD);

    static getInstance(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
        return new SeBallBigRoadConverter(isOddEven);
    }

    constructor(private readonly isOddEven: boolean) {
        super();
    }

    protected positiveKey(): string {
        return SeBallBetOptions.ODD;
    }

    protected specialKey(): string {
        return "";
    }
}

export function createBigRoadElement(isOddEven: boolean = ODD_EVEN_AS_DEFAULT_SCOREBOARD) {
    return class Element extends BigRoadElement<SeBallSettlementResult> {
        renderElement(round: BigRoadRound<SeBallSettlementResult>): ReactNode {
            const odd = round.data.some((result) => result.odd);
            const isBlinkNode = round.data.some((result) => result.even === undefined);

            console.log(round.data);
            if (isBlinkNode) {
                return <span className={styles.blink}></span>;
            } else if (odd) {
                return <span className={styles.red}></span>;
            } else {
                return <span className={styles.blue}></span>;
            }
        }
    };
}

registerBigRoadElement(createBigRoadElement(ODD_EVEN_AS_DEFAULT_SCOREBOARD), SeBallBigRoadConverter, 1003, 1004);
