import dynamic from "next/dynamic";
import { isMobileOnly, isSafari } from "react-device-detect";

import { AnalyticsHelper } from "../../../_shared/helpers/analytic-helper";
import { ILobbyConfigs } from "../dashboard/type";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { useEffect } from "react";
import { localStorageKeys, StorageHelper } from "../../../_shared/helpers";

const Settings = dynamic(() => import("../settings"));
const ChangeAvatar = dynamic(() => import("../header/change-avatar"));
const ToolbarGuide = dynamic(() => import("../hide-toolbar-guide"));

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs }) => {
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
                <LobbyLayout lobbyConfigs={lobbyConfigs} openGame={openGame} />
                <Settings />
                <ChangeAvatar />
            </div>

            {isMobileOnly && isSafari && <ToolbarGuide />}
        </div>
    );
};

export default Lobby;
