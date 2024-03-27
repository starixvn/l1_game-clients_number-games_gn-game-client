import { FC, useMemo } from "react";
import { PFResult } from "../../../components/game-base/type";
import { useSNTranslate } from "../../../_shared/react-hooks";
import { useBallColor } from "../../../_shared/helpers";
import { v4 as uuidv4 } from "uuid";
import Styles from "./pf-next-ball.module.scss";

const PFVerifyResultBlock: FC<{ pfResult: PFResult }> = ({ pfResult }) => {
    const { t: translateSNGames } = useSNTranslate();
    const ballColor = useBallColor;
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
                {translateSNGames("glossary_draw_id").capitalizeFirstLetter()}: #{drawResult?.drawID} ({drawResult?.order})
            </div>
            <div className="flex justify-start">
                <div className={Styles["balls-container"]}>
                    {drawResult?.result.map((item, _) => (
                        <span key={uuidv4()} className={`${Styles["ball"]} ${Styles[ballColor({ number: item.ball })]}`}>
                            {item.ball}
                        </span>
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
