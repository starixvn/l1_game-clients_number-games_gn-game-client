import Image from "next/image";
import { ReactNode } from "react";

import { buildVersion } from "../../../../_shared/constants";
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
            <Image
                src={`/static/images/avatar/${id}.jpg?v=${buildVersion}`}
                height={162}
                width={162}
                className="img-fluid circle"
                alt="Avatar"
                quality={100}
            />
        </div>
    );
}
