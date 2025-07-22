import dynamic from "next/dynamic";
import { FormEvent, PureComponent, ReactNode } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { Themes } from "../../../../_shared/constants";
import {
    AnalyticsHelper,
    TrackingAction,
    TrackingFunction,
    getEnabledRenderGameSettings,
    getServiceStatusIsAvailable,
} from "../../../../_shared/helpers";
import { GetLocalizedErrorMessage } from "../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../_shared/helpers/number-helper";
import { tolgee } from "../../../../_shared/tolgee";
import { createNickname, getLobbyConfigs } from "../../../../services/auth-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import FirstLoginContainer from "../../../page-components/dashboard/container";
import TextBlock from "../../../page-components/dashboard/text-block";
import ProfilePicture from "../../../page-components/profile-picture";
import { TranslatorProps, withTranslator } from "../../translator";
import { ILobbyConfigs } from "../type";
import { AvatarGallery, MAX_AVATAR_ID } from "./avatar-gallery";
import NameGenerator from "./name-generator";
import PreloadResourceRegister from "./preload-resource";
import styles from "./register.module.scss";

const UMPage = dynamic(() => import("./../../um-page"));
const Dashboard = dynamic(() => import(".."));

export type RegisterProps = {
    session: SSOResponse;
    isDirectMode: boolean;
    gameId: number;
    firstSSOToLobby?: boolean;
    isSabaPlay?: boolean;
} & TranslatorProps;

export type RegisterState = {
    name: string;
    avatar: number;
    isGalleryOpened: boolean;
    isValidUsername: boolean;
    formValidity: string;
    isTriggerPreloadResources: boolean;
    isDonePreloadResource: boolean;
    authorizeResponse: AuthorizeResponse;
    lobbyConfigs: ILobbyConfigs;
    isUm: boolean;
    isClickRegister: boolean;
    toLoadGameId: number;
};

export class Register extends PureComponent<RegisterProps, RegisterState> {
    static defaultState: RegisterState = {
        avatar: randomInteger(1, MAX_AVATAR_ID),
        isGalleryOpened: false,
        isValidUsername: true,
        name: NameGenerator.generateName(),
        formValidity: "",
        isTriggerPreloadResources: false,
        isDonePreloadResource: false,
        authorizeResponse: null,
        lobbyConfigs: null,
        isUm: false,
        isClickRegister: false,
        toLoadGameId: 0,
    };

    constructor(props: RegisterProps) {
        super(props);

        this.state = { ...Register.defaultState, toLoadGameId: props.gameId };
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

    setIsUM() {
        this.setState({ isUm: true });
    }

    updateClickRegister(isClickRegister: boolean) {
        this.setState({ isClickRegister });
    }

    async submit(event: FormEvent) {
        event.preventDefault();
        this.updateClickRegister(true);

        const { name, avatar } = this.state;
        const { t, session } = this.props;
        let authorizeResponse;

        if (!NameGenerator.validateName(name)) {
            this.setState({ formValidity: t("Common.name_invalid"), isValidUsername: false });
            this.updateClickRegister(false);
            return;
        }

        try {
            authorizeResponse = await createNickname(session, name, avatar);
        } catch (error) {
            // Error handled silently
        }

        if (this.isAuthorizeResponse(authorizeResponse)) {
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            this.setState({ authorizeResponse: authorizeResponse, isTriggerPreloadResources: true });

            if (!this.props.isDirectMode) {
                await this.updateToLoadGameId(authorizeResponse);
            }
        } else {
            this.setState({
                formValidity: t(GetLocalizedErrorMessage(authorizeResponse?.errorCode)),
                isValidUsername: false,
            });
        }

        AnalyticsHelper.trackFunction({ function: TrackingFunction.Avatar, action: TrackingAction.Create });
    }

    updateToLoadGameId = async (authorizeResponse: AuthorizeResponse) => {
        const { session, firstSSOToLobby } = this.props;

        const lobby = await getLobbyConfigs(session);

        const enabledRenderGameSettings = getEnabledRenderGameSettings(lobby?.lobbyConfigs, authorizeResponse);

        if (firstSSOToLobby && enabledRenderGameSettings.length > 0) {
            // Business requirement: Redirect to lobby instead of specific game
            this.setState({ toLoadGameId: 0 });
        } else if (enabledRenderGameSettings.length > 0) {
            for (const gameSetting of enabledRenderGameSettings) {
                const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
                if (isServiceAvailable) {
                    this.setState({ toLoadGameId: gameSetting.id });
                    break;
                }
            }
        } else {
            // Fix: Handle case when no enabled games are available - default to lobby
            this.setState({ toLoadGameId: 0 });
        }
    };

    isAuthorizeResponse = (response): response is AuthorizeResponse => {
        return !!response?.authorized;
    };

    updateStatePreloadResource() {
        this.setState({ isDonePreloadResource: true, isClickRegister: false });
    }

    updateLobbyConfigs(lobbyConfigs: any) {
        this.setState({ lobbyConfigs });
    }

    render(): ReactNode {
        const {
            avatar,
            isGalleryOpened,
            isValidUsername,
            name,
            formValidity,
            isTriggerPreloadResources,
            isDonePreloadResource,
            authorizeResponse,
            lobbyConfigs,
            isUm,
            isClickRegister,
        } = this.state;
        const { t, session, isDirectMode, isSabaPlay } = this.props;

        document.body.classList.add("galaxy-bg", "register");

        if (isUm) {
            return <UMPage />;
        }

        if (isDonePreloadResource) {
            document.body.classList.remove("register");

            return (
                <Dashboard
                    session={session}
                    queryGame={this.state.toLoadGameId}
                    setIsUm={this.setIsUM.bind(this)}
                    directMode={isDirectMode}
                    tolgee={tolgee}
                    authorizeResponse={authorizeResponse}
                    lobbyConfigs={lobbyConfigs}
                />
            );
        }

        return (
            <FirstLoginContainer>
                <div className={styles.welcome}>
                    <TextBlock>{t("SabaNumber.message_welcome")}</TextBlock>
                    {isSabaPlay ? (
                        <h1 className={styles["welcom-numbergame"]}>{t("SabaNumber.message_welcome_numbergame_sabaplay")}</h1>
                    ) : (
                        <h1 className={styles["welcom-numbergame"]}>{t("SabaNumber.message_welcome_numbergame")}</h1>
                    )}
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

                    <button className={`btn-green ${styles.submit} ${isClickRegister ? styles["btn-blur"] : ""}`} type="submit">
                        {t("SabaNumber.button_play_now")}
                    </button>
                </form>

                <p className={styles.note}>{t("SabaNumber.create_nickname_note")}</p>
                {isClickRegister && (
                    <div className="loading">
                        <div className="progress">
                            <div className="progress-bar" id="register-progress-bar"></div>
                        </div>
                    </div>
                )}

                {isGalleryOpened && (
                    <AvatarGallery
                        selectedAvatarId={avatar}
                        onSelectAvatar={this.setAvatar.bind(this)}
                        onClose={this.toggleAvatarGallery.bind(this)}
                    />
                )}

                {isTriggerPreloadResources && (
                    <PreloadResourceRegister
                        isDirectMode={isDirectMode}
                        gameId={this.state.toLoadGameId}
                        updateStatePreloadResource={this.updateStatePreloadResource.bind(this)}
                        updateLobbyConfigs={this.updateLobbyConfigs.bind(this)}
                        session={session}
                        authorizeResponse={authorizeResponse}
                    />
                )}
            </FirstLoginContainer>
        );
    }
}

export default withTranslator(Register);
