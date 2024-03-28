import { useEffect, useState } from "react";
import { SettingEventActionType, usePlayerContext, useSettingContext, useSettingDispatch } from "../../../_shared/react-contexts";
import { useClickSound } from "../../../_shared/react-hooks";
import { updateUserAvatar } from "../../../services/user-setting-service";
import { AvatarGallery } from "../dashboard/register/avatar-gallery";
import Styles from "./index.module.scss";

const ChangeAvatar: React.FC = () => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const { session } = usePlayerContext();
    const { authorizeInfo } = usePlayerContext();
    const { user } = authorizeInfo;
    const [avatarId, setAvatarId] = useState<number>();

    useEffect(() => {
        if (user.avatarId > 0) {
            handleChangeAvatar(user.avatarId);
            setAvatarId(user.avatarId);
        }
    }, [user]);

    const onClose = () => {
        clickSound();
        settingDispatch({
            type: SettingEventActionType.SHOW_AVATAR_GALLERY,
            payload: {
                isShowAvatarGallery: false,
            },
        });
    };

    const handleSelectAvatar = async (avatarId: number) => {
        setAvatarId(avatarId);
        await updateUserAvatar(session, avatarId);
        handleChangeAvatar(avatarId);
    };

    const handleChangeAvatar = (avatarId: number) => {
        settingDispatch({
            type: SettingEventActionType.CHANGE_AVATAR_ID,
            payload: {
                avatarId,
            },
        });
    };

    return (
        settingContext.isShowAvatarGallery && (
            <div className={Styles["gallery-bg"]}>
                <AvatarGallery
                    classCustomize={Styles["gallery-wrapper-customize"]}
                    selectedAvatarId={avatarId}
                    onSelectAvatar={handleSelectAvatar}
                    onClose={onClose}
                />
            </div>
        )
    );
};

export default ChangeAvatar;
