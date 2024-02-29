import { FC } from "react";
import { createPortal } from "react-dom";
import { preprocessBetLogTime, seperateDateTime } from "./helper";
import TableRow from "./row-table";
import { BetLogDetailProps } from "../../../components/game-components/bet-history";
import Styles from "./common.module.scss";
import { randomBytes } from "crypto";
import ModalContainer from "../../../components/game-components/modal-container";

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
        stake: {
            player: number;
            banker: number;
            tie: number;
        };
    };
}

const renderBetLogDetail = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }: BacBallBetDetailProps) => {
    return createPortal(
        <BetDetail betLogDetails={betLogDetails} onCloseModal={onCloseModal} isShowBetDetail={isShowBetDetail} drawInfo={drawInfo} />,
        document.getElementById("dashboard")
    );
};

const BetDetail: FC<BetLogDetailProps> = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }) => {
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
        { node: "Amount", size: 2 },
    ];
    const preprocessedBetLogDetails = preprocessBetLogTime(betLogDetails);
    return (
        isShowBetDetail && (
            <ModalContainer isOpen={isShowBetDetail} title="Bet Details" onCloseModal={handleCloseModal} isOverlap={true}>
                <div className={Styles["table-fixed-head"]}>
                    <div className={Styles["draw-info"]}>
                        <div>
                            DrawID: {drawInfo?.drawId} Player: {drawInfo?.result?.player} Banker: {drawInfo?.result?.banker}
                        </div>
                        <button className={`${Styles["btn-clickable"]}`} onClick={handleClickProbalyFair}>
                            Probaly Fair
                        </button>
                    </div>
                    <table>
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
        { node: betLogDetail.choice, size: 2 },
        { node: betLogDetail.odds[betLogDetail.choice], size: 2 },
        { node: betLogDetail.stake[betLogDetail.choice] ?? 0, size: 2 },
        { node: betLogDetail.amount, size: 2 },
    ];
    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLogDetail;
