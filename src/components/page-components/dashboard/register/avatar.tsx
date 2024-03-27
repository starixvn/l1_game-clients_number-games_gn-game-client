import { ReactNode } from "react";

import styles from "./avatar.module.scss";

export type AvatarProps = {
    id: number;
    onClick: () => void;
    selected?: number;
};

export function Avatar({ id, onClick, selected }: AvatarProps): ReactNode {
    const className = `${styles.avatar} ${selected === id ? styles["avatar-selected"] : ""}`;

    return (
        <div className={className} onClick={onClick}>
            <img src={`/static/images/avatar/${id}.jpg`} className="img-fluid circle" alt="Avatar" />
        </div>
    );
}
