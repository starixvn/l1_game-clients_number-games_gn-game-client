import { FC, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSNTranslate } from "../../../_shared/react-hooks";
import { PFResult } from "../../../components/game-base/type";
import Styles from "./pf-next-ball.module.scss";
import SmallBall from "../../../components/game-components/small-ball";

const PFVerifyResultBlock: FC<{ pfResult: PFResult }> = ({ pfResult }) => {
    const { t: translateSNGames } = useSNTranslate();
    const drawResult = useMemo(() => {
        const beforeDrawResult = [];
        for (const item of pfResult?.roundResult || []) {
            beforeDrawResult.push(item);
            if (item?.drawId == pfResult?.drawId) {
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
            <div className="flex justify-center">
                <div className={Styles["balls-container"]}>
                    {drawResult?.result.map((item, _) => (
                        <SmallBall key={uuidv4()} number={item.ball} />
                    ))}
                </div>
            </div>
        </>
    );
};

const renderPFVerifyResultBlock = (pfResult: PFResult) => {
    return <PFVerifyResultBlock pfResult={pfResult} />;
};

export default renderPFVerifyResultBlock;
