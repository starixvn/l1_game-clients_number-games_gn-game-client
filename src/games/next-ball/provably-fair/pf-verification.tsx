import { createHash } from "crypto";
import { FC, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { CopyableTextInput, EditableTextInput, DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import SmallBall from "../../../components/game-components/small-ball";

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

    return (
        <div className={Styles["pf-setting-container"]}>
            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_ header_merge_client_seed")}</h3>
            <EditableTextInput handleOnChangeValue={handleChangeMergeClientSeed} value={mergeClientSeed} />

            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_header_server_seed")}</h3>
            <div className="input-group width-full mb-3">
                <CopyableTextInput value={pfResult?.serverSeed} id="server-seed" />
            </div>

            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
            <p className="text-wrap">{pfResult?.finalHash}</p>
            {combinedHash == pfResult?.finalHash ? (
                <p className={Styles["text-successful"]}>{translateSNGames("pf_verification_msg_verify_successful")}</p>
            ) : (
                <p className={Styles["text-unsuccessful"]}>{translateSNGames("pf_verification_msg_verify_unsuccessful")}</p>
            )}

            <div className={Styles["client-seed-form"]}>
                <div className="flex items-center gap-4">
                    <h3 className={`${Styles["section-title"]} m-0 ${Styles["title-fix-width"]}`}>
                        {translateCommon("pf_verification_para_1")}
                    </h3>
                    <div className="flex gap-4 items-center">
                        <SmallBall number={verifyInfo.result} />
                    </div>
                </div>
                <h3 className={`${Styles["section-title"]} mt-2`}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                <p className="text-wrap">{combinedHash}</p>

                <h3 className={`${Styles["section-title"]}`}>{translateSNGames("pf_verification_para_3")}</h3>
                <p className="font-weight-medium">
                    {verifyInfo.rawTwoFirstDigits} {"=>"} {verifyInfo.valueTwoFirstDigits}
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>{translateSNGames("pf_verification_para_4")}</span>
                    <span>
                        {" "}
                        = (({translateSNGames("pf_algorithm_random_number")} + X) mod {translateSNGames("pf_verification_para_5")}) + 1
                    </span>
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>
                        {translateSNGames("pf_index")} (1,..., {verifyInfo.numberRemainBalls})
                    </span>{" "}
                    = (({verifyInfo.randomNumber} + {verifyInfo.valueTwoFirstDigits}) mod {verifyInfo.numberRemainBalls}) + 1 ={" "}
                    <span className={Styles["text-highlight"]}>{verifyInfo.index}</span>
                </p>

                <h3 className={`${Styles["section-title"]}`}>{translateSNGames("pf_verification_para_8")}</h3>
                <p className={Styles["result-numbers"]}>
                    {verifyInfo.remainBalls.map((item, index) => {
                        return index + 1 == verifyInfo.index ? (
                            <span key={uuidv4()} className={Styles["text-yellow"]}>
                                {item}{" "}
                            </span>
                        ) : (
                            `${item} `
                        );
                    })}
                </p>
            </div>
        </div>
    );
};

export default PFVerification;
