import { FC, useEffect } from "react";
import ModalContainer from "../modal-container";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { useGameContext } from "../../../_shared/react-contexts";
import { createPortal } from "react-dom";

const PFVerifyModal: FC<{ handleCloseModal: Function; isShowPFVerify: boolean; drawId: number }> = ({
    handleCloseModal,
    isShowPFVerify,
    drawId,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isShowPFVerify &&
        createPortal(
            <ModalContainer
                title={translateCommon("pf_title_provably_fair_settings")}
                isOpen={isShowPFVerify}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify drawId={drawId} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerify: FC<{ drawId: number }> = () => {
    const { gameName } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateBacBall } = useTranslator([gameName]);
    const { gameMessageHandler } = useGameContext();

    return (
        <div>
            <div>{translateSNGames("glossary_draw_id")}: #1234 (3rd Draw)</div>
            <div>
                <div>
                    <span>{translateBacBall("glossary_player")}</span>
                    <div>
                        <div>16</div>
                        <div>73</div>
                        <div>37</div>
                    </div>
                    <span>{translateBacBall("glossary_banker")}</span>
                    <div>
                        <div>16</div>
                        <div>73</div>
                        <div>37</div>
                    </div>
                </div>
                <div>
                    <div>
                        <div>
                            <h3>{translateCommon("pf_header_server_seed_sha256")}</h3>
                            <div>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                        <div>
                            <h3>{translateCommon("pf_header_server_seed")}</h3>
                            <div>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
                            <h3>{translateCommon("pf_header_client_seed")}</h3>
                            <button>Intro</button>
                        </div>
                        <div>
                            <div>
                                <h3>{translateCommon("pf_ header_merge_client_seed")}</h3>
                                <a href="#">Details</a>
                            </div>
                            <div>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
                            <div>
                                <h3>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                                <button>Intro</button>
                            </div>

                            <div>
                                <input type="text" name="" id="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button>{translateCommon("pf_verify")}</button>
                    <p>{translateCommon("pf_provably_fair_para_2")}</p>
                </div>
            </div>
        </div>
    );
};

export default PFVerifyModal;
