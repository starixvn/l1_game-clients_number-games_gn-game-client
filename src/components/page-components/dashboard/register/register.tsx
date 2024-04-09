import { Component, FormEvent, ReactNode } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { Themes } from "../../../../_shared/constants";
import { GetLocalizedErrorMessage } from "../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../_shared/helpers/number-helper";
import { createNickname } from "../../../../services/auth-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import FirstLoginContainer from "../../../page-components/dashboard/container";
import TextBlock from "../../../page-components/dashboard/text-block";
import ProfilePicture from "../../../page-components/profile-picture";
import { TranslatorProps, withTranslator } from "../../translator";
import { AvatarGallery, MAX_AVATAR_ID } from "./avatar-gallery";
import NameGenerator from "./name-generator";
import styles from "./register.module.scss";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";

export type RegisterProps = {
    session: SSOResponse;
    handleStateLogin: (authorizeInfo: AuthorizeResponse) => void;
} & TranslatorProps;

export type RegisterState = {
    name: string;
    avatar: number;
    isGalleryOpened: boolean;
    isValidUsername: boolean;
    formValidity: string;
};

export class Register extends Component<RegisterProps, RegisterState> {
    static defaultState: RegisterState = {
        avatar: randomInteger(1, MAX_AVATAR_ID),
        isGalleryOpened: false,
        isValidUsername: true,
        name: NameGenerator.generateName(),
        formValidity: "",
    };

    constructor(props: RegisterProps) {
        super(props);

        this.state = Register.defaultState;
    }

    toggleAvatarGallery() {
        this.setState({ isGalleryOpened: !this.state.isGalleryOpened });
    }

    setOrGenerateName(name?: string) {
        if (name !== undefined) {
            this.setState({ name, isValidUsername: true });
        } else {
            this.setState({ name: NameGenerator.generateName(), isValidUsername: true });
            AnalyticsHelper.trackFunction({
                function: TrackingFunction.Nickname,
                action: TrackingAction.GenerateRandom,
            });
        }
    }

    setAvatar(avatar: number) {
        this.setState({ avatar });
    }

    toggleUsernameValidation() {
        this.setState({ isValidUsername: !this.state.isValidUsername });
    }

    async submit(event: FormEvent) {
        event.preventDefault();

        const { name, avatar } = this.state;
        const { t, session, handleStateLogin } = this.props;

        if (!NameGenerator.validateName(name)) {
            this.setState({ formValidity: t("Common.name_invalid"), isValidUsername: false });

            return;
        }

        const response = await createNickname(session, name, avatar);
        const authorizeResponse = response as any;

        if (authorizeResponse && authorizeResponse.authorized) {
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            handleStateLogin(authorizeResponse);
        } else {
            this.setState({
                formValidity: t(GetLocalizedErrorMessage((response as any).errorCode)),
                isValidUsername: false,
            });
        }

        AnalyticsHelper.trackFunction({ function: TrackingFunction.Avatar, action: TrackingAction.Create });
    }

    render(): ReactNode {
        const { avatar, isGalleryOpened, isValidUsername, name, formValidity } = this.state;
        const { t } = this.props;

        return (
            <FirstLoginContainer>
                <div className={styles.welcome}>
                    <TextBlock>{t("SabaNumber.message_welcome")}</TextBlock>
                    <h1 className={styles["welcom-numbergame"]}>{t("SabaNumber.message_welcome_numbergame")}</h1>
                </div>

                <ProfilePicture avatarId={avatar} isEditable={true} onClick={this.toggleAvatarGallery.bind(this)} />

                <form className={styles.form} onSubmit={this.submit.bind(this)}>
                    {!isValidUsername && (
                        <div className={styles.hint}>
                            <BaseDialog type={ModalType.Center} isOpen={isGalleryOpened}>
                                <div
                                    className={`icon-close ${styles["icon-close-hint"]}`}
                                    onClick={this.toggleUsernameValidation.bind(this)}
                                ></div>
                                <div className={styles["hint-content"]}>
                                    <ul className={styles["note"]}>
                                        <li>{t("Common.message_nickname_distance")}</li>
                                        <li>{t("Common.message_nickname_character")}</li>
                                    </ul>
                                </div>
                            </BaseDialog>
                        </div>
                    )}
                    <label className={styles.title}>{t("SabaNumber.lobby_create_nickname")}</label>

                    <div className={styles.username}>
                        <input
                            type="text"
                            className={`${styles.input} ${!isValidUsername ? styles.error : ""}`}
                            value={name}
                            data-testid="username"
                            onChange={(event) => this.setOrGenerateName(event.target.value)}
                            placeholder={t("Common.enter_your_name")}
                        />

                        <span className={`icon-close ${styles.clear}`} onClick={() => this.setOrGenerateName("")} />

                        <button className={styles.refresh} onClick={() => this.setOrGenerateName()} type="button">
                            <span className="icon-refresh" />
                        </button>
                    </div>
                    {!isValidUsername && <label className={styles.error}>{formValidity}</label>}

                    <button className={`btn-green ${styles.submit}`} type="submit">
                        {t("SabaNumber.button_play_now")}
                    </button>
                </form>

                <p className={styles.note}>{t("SabaNumber.create_nickname_note")}</p>

                {isGalleryOpened && (
                    <AvatarGallery
                        selectedAvatarId={avatar}
                        onSelectAvatar={this.setAvatar.bind(this)}
                        onClose={this.toggleAvatarGallery.bind(this)}
                    />
                )}
            </FirstLoginContainer>
        );
    }
}

export default withTranslator(Register);
