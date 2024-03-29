import { FC, useEffect, useMemo, useState } from "react";
import { useGameContext } from "../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { useBallColor } from "../../../_shared/helpers";
import { createHash } from "crypto";
import CopyableTextInput from "../../../components/game-components/provably-fair/copyable-text-input";
import { DefaultPFStyles as Styles } from "../../../components/game-components/provably-fair";
import { v4 as uuidv4 } from "uuid";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

const PFVerification: FC = () => {
    const { tolgeeNamespace } = useGameContext();
    const { pfVerifyModalData: pfResult } = useGameStateContext();
    const [mergeClientSeed, setMergeClientSeed] = useState(pfResult?.editedMergeClientSeed || pfResult?.mergeClientSeed || "");
    const dispatch = useGameStatesDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const [combinedHash, setCombinedHash] = useState(pfResult.finalHash);
    const clickSound = useClickSound();
    const ballColor = useBallColor;

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

    const handleClickEdit = () => {
        clickSound();
        const input = document.getElementById("merge-client-seed-verification") as HTMLInputElement;
        const inputGroupEditable = document.getElementById("merge-client-seed-group-editable") as HTMLInputElement;
        inputGroupEditable.className = `input-group ${Styles["input-group-editable"]} width-full mb-3`;
        input.readOnly = false;
        input.className = `form-control ${Styles["form-control-editable"]}`;
        input.focus();
        input.select();
    };

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
            <div id="merge-client-seed-group-editable" className="input-group width-full mb-3">
                <input
                    className="form-control"
                    type="text"
                    name="merge-client-seed-verification"
                    id="merge-client-seed-verification"
                    value={mergeClientSeed}
                    readOnly
                    onChange={handleChangeMergeClientSeed}
                />
                <button className={Styles["copy-btn"]} onClick={handleClickEdit}>
                    <span className="icon-edit" />
                </button>
            </div>

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
                <div className="flex justify-between items-center">
                    <h3 className={`${Styles["section-title"]} m-0 ${Styles["title-fix-width"]}`}>
                        {translateCommon("pf_verification_para_1")}
                    </h3>
                    <div className="flex gap-4 items-center">
                        <div className={`${Styles["ball"]} ${Styles[ballColor({ number: verifyInfo.result })]}`}>{verifyInfo.result}</div>
                    </div>
                </div>
                <h3 className={`${Styles["section-title"]} mt-2`}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                <p className="text-wrap">{combinedHash}</p>

                <h3 className={`${Styles["section-title"]}`}>{translateInGame("pf_verification_para_3")}</h3>
                <p className="font-weight-medium">
                    {verifyInfo.rawTwoFirstDigits} {"=>"} {verifyInfo.valueTwoFirstDigits}
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>{translateInGame("pf_verification_para_4")}</span>
                    <span>
                        {" "}
                        = (({translateInGame("pf_algorithm_random_number")} + X) mod {translateInGame("pf_verification_para_5")}) + 1
                    </span>
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>
                        {translateInGame("pf_verification_para_6")} (1,..., {verifyInfo.numberRemainBalls})
                    </span>{" "}
                    = (({verifyInfo.randomNumber} + {verifyInfo.valueTwoFirstDigits}) mod {verifyInfo.numberRemainBalls}) + 1 ={" "}
                    <span className={Styles["text-highlight"]}>{verifyInfo.index}</span>
                </p>

                <h3 className={`${Styles["section-title"]}`}>{translateInGame("pf_verification_para_8")}</h3>
                <h3 className={`${Styles["section-title"]}`}>{translateInGame("pf_verification_para_9")}</h3>
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
