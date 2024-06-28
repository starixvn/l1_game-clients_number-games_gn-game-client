import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslator } from "../../../_shared/react-hooks";
import { PFVerificationHeaderBlockBase, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import SmallBall from "../../../components/game-components/small-ball";
import { Section } from "../../../components/game-components/provably-fair/pf-form-components";
import { usePFContext, usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { Markup } from "interweave";
import { ResourceTypes } from "../../../_shared/resources";
import PfSicBallHelper from "./pf-sic-ball-helper";

const PFVerification: FC = () => {
    const { pfVerifyModalData: pfResult } = usePFContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = usePFDispatch();
    const { t } = useTranslator();
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);

    const BALLS_EACH_ROUND = 3;
    const TOTAL_BALLS = 6;

    const verifyInfo = useMemo(
        () =>
            PfSicBallHelper.buildVerifyInfo({
                pfResult,
                combinedHash,
                totalBalls: TOTAL_BALLS,
                ballsEachRound: BALLS_EACH_ROUND,
            }),
        [combinedHash]
    );

    const handleChangeMergeClientSeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        setMergeClientSeed(input.value);
    };

    const ballIndexRender = () => {
        return Array.from(Array(BALLS_EACH_ROUND), (_, index) => {
            const { randomNumbers, convertNumber, ballIndexes } = verifyInfo;
            const ballIndexText = t(`${ResourceTypes.SABA_NUMBER}.pf_verifier_tool_ball`, {
                value: index + 1,
            });

            const line = `<span style="color: #ffbc11; font-weight: 600">${ballIndexText} - ${t(
                `${ResourceTypes.COMMON}.pf_verification_para_1`
            )} </span> = ((${randomNumbers[index]}+${
                convertNumber[index]
            }) mod ${TOTAL_BALLS}) + 1 = <span style="color: #ffbc11; font-weight: 600">${ballIndexes[index]}</span>`;

            return (
                <p key={index}>
                    <Markup content={line} />
                </p>
            );
        });
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
                    <Section
                        title={t(`${ResourceTypes.COMMON}.pf_verification_para_1`)}
                        customTitleStyles={`m-0 ${Styles["title-fix-width"]}`}
                    >
                        <div className="flex gap-2 items-center">
                            {verifyInfo.ballIndexes.map((item) => (
                                <SmallBall key={uuidv4()} number={item} />
                            ))}
                        </div>
                    </Section>
                </div>
                <Section title={t(`${ResourceTypes.COMMON}.pf_header_combined_sha512_hash`)} customTitleStyles="mt-2">
                    <p className="text-wrap">{combinedHash}</p>
                </Section>

                <Section title={t(`${ResourceTypes.SABA_NUMBER}.pf_verifier_tool_para_27`)}>
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
                        <span className={hightlightStyle}>{t(`${ResourceTypes.SABA_NUMBER}.pf_ball_value`)}</span>
                        <span>
                            {" "}
                            = (({t(`${ResourceTypes.SABA_NUMBER}.pf_algorithm_random_number`)} + X) mod {TOTAL_BALLS}) + 1
                        </span>
                    </p>

                    {ballIndexRender()}
                </Section>
            </div>
        </div>
    );
};

export default PFVerification;
