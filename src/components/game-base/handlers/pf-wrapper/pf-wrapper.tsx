import { useEffect } from "react";
import { usePFContext, usePFDispatch } from "../../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFClientSeedSetting } from "../../type";
import { localStorageKeys, randomNumberSeries, StorageHelper } from "../../../../_shared/helpers";
import { PFEventActionType } from "../../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { GameMessageHandler, messageEventType } from "../game-message-handler";
import { Socket } from "socket.io-client";

export type PFWrapperProps = {
    socket: Socket;
    gameMessageHandler: GameMessageHandler;
    renderPFSettingModal: Function;
    renderBetHistoryModal: Function;
    renderHeaderBlock: Function;
    uid: any;
    gameId: number
};

export const PFWrapper = (props: PFWrapperProps) => {
    const pfDispatch = usePFDispatch();
    const pfContext = usePFContext();

    useEffect(() => {
        const sendSocketMessageWithClientSeed = (message) => {
            const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED];
            const { pfClientSeedSetting } = pfContext;
            const clientSeed = pfClientSeedSetting?.useManualClientSeed
                ? pfClientSeedSetting?.manualClientSeed
                : pfClientSeedSetting?.randomClientSeed;
            const clientSeedDetail = {
                randomClientSeed: pfClientSeedSetting?.randomClientSeed,
                manualClientSeed: pfClientSeedSetting?.manualClientSeed,
                useManualClientSeed: pfClientSeedSetting?.useManualClientSeed,
            };

            props.socket.emit(event, { ...data, clientSeed, clientSeedDetail });
        };


        const syncPFSetting = (pfClientSeedSetting) => {
            const { pfClientSeedSetting: oldPFClientSeedSetting } = pfContext;
            const dataPFSettingSave = {
                ...oldPFClientSeedSetting,
                ...pfClientSeedSetting,
            };
            StorageHelper.set(`${localStorageKeys.pfSetting}-${props.uid}-${props.gameId}`, dataPFSettingSave);
        }

        const handleSavePFSetting = (message) => {
            const { pfClientSeedSetting } = message[messageEventType.SAVE_PF_SETTING];
            syncPFSetting(pfClientSeedSetting);
            pfDispatch({ type: PFEventActionType.UPDATE_PF_CLIENT_SEED_SETTING, payload: { pfClientSeedSetting } });
        }


        const loadPFSetting = () => {
            const pfClientSeedSetting = StorageHelper.get<PFClientSeedSetting>(`${localStorageKeys.pfSetting}-${props.uid}-${props.gameId}`);
            if (pfClientSeedSetting) {
                pfDispatch({
                    type: PFEventActionType.UPDATE_PF_CLIENT_SEED_SETTING,
                    payload: {
                        pfClientSeedSetting: {
                            ...pfClientSeedSetting,
                            manualClientSeed:
                                pfClientSeedSetting?.manualClientSeed?.length <= 0 && pfClientSeedSetting?.useManualClientSeed
                                    ? pfClientSeedSetting?.randomClientSeed
                                    : pfClientSeedSetting?.manualClientSeed,
                        },
                    },
                });
            }
        }

        const handleSavePFSettingFromTurnIdHandler = (message) => {
            console.log(JSON.stringify(message))
            const { pfClientSeedSetting } = pfContext;
            const { drawId } = message[messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER];
            const oldDrawId = pfClientSeedSetting?.drawId;

            if (oldDrawId !== drawId) {
                handleSavePFSetting({
                    [messageEventType.SAVE_PF_SETTING]: {
                        pfClientSeedSetting: {
                            drawId: drawId,
                            randomClientSeed: randomNumberSeries(4),
                        },
                    },
                })
            }
        }

        loadPFSetting();

        props.gameMessageHandler.register(messageEventType.SAVE_PF_SETTING, handleSavePFSetting);
        props.gameMessageHandler.register(messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER, handleSavePFSettingFromTurnIdHandler);
        props.gameMessageHandler.register(messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED, sendSocketMessageWithClientSeed);
        props.gameMessageHandler.register(messageEventType.SYNC_OWN_BETS_TO_PF, (message) => {
            pfDispatch({ type: PFEventActionType.OWN_BETS, payload: { ownBets: message[messageEventType.SYNC_OWN_BETS_TO_PF] } });
        });

        return () => {
            // TO DO: unregister event
        }
    }, [])

    return (<>
        {props.renderHeaderBlock()}
        {props.renderPFSettingModal()}
        {props.renderBetHistoryModal()}
    </>)
}
