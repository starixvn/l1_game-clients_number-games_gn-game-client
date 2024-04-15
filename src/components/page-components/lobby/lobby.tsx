import dynamic from "next/dynamic";
import Image from "next/image";
import { isMobileOnly, isSafari } from "react-device-detect";

import { AnalyticsHelper } from "../../../_shared/helpers/analytic-helper";
import { ILobbyConfigs } from "../dashboard/type";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";

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
            <Image
                className={Styles["background"]}
                src={`/static/images/bg-galaxy-small.webp`}
                width={375}
                height={756}
                alt={`galaxy background`}
                priority={true}
            />

            <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            <LobbyLayout lobbyConfigs={lobbyConfigs} openGame={openGame} />
            <Settings />
            <ChangeAvatar />
            {isMobileOnly && isSafari && <ToolbarGuide />}
        </div>
    );
};

export default Lobby;
