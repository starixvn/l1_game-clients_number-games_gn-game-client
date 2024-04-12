import dynamic from "next/dynamic";
import { AnalyticsHelper } from "../../../_shared/helpers/analytic-helper";
import { ILobbyConfigs } from "../dashboard/type";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";
import { isMobileOnly, isSafari } from "react-device-detect";

const Settings = dynamic(() => import("../settings"));
const ChangeAvatar = dynamic(() => import("../header/change-avatar"));
const ToolbarGuide = dynamic(() => import("../hide-toolbar-guide"));

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs }) => {
    AnalyticsHelper.trackLobby();
    return (
        <div className={Styles["lobby-container"]}>
            <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            <LobbyLayout lobbyConfigs={lobbyConfigs} openGame={openGame} />
            <Settings />
            <ChangeAvatar />
            {isMobileOnly && isSafari && <ToolbarGuide />}
        </div>
    );
};

export default Lobby;
