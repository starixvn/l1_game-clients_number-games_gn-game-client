import dynamic from "next/dynamic";
import { BackgroundGalaxy } from "../background";
import { ILobbyConfigs } from "../dashboard/type";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";

const Settings = dynamic(() => import("../settings"));
const ChangeAvatar = dynamic(() => import("../header/change-avatar"));
const ToolbarGuide = dynamic(() => import("../hide-toolbar-guide"));
import { AnalyticsHelper } from "../../../_shared/helpers/analytic-helper";

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs }) => {
    AnalyticsHelper.trackPage({ page_title: "Lobby" });
    return (
        <div className={Styles["lobby-container"]}>
            <BackgroundGalaxy />
            <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            <LobbyLayout lobbyConfigs={lobbyConfigs} openGame={openGame} />
            <Settings />
            <ChangeAvatar />
            <ToolbarGuide />
        </div>
    );
};
