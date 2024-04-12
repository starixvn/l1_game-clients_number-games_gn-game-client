import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import SmallBall from "../../../components/game-components/small-ball";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";

const PFVerification: FC = () => {
    const { pfVerifyModalData: pfResult } = useGameStateContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = useGameStatesDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);

    const verifyInfo = useMemo(() => {
        const rawTwoFirstDigits = combinedHash.substring(0, 2);
        const valueTwoFirstDigits = parseInt(rawTwoFirstDigits, 16);
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumber = parseInt(serverSeed?.random || "-1");
        const remainBalls = (serverSeed?.remain || "").split(":");
        const index = ((randomNumber + valueTwoFirstDigits) % remainBalls.length) + 1;
        const result = remainBalls[index - 1];

        return {
            rawTwoFirstDigits,
            valueTwoFirstDigits,
            numberRemainBalls: remainBalls.length,
            remainBalls,
            randomNumber,
            index,
            result,
        };
    }, [combinedHash]);

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    useEffect(() => {
        const mergeSeed = `${pfResult.serverSeed}${mergeClientSeed}`;
        const hash = createHash("sha512").update(mergeSeed).digest("hex");
        setCombinedHash(hash);
        return () => {
            dispatch({
                type: GameEventActionType.UPDATE_PF_VERIFY,
                payload: {
                    pfVerifyModalData: {
                        ...pfResult,
                        editedMergeClientSeed: mergeClientSeed,
                    },
                },
            });
        };
    }, [mergeClientSeed]);

    const hightlightStyle = Styles["text-highlight"];

    return (
        <div className={Styles["pf-setting-container"]}>
            <PFVerificationHeaderBlockBase
                handleChangeMergeClientSeed={handleChangeMergeClientSeed}
                mergeClientSeed={mergeClientSeed}
                severSeed={pfResult?.serverSeed}
                combinedHash={combinedHash}
                finalHash={pfResult?.finalHash}
            />

            <div className={Styles["client-seed-form"]}>
                <div className="flex items-center gap-4">
                    <Section title={translateCommon("pf_verification_para_1")} customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}>
                        <div className="flex gap-4 items-center">
                            <SmallBall number={verifyInfo.result} />
                        </div>
                    </Section>
                </div>
                <Section title={translateCommon("pf_header_combined_sha512_hash")} customTitleStyles="mt-2">
                    <p className="text-wrap">{combinedHash}</p>
                </Section>

                <Section title={translateSNGames("pf_verification_para_3")}>
                    <p className="font-weight-medium">
                        {verifyInfo.rawTwoFirstDigits} {"=>"} {verifyInfo.valueTwoFirstDigits}
                    </p>
                    <p>
                        <span className={hightlightStyle}>{translateSNGames("pf_verification_para_4")}</span>
                        <span>
                            {" "}
                            = (({translateSNGames("pf_algorithm_random_number")} + X) mod {translateSNGames("pf_verification_para_5")}) + 1
                        </span>
                    </p>
                    <p>
                        <span className={hightlightStyle}>
                            {translateSNGames("pf_index")} (1,..., {verifyInfo.numberRemainBalls})
                        </span>{" "}
                        = (({verifyInfo.randomNumber} + {verifyInfo.valueTwoFirstDigits}) mod {verifyInfo.numberRemainBalls}) + 1 ={" "}
                        <span className={hightlightStyle}>{verifyInfo.index}</span>
                    </p>
                </Section>

                <Section title={translateSNGames("pf_verification_para_8")}>
                    <p className={Styles["result-numbers"]}>
                        {verifyInfo.remainBalls.map((item, index) => {
                            return index + 1 === verifyInfo.index ? (
                                <span key={uuidv4()} className={Styles["text-yellow"]}>
                                    {item}{" "}
                                </span>
                            ) : (
                                `${item} `
                            );
                        })}
                    </p>
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
