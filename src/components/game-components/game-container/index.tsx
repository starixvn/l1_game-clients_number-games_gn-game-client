import React from "react";

import styles from "./game-container.module.scss";
import { PropsWithChildren } from "react";



const GameContainer: React.FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    return <div className={styles["game-container"]}>{children}</div>;
};

export default GameContainer;
