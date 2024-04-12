import { FC, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGameContext } from "../../../_shared/react-contexts";
import { useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { getGlossaryTranslate } from "../../../_shared/helpers";
import Styles from "./pf-bac-ball.module.scss";
import SmallBall from "../../../components/game-components/small-ball";
import { PFResult } from "../../../components/game-base/type";

const PFVerifyResultBlock: FC<{ pfResult: PFResult }> = ({ pfResult }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const drawResult = useMemo(() => {
        const beforeDrawResult = [];
        for (const item of pfResult?.roundResult || []) {
            beforeDrawResult.push(item);
            if (Number(item?.drawId) === pfResult?.drawId) {
                break;
            }
        }

        return {
            drawID: pfResult?.drawId,
            order: translateSNGames(`pf_draw_${beforeDrawResult.length}`),
            result: beforeDrawResult,
        };
    }, [pfResult]);
    return (
        <>
            <div className="text-white font-weight-medium mb-2">
                {translateSNGames("glossary_draw_id").capitalizeFirstLetter()}: {drawResult?.drawID} ({drawResult?.order})
            </div>
            <div className="flex justify-around">
                {useMemo(() => {
                    return ["player", "banker"].map((item) => {
                        return (
                            <div className="text-center" key={uuidv4()}>
                                <div className="text-white font-weight-medium text-uppercase">
                                    {translateInGame(getGlossaryTranslate(tolgeeNamespace, item))}
                                </div>
                                <div className={Styles["balls-container"]}>
                                    {drawResult.result.map((child, _) => (
                                        <SmallBall number={child[item]} key={uuidv4()} />
                                    ))}
                                </div>
                            </div>
                        );
                    });
                }, [drawResult])}
            </div>
        </>
    );
};

const renderPFVerifyResultBlock = (pfResult: PFResult) => {
    return <PFVerifyResultBlock pfResult={pfResult} />;
};

export default renderPFVerifyResultBlock;
