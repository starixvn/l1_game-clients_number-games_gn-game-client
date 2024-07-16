import dynamic from "next/dynamic";

import { useEffect } from "react";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { AnalyticsHelper } from "../../../_shared/helpers/analytic-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { ILobbyConfigs } from "../dashboard/type";
import { Banner } from "./banners/banner";
import { LobbyLayout } from "./games/lobby-layout";
import { LobbyGameTransmitter } from "./lobby-socket-connection";
import Styles from "./lobby.module.scss";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"));
const ChangeAvatar = dynamic(() => import("../header/change-avatar"));
const ToolbarGuide = dynamic(() => import("../hide-toolbar-guide"));

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs, gameTransmitters }) => {
    AnalyticsHelper.trackLobby();

    useEffect(() => {
        StorageHelper.set(`${localStorageKeys.showPFSetting}`, "");
        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.OPEN_GAME_ID]: 0 });
    }, []);

    return (
        <div className={Styles["lobby-container"]}>
            <div>
                <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            </div>
            <div>
                <LobbyLayout lobbyConfigs={lobbyConfigs} openGame={openGame} gameTransmitters={gameTransmitters} />
                <ChangeAvatar />
            </div>
        </div>
    );
};

export default Lobby;
