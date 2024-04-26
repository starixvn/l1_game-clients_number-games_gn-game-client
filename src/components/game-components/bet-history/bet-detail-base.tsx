import { FC, ReactNode } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useCommonTranslate } from "../../../_shared/react-hooks";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { DrawInfo } from "../../game-base/type";
import { InfiniteTable } from "../infinite-table";
import Styles from "./bet-history.module.scss";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";

const BetDetailBase: FC<{
    renderBetDetailResultBlock: (drawInfo: DrawInfo) => ReactNode;
    produceDataBetDetailRow: (
        betLogDetail: any,
        drawInfo: DrawInfo
    ) => {
        rawTime: Date;
        amount: number;
        choice: any;
        odds: number;
        win: number;
        hightlight: boolean;
    };
    renderBetChoice?: (choice: any) => ReactNode;
}> = ({ renderBetDetailResultBlock, produceDataBetDetailRow, renderBetChoice }) => {
    const {
        betDetailModalData: { drawInfo, betLogDetails },
    } = useGameStateContext();
    const dispatch = usePFDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { fractionalOddsFormat } = usePlayerContext();
    const clickSound = useClickSound();

    const handleClickProvablyFair = () => {
        clickSound();
        dispatch({
            type: PFEventActionType.UPDATE_PF_VERIFY,
            payload: {
                pfVerifyModalData: {
                    ...drawInfo.pfResult,
                    clientSeed: drawInfo.clientSeed,
                },
            },
        });
        dispatch({
            type: PFEventActionType.TOGGLE_PF_VERIFY,
            payload: {
                isShowPFVerify: true,
            },
        });
    };

    const header = [
        { node: translateCommon("time") },
        { node: translateCommon("bet_choice") },
        { node: translateCommon("odds") },
        { node: translateCommon("stake") },
        { node: translateCommon("win") },
    ];

    const preprocessedBetLogDetails = sortedCollectionByTime(betLogDetails);

    const body = preprocessedBetLogDetails.map((betLogDetail) => {
        const { rawTime, amount, choice, odds, win, hightlight } = produceDataBetDetailRow(betLogDetail, drawInfo);
        const { date, time } = separateDateTime(rawTime);
        return [
            {
                node: (
                    <>
                        {time}
                        <br />
                        {date}
                    </>
                ),
            },
            ...[renderBetChoice(choice), numberWithCommas(fractionalOddsFormat ? odds - 1 : odds), numberWithCommas(amount) ?? 0].map(
                (item) => {
                    return { node: <div className={hightlight ? "highlight" : ""}>{item}</div> };
                }
            ),
            {
                node: <div className={hightlight ? "highlight" : ""}>{numberWithCommas(win)}</div>,
            },
        ];
    });

    return (
        <>
            {drawInfo.result && renderBetDetailResultBlock(drawInfo)}

            <button className={`clickable ${Styles["provably-fair"]}`} onClick={handleClickProvablyFair}>
                <span className={`icon-pf ${Styles["icon-pf"]}`}></span>
                {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
            </button>

            <InfiniteTable header={header} body={body} customTableContainerStyles={Styles["bet-detail"]} />
        </>
    );
};

export default BetDetailBase;
