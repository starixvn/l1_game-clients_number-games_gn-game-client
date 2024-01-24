import React from "react";

import { Props } from "./bet-history-detail";
import BaseDialog from "../../../../shared/base-dialog";
import Styles from "./bet-history-details.module.scss";

const BetHistoryDetailsContainer: React.FC<Props> = ({
    renderBetLogsDetails,
    renderResultDetail,
    isShowResultDetail,
    closeModalBetHistory,
    closeModalBetDetails,
    translateText,
}) => {
    return (
        <BaseDialog onCloseModal={closeModalBetDetails} enableBackdrop={true}>
            <div className={Styles["bet-log-details"]} data-testid="bet-history-details">
                <div className={Styles["back"]} onClick={closeModalBetDetails}>
                    <img src={`/static/images/arrow-left.svg`} className={Styles["arrow-left"]} alt="arrow-left" />
                </div>
                <div className={Styles["details"]}> {translateText.betDetails}</div>
                <span className={`icon-close ${Styles["icon-close"]}`} onClick={closeModalBetHistory} data-testid="icon-close"></span>
                {renderBetLogsDetails as any}
            </div>
            {isShowResultDetail && renderResultDetail}
        </BaseDialog>
    );
};

export default BetHistoryDetailsContainer;
