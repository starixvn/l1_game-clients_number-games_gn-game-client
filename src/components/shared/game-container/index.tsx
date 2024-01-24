import React from "react";

import styles from "./game-container.module.scss";

const GameContainer: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles["game-container"]}>{children}</div>;
};

export default GameContainer;
