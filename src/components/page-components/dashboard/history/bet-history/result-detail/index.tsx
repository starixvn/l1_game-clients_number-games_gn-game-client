import React from "react";

import BaseDialog from "../../../../../game-components/base-dialog";
import { Props } from "./result-detail";
import { ModalType } from "../../../../../game-components/base-dialog/type";
import Styles from "./result-detail.module.scss";

export const ResultDetailContainer: React.FC<Props> = (props) => {
    const { children, roundId, closeModal, gameName, customizeClass } = props;
    return (
        <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={closeModal}>
            <div
                key={roundId}
                className={`${Styles["popup-result-detail"]} ${customizeClass ? Styles[customizeClass] : ""}`}
                data-testid="bet-history-result-detail"
            >
                <div className={Styles["game-name"]} data-testid="game-name">
                    {gameName}
                </div>
                <span className={`icon-close ${Styles["icon-close"]}`} onClick={() => closeModal()} data-testid="icon-close"></span>
                <div className={Styles["roundId"]} data-testid="roundId">
                    #{roundId}
                </div>
                {children}
            </div>
        </BaseDialog>
    );
};

export default ResultDetailContainer;
