import { randomBytes } from "crypto";
import { FC } from "react";
import { createPortal } from "react-dom";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { BetLogDetailProps } from "../../../components/game-components/bet-history";
import ModalContainer from "../../../components/game-components/modal-container";
import Styles from "./common.module.scss";
import { preprocessBetLogTime, seperateDateTime } from "./helper";
import TableRow from "./row-table";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks/use-translator";

interface BacBallBetDetailProps extends BetLogDetailProps {
    drawInfo: DrawInfo;
}

interface DrawInfo {
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
    const { t: tCommand } = useCommonTranslate();
    const { t: tSNGames } = useSNTranslate();
    const { t } = useTranslator(["BacBall"]);

    const handleCloseModal = () => {
        onCloseModal();
    };
    const handleClickProbalyFair = () => {
        console.log("Click Probaly Fair");
    };
    const header = [
        { node: tCommand("time"), size: 3.8 },
        { node: tCommand("bet_choice"), size: 2 },
        { node: tCommand("odds"), size: 2 },
        { node: tCommand("stake"), size: 2 },
        { node: tCommand("win"), size: 2 },
    ];
    const preprocessedBetLogDetails = preprocessBetLogTime(betLogDetails);
    return (
        isShowBetDetail && (
            <ModalContainer isOpen={isShowBetDetail} title={tCommand("bet_detail")} onCloseModal={handleCloseModal} isOverlap={true}>
                {result && (
                    <div className={Styles["draw-info"]}>
                        <div className={Styles["info-item"]}>
                            {tSNGames("draw_id")}:{" "}
                            <span>
                                <b>{drawId}</b>
                            </span>
                        </div>
                        <div className={Styles["info-item"]}>
                            {t("glossary_player")}:{" "}
                            <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.player })]}`}>{result.player}</span>
                        </div>
                        <div className={Styles["info-item"]}>
                            {t("glossary_banker")}:{" "}
                            <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.banker })]}`}>{result.banker}</span>
                        </div>
                    </div>
                )}

                <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProbalyFair}>
                    {tCommand("pf_title_provably_fair")}
                </button>
                <div className={`table-container react-infinite-table ${Styles["bet-detail"]}`}>
                    <table className="table text-center">
                        <thead>
                            <TableRow isHeader={true}>{header}</TableRow>
                        </thead>
                        <tbody>
                            {preprocessedBetLogDetails?.map((item) => {
                                return <BetDetailRow {...produceDataBetDetailRow(item, drawInfo)} key={randomBytes(10).toString()} />;
                            })}
                        </tbody>
                    </table>
                </div>
            </ModalContainer>
        )
    );
};

const produceDataBetDetailRow = (item: any, drawInfo: DrawInfo) => {
    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.odds[item.choice],
        win: drawInfo.settlementResult?.[item.choice] ? item.amount * drawInfo.odds[item.choice] : 0,
    };
};

interface BacBallBetLogDetailRowProps {
    rawTime: Date;
    amount: number;
    choice: string;
    odds: number;
    win: number;
}

const BetDetailRow: FC<BacBallBetLogDetailRowProps> = ({ rawTime, amount, choice, odds, win }) => {
    const { date, time } = seperateDateTime(rawTime);
    const { t } = useTranslator(["BacBall"]);
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
        ...[t(`glossary_${choice}`), odds, amount ?? 0, win].map((item) => {
            return { node: <div className={win > 0 ? "highlight" : ""}>{item}</div>, size: 2 };
        }),
    ];
    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLogDetail;
