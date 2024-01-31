import React from "react";

import Styles from "./profile-picture.module.scss";

const ProfilePicture: React.FC<{ avatarId: number; isEditable?: boolean; onClick?: () => void }> = ({
    avatarId,
    isEditable = false,
    onClick,
}) => {
    const handleClick = () => {
        onClick && onClick();
    };

    return (
        <div className={Styles["profile-picture"]} onClick={handleClick} data-testid="profile-picture">
            {avatarId > 0 && avatarId < 88 ? (
                <img
                    src={`/static/images/avatar/${avatarId}.png`}
                    className={`img-fluid ${Styles["avatar"]}`}
                    height="94"
                    width="94"
                    alt="Avatar"
                />
            ) : (
                <span data-testid="default-avatar" className={`icon-user ${Styles["icon-user"]}`}></span>
            )}
            {isEditable && <EditIcon />}
        </div>
    );
};

const EditIcon = () => {
    return (
        <div className={Styles["chose-avatar"]} data-testid="edit-icon">
            <span className={`icon-edit ${Styles["icon-edit"]}`}></span>
        </div>
    );
};

export default ProfilePicture;
