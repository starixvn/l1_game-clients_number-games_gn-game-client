import { FC, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { PFResult } from "../../../components/game-base/type";
import Styles from "./pf-se-ball.module.scss";
import SmallBall from "../../../components/game-components/small-ball";

const PFVerifyResultBlock: FC<{ pfResult: PFResult }> = ({ pfResult }) => {
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateCommon } = useCommonTranslate();

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

    const ballItems = drawResult.result.map((item) => item.balls).flat();

    return (
        <>
            <div className="text-white font-weight-medium mb-2">
                {translateCommon("round").capitalizeFirstLetter()}: {drawResult?.drawID}
            </div>
            <div className="flex justify-center">
                <div className={Styles["balls-container"]}>
                    {ballItems.map((item, _) => (
                        <SmallBall key={uuidv4()} number={item} />
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
