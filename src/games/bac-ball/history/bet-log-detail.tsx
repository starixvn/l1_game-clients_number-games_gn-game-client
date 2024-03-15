import { randomBytes } from "crypto";
import { FC, useState } from "react";
import { createPortal } from "react-dom";

import { numberWithCommas, seperateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks/use-translator";
import { BetLogDetailProps } from "../../../components/game-components/bet-history";
import ModalContainer from "../../../components/game-components/modal-container";
import Styles from "./common.module.scss";
import TableRow from "./row-table";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { BacBallBetOptions } from "../constants";
import PFVerifyModal from "../../../components/game-components/pf-verify";
import { DrawInfo, PFResult } from "../../../components/game-base/type";

interface BacBallBetDetailProps extends BetLogDetailProps {
    drawInfo: DrawInfoBacBall;
}

interface DrawInfoBacBall extends DrawInfo {
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
    pfResult: PFResult;
}

const renderBetLogDetail = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }: BacBallBetDetailProps) => {
    return createPortal(
        <BetDetail betLogDetails={betLogDetails} onCloseModal={onCloseModal} isShowBetDetail={isShowBetDetail} drawInfo={drawInfo} />,
        document.getElementById("dashboard")
    );
};

const BetDetail: FC<BetLogDetailProps> = ({ betLogDetails, onCloseModal, isShowBetDetail, drawInfo }) => {
    const { drawId, result } = drawInfo;
    const [isHaveMoreData, setIsHaveMoreData] = useState(true);
    const [isShowPFVerify, setIsShowPFVerify] = useState(false);
    const ballColor = useBallColor;
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateBacBall } = useTranslator(["BacBall"]);

    const handleCloseModal = () => {
        onCloseModal();
        setIsHaveMoreData(true);
    };

    const handleClosePFVerifyModal = () => {
        setIsShowPFVerify(false);
    };

    const handleClickProbalyFair = () => {
        setIsShowPFVerify(true);
    };

    const handleScroll = (event: any) => {
        const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
        if (bottom) {
            setIsHaveMoreData(false);
        }
    };

    const header = [
        { node: translateCommon("time"), size: 2 },
        { node: translateCommon("bet_choice"), size: 2.5 },
        { node: translateCommon("odds"), size: 2.5 },
        { node: translateCommon("stake"), size: 2.5 },
        { node: translateCommon("win"), size: 2.5 },
    ];
    const preprocessedBetLogDetails = sortedCollectionByTime(betLogDetails);

    return (
        isShowBetDetail && (
            <ModalContainer
                id="bet-detail"
                isOpen={isShowBetDetail && !isShowPFVerify}
                title={translateCommon("bet_detail")}
                onCloseModal={handleCloseModal}
                isOverlap={true}
            >
                {result && (
                    <div className={Styles["draw-info"]}>
                        <div className={Styles["info-item"]}>
                            {translateSNGames("glossary_draw_id")}: <span className="font-weight-medium">{drawId}</span>
                        </div>
                        <div className={Styles["info-item"]}>
                            <span className="font-weight-medium">{translateBacBall("glossary_player").toUpperCase()}</span>
                            <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.player })]}`}>{result.player}</span>
                        </div>
                        <div className={Styles["info-item"]}>
                            <span className="font-weight-medium">{translateBacBall("glossary_banker").toUpperCase()}</span>
                            <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.banker })]}`}>{result.banker}</span>
                        </div>
                    </div>
                )}

                <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProbalyFair}>
                    <span className={`icon-pf ${Styles["icon-pf"]}`}></span>
                    {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
                </button>
                <div className={`table-container react-infinite-table ${Styles["bet-detail"]}`} onScroll={handleScroll}>
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
                    {!isHaveMoreData && <div className={Styles["no-more-data"]}>{translateSNGames("table_no_more_data")}</div>}
                </div>
                <PFVerifyModal
                    handleCloseModal={handleClosePFVerifyModal}
                    isShowPFVerify={isShowPFVerify}
                    pfResult={drawInfo?.pfResult}
                ></PFVerifyModal>
            </ModalContainer>
        )
    );
};

const produceDataBetDetailRow = (item: any, drawInfo: DrawInfoBacBall) => {
    const calculateWin = (isTie: boolean, isWin: true, amount: number, odds: number) => {
        if (isTie) {
            return isWin ? amount * odds : amount;
        }

        return isWin ? amount * odds : 0;
    };
    const win = calculateWin(
        drawInfo.settlementResult?.[BacBallBetOptions.TIE],
        drawInfo.settlementResult?.[item.choice],
        item.amount,
        drawInfo.odds[item.choice]
    );

    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.odds[item.choice],
        win: win,
        hightlight: drawInfo.settlementResult?.[item.choice],
    };
};

interface BacBallBetLogDetailRowProps {
    rawTime: Date;
    amount: number;
    choice: string;
    odds: number;
    win: number;
    hightlight: boolean;
}

const BetDetailRow: FC<BacBallBetLogDetailRowProps> = ({ rawTime, amount, choice, odds, win, hightlight }) => {
    const { date, time } = seperateDateTime(rawTime);
    const { t: translateBacBall } = useTranslator(["BacBall"]);
    const { fractionalOddsFormat } = usePlayerContext();
    const content = [
        {
            node: (
                <>
                    {time}
                    <br />
                    {date}
                </>
            ),
            size: 2,
        },
        ...[
            translateBacBall(`glossary_${choice}`),
            numberWithCommas(fractionalOddsFormat ? odds - 1 : odds),
            numberWithCommas(amount) ?? 0,
        ].map((item) => {
            return { node: <div className={hightlight ? "highlight" : ""}>{item}</div>, size: 2.5 };
        }),
        {
            node: <div className={win > 0 ? "highlight" : ""}>{numberWithCommas(win)}</div>,
            size: 2.5,
        },
    ];
    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLogDetail;
