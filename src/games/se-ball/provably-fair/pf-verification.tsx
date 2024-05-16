import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import SmallBall from "../../../components/game-components/small-ball";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";
import { usePFContext, usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { Markup } from "interweave";
import { SeBallPfHelper, SeBallConstant } from "./pf-helper";

const PFVerification: FC = () => {
    const { pfVerifyModalData: pfResult } = usePFContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = usePFDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);

    const verifyInfo = useMemo(() => SeBallPfHelper.buildVerifyInfo({ pfResult, combinedHash }), [combinedHash]);

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    const ballIndexRender = () => {
        const { BALLS_EACH_ROUND, TOTAL_BALLS } = SeBallConstant;

        return Array.from(Array(BALLS_EACH_ROUND), (_, index) => {
            const { randomNumbers, convertNumber, ballIndexes } = verifyInfo;

            const line = `<span style="color: #ffbc11; font-weight: 600">Ball ${index + 1} - ${translateSNGames("pf_index")} (1-${TOTAL_BALLS - index
                })</span> = ((${randomNumbers[index]}+${convertNumber[index]}) mod ${TOTAL_BALLS - index
                }) + 1 = <span style="color: #ffbc11; font-weight: 600">${ballIndexes[index]}</span>`;

            return (<p key={index}><Markup content={line} /></p>);
        });
    };

    const renderFinalResult = () => {
        const { remainingBalls, ballIndexes } = verifyInfo;
        const finalResult = [];

        for (let i = 0; i < SeBallConstant.BALLS_EACH_ROUND; i++) {
            finalResult.push(
                <div style={{ marginBottom: "1rem" }}>
                    <div className={Styles["section-title"]}>
                        {translateSNGames("pf_verifier_tool_ball", { value: i + 1 })} - {translateCommon("pf_verification_para_1")}
                    </div>
                    <div className={Styles["result-numbers"]}>
                        {remainingBalls[i].map((item, index) => {
                            return index + 1 === ballIndexes[i] ? (
                                <span key={uuidv4()} className={Styles["text-yellow"]}>
                                    {item}{" "}
                                </span>
                            ) : (
                                `${item} `
                            );
                        })}
                    </div>
                </div>
            );
        }

        return finalResult;
    };

    useEffect(() => {
        const mergeSeed = `${pfResult.serverSeed}${mergeClientSeed}`;
        const hash = createHash("sha512").update(mergeSeed).digest("hex");
        setCombinedHash(hash);

        return () => {
            dispatch({
                type: PFEventActionType.UPDATE_PF_VERIFY,
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
                        <div className="flex gap-2 items-center">
                            {verifyInfo.results.map((item) => (
                                <SmallBall key={uuidv4()} number={item} />
                            ))}
                        </div>
                    </Section>
                </div>
                <Section title={translateCommon("pf_header_combined_sha512_hash")} customTitleStyles="mt-2">
                    <p className="text-wrap">{combinedHash}</p>
                </Section>

                <Section title={translateSNGames("pf_verification_para_3")}>
                    <p className="font-weight-medium">
                        {verifyInfo.convertNumber.map((item, index) => {
                            const rawDigit = verifyInfo.rawDigits[index];
                            return (
                                <span style={{ display: "block" }} key={uuidv4()}>
                                    {rawDigit} {"=>"} {item}
                                </span>
                            );
                        })}
                    </p>
                    <p className="break-word">
                        <span className={hightlightStyle}>{translateSNGames("pf_verification_para_4")}</span>
                        <span>
                            {" "}
                            = (({translateSNGames("pf_algorithm_random_number")} + X) mod {translateSNGames("pf_verification_para_5")}) + 1
                        </span>
                    </p>

                    {ballIndexRender()}
                </Section>

                <Section title={translateSNGames("pf_verification_para_8")}>
                    {renderFinalResult()}
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
