import { ReactNode, useState } from "react";

import { useTranslator } from "../../../../_shared/react-hooks";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import { Avatar } from "./avatar";
import Styles from "./avatar-gallery.module.scss";

export const MAX_AVATAR_ID = 40;

export type AvatarGalleryProps = {
    selectedAvatarId: number;
    onSelectAvatar: (imgId: number) => Promise<void>;
    onClose: () => void;
    classCustomize?: any;
};

export type AvatarsProps = {
    selected: number;
    onSelect: (id: number) => void;
};

export function Avatars({ onSelect, selected }: AvatarsProps): ReactNode {
    const avatars = [];

    for (let index = 1; index <= MAX_AVATAR_ID; index++) {
        avatars.push(<Avatar key={index} id={index} selected={selected} onClick={() => onSelect(index)} />);
    }

    return avatars;
}

export function AvatarGallery({ selectedAvatarId, onSelectAvatar, onClose, classCustomize }: AvatarGalleryProps): ReactNode {
    const { t } = useTranslator();
    const [selectedId, setSelectedId] = useState<number>(selectedAvatarId);

    const onSubmit = async () => {
        await onSelectAvatar(selectedId);
        onClose();
    };

    return (
        <div className={`${Styles["gallery-wrapper"]} ${classCustomize}`}>
            <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
                <h1 className={Styles["gallery-title"]}>{t("SabaNumber.change_avatar")}</h1>
                <div className={`icon-close ${Styles["icon-close"]}`} onClick={onClose} data-testid="btn-close-gallery"></div>
                <div className={Styles["container-avatars"]}>
                    <Avatars selected={selectedId} onSelect={setSelectedId} />
                </div>
                <div className={Styles["list-actions"]}>
                    <button className="btn-grey" onClick={onClose} type="button">
                        {t("button_cancel")}
                    </button>
                    <button className="btn-green" onClick={onSubmit} type="button" data-testid="btn-submit-gallery">
                        {t("Common.ok")}
                    </button>
                </div>
            </BaseDialog>
        </div>
    );
}
