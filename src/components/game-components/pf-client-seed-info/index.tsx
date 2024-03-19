import { FC, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useClickSound, useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import { createPortal } from "react-dom";
import ModalContainer from "../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import { useGameContext, usePlayerContext } from "../../../_shared/react-contexts";
import Styles from "../pf-setting/pf-setting.module.scss";
import { ClientSeedInfo } from "../../game-base/type";

const PFClientSeedInfoModal: FC<{ handleCloseModal: Function; isShowPFClientSeedInfo: boolean; clientSeedInfo: ClientSeedInfo }> = ({
    handleCloseModal,
    isShowPFClientSeedInfo,
    clientSeedInfo,
}) => {
    const { gameName } = useGameContext();
    const { t: translateBacBall } = useTranslator([gameName]);

    return (
        isShowPFClientSeedInfo &&
        createPortal(
            <ModalContainer
                id="pf-client-seed-info-modal"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateBacBall("pf_title_client_seed_info")}
                    </div>
                }
                isOpen={isShowPFClientSeedInfo}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFClientSeedInfo clientSeedInfo={clientSeedInfo} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const CopyableTextInput: FC<{ value: string; id: string }> = ({ value, id }) => {
    const [isCopySuccess, setIsCopySuccess] = useState(false);
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();
    const handleCopy = () => {
        clickSound();
        navigator.clipboard.writeText(value);
        setIsCopySuccess(true);
        setTimeout(() => {
            setIsCopySuccess(false);
        }, 500);
    };

    return (
        <>
            <input className="form-control" type="text" name={id} id={id} readOnly value={value} />
            <button className={Styles["copy-btn"]} onClick={handleCopy}>
                <span className="icon-copy" />
            </button>
            {isCopySuccess && <div className={Styles["copy-success"]}>{translateCommon("pf_copy_successfully ")}</div>}
        </>
    );
};

const encryptName = (name: string) => {
    if (name.length <= 0) {
        return name;
    }

    return `${name.substring(0, 1)}***${name.substring(name.length - 3, name.length)}`;
};

const PFClientSeedInfo: FC<{ clientSeedInfo: ClientSeedInfo }> = ({ clientSeedInfo }) => {
    const clickSound = useClickSound();
    const { gameName } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateBacBall } = useTranslator([gameName]);
    const {
        authorizeInfo: {
            user: { name },
        },
    } = usePlayerContext();

    const handleClickExport = () => {
        clickSound();
        const header = `${translateBacBall("glossary_player")},${translateCommon("character_name")},${translateBacBall(
            "pf_client_seed_info_subtitle_seed"
        )}`;
        const content = clientSeedInfo.clientSeeds
            .map((item, index) => {
                return `${index + 1},${item.name == name ? item.name : encryptName(item.name)},${item.clientSeed}`;
            })
            .join("\n");
        const data = `${header}\n${content}`;
        const link = document.createElement("a");
        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(data)}`;
        link.download = "client-seed-info.csv";
        link.click();
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className={Styles["client-seed-form"]}>
                <div className="flex items-center justify-between">
                    <h3 className={`${Styles["section-title"]} m-0`}>{translateCommon("pf_new_client_seed_para_1")}</h3>
                    <div className="input-group width-small">
                        <CopyableTextInput value={clientSeedInfo.clientSeed} id="client-seed" />
                    </div>
                </div>
                <h3 className={`${Styles["section-title"]} mt-3`}>{translateCommon("pf_ header_merge_client_seed")}</h3>

                <div className="input-group width-full">
                    <CopyableTextInput value={clientSeedInfo.mergeClientSeed} id="merge-client-seed" />
                </div>
            </div>
            <div className="form">
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`${Styles["section-title"]} m-0`}>
                        {translateBacBall("pf_client_seed_info_total_players")}{" "}
                        <span className={Styles["text-highlight"]}>{clientSeedInfo.clientSeeds?.length}</span>
                    </h3>
                    <button className={Styles["btn-export"]} onClick={handleClickExport}>
                        <span className="icon-file-csv" style={{ cursor: "pointer" }}>
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                        </span>
                    </button>
                </div>
                <div className={`table-container react-infinite-table ${Styles["pf-info"]}`}>
                    <table className={`table text-center ${Styles["table"]}`}>
                        <thead>
                            <tr>
                                <th style={{ width: "25%" }}>{translateBacBall("glossary_player")}</th>
                                <th>{translateCommon("character_name")}</th>
                                <th>{translateBacBall("pf_client_seed_info_subtitle_seed")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientSeedInfo.clientSeeds?.map((clientSeed, index) => (
                                <tr key={uuidv4()}>
                                    <td>{index + 1}</td>
                                    {name === clientSeed.name ? (
                                        <>
                                            <td className={Styles["table-highlight"]}>{clientSeed.name}</td>
                                            <td className={name === clientSeed.name ? Styles["table-highlight"] : ""}>
                                                {clientSeed.clientSeed}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{encryptName(clientSeed.name)}</td>
                                            <td>{clientSeed.clientSeed}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PFClientSeedInfoModal;
