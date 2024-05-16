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

const PFVerification: FC = () => {
    const { pfVerifyModalData: pfResult } = usePFContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = usePFDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);

    const BALLS_EACH_ROUND = 4;
    const TOTAL_BALLS = 60;

    const finalHashToNumbers = (finalHash: string) => {
        const increments = [];

        for (let i = 0; i < BALLS_EACH_ROUND; i++) {
            const value = parseInt(finalHash.slice(i * 2, i * 2 + 2), 16);
            increments.push(value);
        }

        return increments;
    };

    const generateRemainingBalls = (totalBalls: number) => {
        const result = [];
        for (let i = 1; i <= totalBalls; i++) {
            result.push(i);
        }
        return result;
    };

    const verifyInfo = useMemo(() => {
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");

        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];

        const rawDigits = combinedHash.match(/.{2}/g);

        const convertNumber = finalHashToNumbers(combinedHash);

        const ballIndexes = randomNumbers.map((x, index) => ((x + convertNumber[index]) % (TOTAL_BALLS - index)) + 1);

        let remainingBalls = generateRemainingBalls(TOTAL_BALLS);

        const resultBalls: number[] = [];
        let remainingBallList = [];
        remainingBallList.push(remainingBalls);

        let removedRemainingBallList = [...remainingBalls];

        ballIndexes.forEach((i) => {
            resultBalls.push(remainingBalls[i - 1]);
            removedRemainingBallList = removedRemainingBallList.filter(item => item !== remainingBalls[i - 1]);
            remainingBalls = removedRemainingBallList.filter(item => item !== remainingBalls[i - 1]);
            remainingBallList.push(removedRemainingBallList);
        });

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            ballIndexes,
            resultBalls,
            remainingBallList,
        };
    }, [combinedHash]);

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    const ballIndexRender = (randomNumber: number[], convertNumber: number[], ballIndexes: number[]) => {
        const ballLines = [];
        for (let i = 0; i < BALLS_EACH_ROUND; i++) {
            const line = `<span style="color: #ffbc11; font-weight: 600">Ball ${i + 1} - ${translateSNGames("pf_index")} (1-${TOTAL_BALLS - i
                })</span> = ((${randomNumber[i]}+${convertNumber[i]}) mod ${TOTAL_BALLS - i
                }) + 1 = <span style="color: #ffbc11; font-weight: 600">${ballIndexes[i]}</span>`;
            ballLines.push(
                <p>
                    <Markup key={i} content={line} />
                </p>
            );
        }

        return ballLines;
    };

    const renderFinalResult = (remainingBallList, ballIndexes) => {
        const finalResult = [];

        for (let i = 0; i < BALLS_EACH_ROUND; i++) {
            finalResult.push(
                <div style={{ marginBottom: "1rem" }}>
                    <div className={Styles["section-title"]}>
                        {translateSNGames("pf_verifier_tool_ball", { value: i + 1 })} - {translateCommon("pf_verification_para_1")}
                    </div>
                    <div className={Styles["result-numbers"]}>
                        {remainingBallList[i].map((item, index) => {
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
                            {verifyInfo.resultBalls.map((item) => (
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

                    {ballIndexRender(verifyInfo.randomNumbers, verifyInfo.convertNumber, verifyInfo.ballIndexes)}
                </Section>

                <Section title={translateSNGames("pf_verification_para_8")}>
                    {renderFinalResult(verifyInfo.remainingBallList, verifyInfo.ballIndexes)}
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
