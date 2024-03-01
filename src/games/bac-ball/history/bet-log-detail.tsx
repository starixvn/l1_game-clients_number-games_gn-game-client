import { randomBytes } from "crypto";
import { FC } from "react";
import { createPortal } from "react-dom";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { BetLogDetailProps } from "../../../components/game-components/bet-history";
import ModalContainer from "../../../components/game-components/modal-container";
import Styles from "./common.module.scss";
import { preprocessBetLogTime, seperateDateTime } from "./helper";
import TableRow from "./row-table";

interface BacBallBetDetailProps extends BetLogDetailProps {
    drawInfo: {
        drawId: number;
        result: {
            player: number;
            banker: number;
        };
        odds: {
            player: number;
            banker: number;
            tie: number;
        };
        settlementResult: {
            player: boolean;
            banker: boolean;
            tie: boolean;
        }
    };
}

const renderBetLogDetail = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }: BacBallBetDetailProps) => {
    return createPortal(
        <BetDetail betLogDetails={betLogDetails} onCloseModal={onCloseModal} isShowBetDetail={isShowBetDetail} drawInfo={drawInfo} />,
        document.getElementById("dashboard")
    );
};

const BetDetail: FC<BetLogDetailProps> = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }) => {
    const { drawId, result } = drawInfo;
    const ballColor = useBallColor;

    const handleCloseModal = () => {
        onCloseModal();
    };
    const handleClickProbalyFair = () => {
        console.log("Click Probaly Fair");
    };
    const header = [
        { node: "Time", size: 3.8 },
        { node: "Option", size: 2 },
        { node: "Odds", size: 2 },
        { node: "Stake", size: 2 },
        { node: "Win", size: 2 },
    ];
    const preprocessedBetLogDetails = preprocessBetLogTime(betLogDetails);
    return (
        isShowBetDetail && (
            <ModalContainer isOpen={isShowBetDetail} title="Bet Details" onCloseModal={handleCloseModal} isOverlap={true}>
                <div className="table-container react-infinite-table">
                    {result && (
                        <div className={Styles["draw-info"]}>
                            <div className={Styles["info-item"]}>
                                DrawID:{" "}
                                <span>
                                    <b>{drawId}</b>
                                </span>
                            </div>
                            <div className={Styles["info-item"]}>
                                Player:{" "}
                                <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.player })]}`}>{result.player}</span>
                            </div>
                            <div className={Styles["info-item"]}>
                                Banker:{" "}
                                <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.banker })]}`}>{result.banker}</span>
                            </div>
                        </div>
                    )}

                    <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProbalyFair}>
                        Provably Fair
                    </button>
                    <table className="table text-center">
                        <thead>
                            <TableRow isHeader={true}>{header}</TableRow>
                        </thead>
                        <tbody>
                            {preprocessedBetLogDetails?.map((item) => {
                                return <BetDetailRow betLogDetail={{ ...item, ...drawInfo }} key={randomBytes(10).toString()} />;
                            })}
                        </tbody>
                    </table>
                </div>
            </ModalContainer>
        )
    );
};

const BetDetailRow: FC<{ betLogDetail: any }> = ({ betLogDetail }) => {
    const { date, time } = seperateDateTime(betLogDetail.time);
    const { choice, odds, amount, settlementResult } = betLogDetail;
    const odd = odds[choice];
    const win = settlementResult?.[choice] ? amount*odd : 0;
    const content = [
        {
            node: (
                <>
                    <b>{time}</b>
                    <br />
                    {date}
                </>
            ),
            size: 3.8,
        },
        { node: <div className={win > 0 ? "highlight" : ""}>{choice}</div>, size: 2 },
        { node: <div className={win > 0 ? "highlight" : ""}>{odd}</div>, size: 2 },
        { node: <div className={win > 0 ? "highlight" : ""}>{amount ?? 0}</div>, size: 2 },
        { node: <div className={win > 0 ? "highlight" : ""}>{win}</div>, size: 2 },
    ];
    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLogDetail;
