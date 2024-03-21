import { ReactNode } from "react";

import styles from "./avatar.module.scss";

export type AvatarProps = {
    id: number;
    onClick: () => void;
    selected?: number;
};

export function Avatar({ id, onClick, selected }: AvatarProps): ReactNode {
    const className = `${styles.avatar} ${selected === id ? styles["avatar-selected"] : ""}`;

    return <img onClick={onClick} src={`/static/images/avatar/${id}.jpg`} className={className} alt="Avatar" />;
}
