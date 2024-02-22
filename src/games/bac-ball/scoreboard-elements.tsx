import { ReactNode } from "react";
import { Round } from "../../components/game-base/type";
import { BeadRoadElement } from "../../components/game-components/round-history/scoreboard/elements";
import { BacBallResult, BacBallSettlementResult } from "./types";
import styles from "./scoreboard-elements.module.scss";

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

    renderEmpty(): ReactNode {
        return <span className={styles.empty} />;
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

    renderEmpty(): ReactNode {
        return <span className={styles.empty} />;
    }
}
