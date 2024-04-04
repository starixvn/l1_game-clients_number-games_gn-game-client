import { randomBytes } from "crypto";
import { FC, useState } from "react";
import { useGameContext, usePlayerContext } from "../../../_shared/react-contexts";
import { getGlossaryTranslate, numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import TableRow from "./row-table";
import { BacBallBetOptions } from "../constants";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { v4 as uuidv4 } from "uuid";
import SmallBall from "../../../components/game-components/small-ball";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import { useClickSound, useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import Styles from "./common.module.scss";

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

const BetDetail: FC = () => {
    const {
        betDetailModalData: { drawInfo, betLogDetails },
    } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const { drawId, result } = drawInfo;
    const [isHaveMoreData, setIsHaveMoreData] = useState(true);
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { tolgeeNamespace } = useGameContext();
    const { t: translateBacBall } = useTranslator([tolgeeNamespace]);
    const clickSound = useClickSound();

    const handleClickProvablyFair = () => {
        clickSound();
        dispatch({
            type: GameEventActionType.UPDATE_PF_VERIFY,
            payload: {
                pfVerifyModalData: {
                    ...drawInfo.pfResult,
                    clientSeed: drawInfo.clientSeed,
                },
            },
        });
        dispatch({
            type: GameEventActionType.TOGGLE_PF_VERIFY,
            payload: {
                isShowPFVerify: true,
            },
        });
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
        <>
            {result && (
                <div className={Styles["draw-info"]}>
                    <div className={`${Styles["info-item"]} font-weight-500`}>
                        {translateSNGames("glossary_draw_id").capitalizeFirstLetter()}: <span>{drawId}</span>
                    </div>
                    <div className={Styles["info-item"]}>
                        <span className="font-weight-medium">{translateBacBall("glossary_player").toUpperCase()}</span>
                        <SmallBall number={result.player} />
                    </div>
                    <div className={Styles["info-item"]}>
                        <span className="font-weight-medium">{translateBacBall("glossary_banker").toUpperCase()}</span>
                        <SmallBall number={result.banker} />
                    </div>
                </div>
            )}

            <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProvablyFair}>
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
        </>
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
    const { date, time } = separateDateTime(rawTime);
    const { tolgeeNamespace } = useGameContext();

    const { t: translateBacBall } = useTranslator([tolgeeNamespace]);
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
            <span key={uuidv4()} className="font-text">
                {translateBacBall(getGlossaryTranslate(tolgeeNamespace, choice))}
            </span>,
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

export default BetDetail;
