import React from "react";

import { useGameContext } from "../../../_shared/contexts/game-context/game-context";
import Styles from "./loader.module.scss";

export default function Loader() {
    const { gameSetting } = useGameContext();
    const gameName = gameSetting?.gameName?.toLocaleLowerCase();
    return <div className={`${Styles["loader"]} ${Styles[gameName]}`} data-testid="loader"></div>;
}
