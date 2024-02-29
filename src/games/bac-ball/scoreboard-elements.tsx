import { ReactNode } from "react";
import { Converter } from "sc-scoreboards";
import { Round } from "../../components/game-base/type";
import {
    BeadRoadElement,
    BigRoadElement,
    BigRoadRound,
    DerivedElement,
} from "../../components/game-components/round-history/scoreboard/elements";
import { BacBallBetOptions } from "./constants";
import styles from "./scoreboard-elements.module.scss";
import { BacBallResult, BacBallSettlementResult } from "./types";

export class BacBallBeadRoadCharacterElement extends BeadRoadElement<Round<BacBallResult, BacBallSettlementResult>> {
    renderElement(round: Round<BacBallResult, BacBallSettlementResult>): ReactNode {
        if (round.settlementResult.tie) {
            return <span className={`${styles.tie}`}>T</span>;
        } else if (round.settlementResult.banker) {
            return <span className={`${styles.banker}`}>B</span>;
        } else {
            return <span className={`${styles.player}`}>P</span>;
        }
    }
}

export class BacBallBeadRoadValueElement extends BeadRoadElement<Round<BacBallResult, BacBallSettlementResult>> {
    renderElement(round: Round<BacBallResult, BacBallSettlementResult>): ReactNode {
        if (round.settlementResult.tie) {
            return <span className={`${styles.tie} ${styles.value}`}>{round.result.banker}</span>;
        } else if (round.settlementResult.banker) {
            return <span className={`${styles.banker} ${styles.value}`}>{round.result.banker}</span>;
        } else {
            return <span className={`${styles.player} ${styles.value}`}>{round.result.player}</span>;
        }
    }
}

export class BacBallBigRoadConverter extends Converter<BacBallSettlementResult> {
    static instance = new BacBallBigRoadConverter();

    protected positiveKey(): string {
        return BacBallBetOptions.BANKER;
    }

    protected specialKey(): string {
        return BacBallBetOptions.TIE;
    }
}

export class BacBallBigRoadElement extends BigRoadElement<BacBallSettlementResult> {
    renderElement(round: BigRoadRound<BacBallSettlementResult>): ReactNode {
        const banker = round.data.some((result) => result.banker);
        const player = round.data.some((result) => result.player);
        const tie = round.data.filter((result) => result.tie);
        const extendClassName = tie.length !== 0 ? styles["big-road-tie"] : "";
        const tieValue = tie.length > 1 ? tie.length : "";

        if (banker) {
            return <span className={`${styles.banker} ${extendClassName}`}>{tieValue}</span>;
        } else if (player) {
            return <span className={`${styles.player} ${extendClassName}`}>{tieValue}</span>;
        } else {
            return <span className={`${styles["big-road-tie-first-round"]}`}>{tieValue}</span>;
        }
    }
}

export class BacBallBigEyeElement extends DerivedElement {
    renderA(): ReactNode {
        return <span className={`${styles["big-eye-banker"]}`} />;
    }

    renderB(): ReactNode {
        return <span className={`${styles["big-eye-player"]}`} />;
    }
}
