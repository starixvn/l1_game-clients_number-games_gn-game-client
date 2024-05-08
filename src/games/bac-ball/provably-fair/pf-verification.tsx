import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useGameContext } from "../../../_shared/react-contexts";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFContext, usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";
import SmallBall from "../../../components/game-components/small-ball";

const PFVerification: FC = () => {
    const { tolgeeNamespace } = useGameContext();
    const { pfVerifyModalData: pfResult } = usePFContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = usePFDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const [combinedHash, setCombinedHash] = useState(pfResult?.finalHash || "");

    const verifyInfo = useMemo(() => {
        const rawTwoFirstDigits = combinedHash.substring(0, 2);
        const valueTwoFirstDigits = parseInt(rawTwoFirstDigits, 16);
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers = (serverSeed?.random || "-1;-1").split(";");
        const remainBalls = (serverSeed?.remain || "2;2").split(";");
        const player = parseInt(randomNumbers[0]);
        const banker = parseInt(randomNumbers[1]);
        const playerBalls = remainBalls[0].split(":");
        const bankerBalls = remainBalls[1].split(":");
        const playerResult = ((player + valueTwoFirstDigits) % playerBalls.length) + 1;
        const bankerResult = ((banker + valueTwoFirstDigits) % bankerBalls.length) + 1;
        return {
            rawTwoFirstDigits,
            valueTwoFirstDigits,
            numberRemainBalls: playerBalls.length,
            player: {
                random: player,
                result: playerResult,
                balls: playerBalls,
                value: playerBalls[playerResult - 1],
            },
            banker: {
                random: banker,
                result: bankerResult,
                balls: bankerBalls,
                value: bankerBalls[bankerResult - 1],
            },
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
                <div className="flex justify-between items-center">
                    <Section title={translateInGame("pf_bacball_final result")} customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1">
                                <span className="text-uppercase font-weight-medium text-white">{translateInGame("glossary_player")}</span>
                                <SmallBall number={verifyInfo.player.value} />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-uppercase font-weight-medium text-white">{translateInGame("glossary_banker")}</span>
                                <SmallBall number={verifyInfo.banker.value} />
                            </div>
                        </div>
                    </Section>
                </div>
                <Section title={translateCommon("pf_header_combined_sha512_hash")} customTitleStyles="mt-2">
                    <p className="text-wrap">{combinedHash}</p>
                </Section>

                <Section title={translateInGame("pf_verification_para_3")}>
                    <p className="font-weight-medium">
                        {verifyInfo.rawTwoFirstDigits} {"=>"} {verifyInfo.valueTwoFirstDigits}
                    </p>
                    <p>
                        <span className={hightlightStyle}>{translateInGame("pf_verification_para_4")}</span>
                        <span>
                            {" "}
                            = (({translateInGame("pf_algorithm_random_number")} + X) mod {translateInGame("pf_verification_para_5")}) + 1
                        </span>
                    </p>
                    <p>
                        <span className={hightlightStyle}>
                            {translateInGame("pf_verification_para_6")} (1,..., {verifyInfo.numberRemainBalls})
                        </span>{" "}
                        = (({verifyInfo.player.random} + {verifyInfo.valueTwoFirstDigits}) mod {verifyInfo.numberRemainBalls}) + 1 ={" "}
                        <span className={hightlightStyle}>{verifyInfo.player.result}</span>
                    </p>
                    <p>
                        <span className={hightlightStyle}>
                            {translateInGame("pf_verification_para_7")} (1,..., {verifyInfo.numberRemainBalls})
                        </span>{" "}
                        = (({verifyInfo.banker.random} + {verifyInfo.valueTwoFirstDigits}) mod {verifyInfo.numberRemainBalls}) + 1 ={" "}
                        <span className={hightlightStyle}>{verifyInfo.banker.result}</span>
                    </p>
                </Section>

                <Section title={translateInGame("pf_verification_para_8")}>
                    <Section title={translateInGame("pf_verification_para_9")}>
                        <p className={Styles["result-numbers"]}>
                            {verifyInfo.player.balls.map((item, index) => {
                                return index + 1 === verifyInfo.player.result ? (
                                    <span key={uuidv4()} className={Styles["text-yellow"]}>
                                        {item}{" "}
                                    </span>
                                ) : (
                                    `${item} `
                                );
                            })}
                        </p>
                    </Section>

                    <Section title={translateInGame("pf_verification_para_10")}>
                        <p className={Styles["result-numbers"]}>
                            {verifyInfo.banker.balls.map((item, index) => {
                                return index + 1 === verifyInfo.banker.result ? (
                                    <span key={uuidv4()} className={Styles["text-yellow"]}>
                                        {item}{" "}
                                    </span>
                                ) : (
                                    `${item} `
                                );
                            })}
                        </p>
                    </Section>
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
