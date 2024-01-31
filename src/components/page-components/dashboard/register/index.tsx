import { Trans, useTranslation } from "next-i18next";
import React, { useState } from "react";
import { AuthorizeResponse, Response, SSOResponse } from "sc-user-service-client/dist/auth";

import { sabaClubName, sabaMobileName, Themes } from "../../../../_shared/constants";
import { GetLocalizedErrorMessage } from "../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../_shared/helpers/number-helper";
import { createNickname } from "../../../../services/auth-service";
import { updateThemeSetting } from "../../../../services/user-setting-service";
import ProfilePicture from "../../../page-components/profile-picture";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import FirstLoginContainer from "../../../page-components/dashboard/container";
import TextBlock from "../../../page-components/dashboard/text-block";
import NameGenerator from "./name-generator";
import { getAppSettings } from "../../../../_shared/app-settings";
import Styles from "./register.module.scss";

type Props = {
    session: SSOResponse;
    handleStateLogin: (authorizeInfo: AuthorizeResponse) => void;
};

const maxAvatarId = 88;
export default function Register({ session, handleStateLogin }: Props) {
    const { t } = useTranslation(["register", "common", "messages"]);

    const nameAuto = NameGenerator.generateName;
    const [name, updateNameState] = useState<string>(nameAuto);
    const [selectedAvatarId, setSelectedAvatarId] = useState<number>(randomInteger(1, maxAvatarId));
    const [isValidUserName, setIsValidUserName] = useState<boolean>(true);
    const [isOpenGalleryAvatar, setIsOpenGalleryAvatar] = useState<boolean>(false);
    const [nameInValid, setNameInValid] = useState<string>("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateUsername(name)) {
            setIsValidUserName(false);
            setNameInValid(t("register:invalidUsername"));
            return;
        }
        const response = await createNickname(session, name, selectedAvatarId);
        const authorizeResponse = response as any;
        if (authorizeResponse && authorizeResponse.authorized) {
            updateThemeSetting(session);
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            handleStateLogin(authorizeResponse);
        } else {
            setNameInValid(t(GetLocalizedErrorMessage((response as any).errorCode)));
            setIsValidUserName(false);
        }
    };

    const generateName = (event) => {
        event.preventDefault();
        setIsValidUserName(true);
        updateNameState(NameGenerator.generateName);
    };

    const validateUsername = (username: string) => {
        const regex = new RegExp("^[a-zA-Z0-9]+$");
        return username.length > 14 || username.length < 3 || username.match(regex) === null;
    };

    const onChangeUserName = (event) => {
        event.preventDefault();
        updateNameState(event.target.value);
    };

    const clearUserName = () => {
        updateNameState("");
        setIsValidUserName(true);
    };

    const openAvatarGallery = () => {
        setIsOpenGalleryAvatar(true);
    };

    const closeAvatarGallery = () => {
        setIsOpenGalleryAvatar(false);
    };
    const highlightSystemClass = Styles[`highlight-system-${getAppSettings().appType}`];

    return (
        <FirstLoginContainer>
            <div className={`${Styles["wrapper-welcome"]} ${highlightSystemClass}`}>
                <TextBlock>
                    <Trans t={t}>
                        {t(
                            `register:registerTitle1-l1-apptype${getAppSettings().appType}`,
                            { sabaMobileName: sabaMobileName }
                        )}
                    </Trans>
                </TextBlock>
                <TextBlock>
                    <Trans t={t}>
                        {t(
                            `register:registerTitle2-l1-apptype${getAppSettings().appType}`,
                            { sabaMobileName: sabaMobileName, sabaClubName: sabaClubName }
                        )}
                    </Trans>
                </TextBlock>
                <TextBlock>
                    <Trans t={t}>
                        {t(
                            `register:registerTitle3-l1-apptype${getAppSettings().appType}`,
                            { sabaClubName: sabaClubName }
                        )}
                    </Trans>
                </TextBlock>
            </div>
            <ProfilePicture avatarId={selectedAvatarId} isEditable={true} onClick={openAvatarGallery} data-testid="open-avatar-gallery" />

            <form className={Styles["login-form"]} onSubmit={(event) => handleSubmit(event)} data-testid="btn-form-submit">
                <label className={Styles["input-title"]}>{t("register:registerName")}</label>

                <div className={Styles["user-box"]}>
                    <div className={`form-group ${Styles["register-wrapper-input"]}`}>
                        <input
                            type="text"
                            className={`form-control ${Styles["custom-form-control"]}`}
                            value={name}
                            onChange={(event) => onChangeUserName(event)}
                            data-testid="input-username"
                        />
                        <span
                            className={`icon-close ${Styles["icon-cancel"]}`}
                            onClick={() => clearUserName()}
                            data-testid="btn-clear-username"
                        ></span>
                    </div>

                    {!isValidUserName && (
                        <div className={Styles["hint-wrapper"]}>
                            <BaseDialog type={ModalType.Center} isOpen={isOpenGalleryAvatar}>
                                <div
                                    className={`icon-close ${Styles["icon-close-hint"]}`}
                                    onClick={() => {
                                        setIsValidUserName(true);
                                    }}
                                ></div>
                                <div className={Styles["hint-content"]}>
                                    <ul className={Styles["note"]}>
                                        <li>{t("register:rule1")}</li>
                                        <li>{t("register:rule2")}</li>
                                        <li>{t("register:rule3")}</li>
                                    </ul>
                                </div>
                            </BaseDialog>
                        </div>
                    )}

                    <div>
                        <button
                            className={`${Styles["btn-green"]} ${Styles["btn-refresh"]}`}
                            onClick={(event) => generateName(event)}
                            type="button"
                            data-testid="btn-generate-username"
                        >
                            <span className="icon-refresh"></span>
                        </button>
                    </div>
                </div>
                {!isValidUserName && <label className={Styles["message-error"]}>{nameInValid}</label>}

                <button className={`${Styles["btn-red"]} ${Styles["btn-submit"]}`} type="submit">
                    {t("common:enterGameBtn")}
                </button>
            </form>

            {isOpenGalleryAvatar && (
                <AvatarGallery selectedAvatarId={selectedAvatarId} onSelectAvatar={setSelectedAvatarId} onClose={closeAvatarGallery} />
            )}
        </FirstLoginContainer>
    );
}

const AvatarGallery: React.FC<{ selectedAvatarId: number; onSelectAvatar: (imgId: number) => void; onClose: () => void }> = ({
    selectedAvatarId,
    onSelectAvatar,
    onClose,
}) => {
    const { t } = useTranslation(["register", "common"]);
    const [selectedId, setSelectedId] = useState<number>(selectedAvatarId);

    const loadAvatars = () => {
        const _avatars = [];
        for (let index = 1; index < maxAvatarId; index++) {
            _avatars.push(<Avatar key={index} id={index} isSelected={index === selectedId} onClick={() => setSelectedId(index)} />);
        }
        return _avatars;
    };

    const submit = () => {
        onSelectAvatar(selectedId);
        onClose();
    };

    return (
        <div className={Styles["gallery-wrapper"]}>
            <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
                <h3 className={Styles["gallery-title"]}>{t("register:changeAvatar")}</h3>
                <div className={`icon-close ${Styles["icon-close"]}`} onClick={onClose} data-testid="btn-close-gallery"></div>
                <div className={Styles["container-avatars"]}>{loadAvatars()}</div>
                <div className={Styles["list-actions"]}>
                    <button className="btn-grey" onClick={onClose} type="button">
                        {t("common:cancel")}
                    </button>
                    <button className="btn-red" onClick={submit} type="button" data-testid="btn-submit-gallery">
                        {t("common:ok")}
                    </button>
                </div>
            </BaseDialog>
        </div>
    );
};

const Avatar: React.FC<{ id: number; isSelected: boolean; onClick: () => void }> = ({ id, isSelected, onClick }) => {
    return (
        <div className={`${Styles["img-wrapper"]} ${isSelected ? Styles["border-highlight"] : ""}`} onClick={onClick}>
            <img src={`/static/images/avatar/${id}.png`} className="img-fluid" width="54" height="54" alt="Avatar" />
            {isSelected && <div className={`icon-success ${Styles["selected-img"]}`}></div>}
        </div>
    );
};
