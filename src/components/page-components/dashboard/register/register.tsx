import { FormEvent, PureComponent, ReactNode, useEffect, useMemo, useState } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import dynamic from "next/dynamic";
import { getAppSettings, getGameIdsSetting } from "../../../../_shared/app-settings";
import { LobbyGameId, Themes } from "../../../../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { GetLocalizedErrorMessage } from "../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../_shared/helpers/number-helper";
import PreloadResources, { getAndHandleBannerOffer, getAndHandleGameOfferIds } from "../../../../_shared/helpers/preload-resources";
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
import styles from "./register.module.scss";

const UMPage = dynamic(() => import("./../../um-page"));
const Dashboard = dynamic(() => import(".."));

export type RegisterProps = {
    session: SSOResponse;
    isDirectMode: boolean;
    gameId: number;
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

    setIsUM() {
        this.setState({ isUm: true });
    }

    async submit(event: FormEvent) {
        event.preventDefault();

        const { name, avatar } = this.state;
        const { t, session } = this.props;
        let authorizeResponse;

        if (!NameGenerator.validateName(name)) {
            this.setState({ formValidity: t("Common.name_invalid"), isValidUsername: false });

            return;
        }

        try {
            authorizeResponse = await createNickname(session, name, avatar);
        } catch (error) {
            console.log("Error Create Nick Name", error);
        }

        if (this.isAuthorizeResponse(authorizeResponse)) {
            Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
            this.setState({ authorizeResponse: authorizeResponse, isTriggerPreloadResources: true });
        } else {
            this.setState({
                formValidity: t(GetLocalizedErrorMessage(authorizeResponse.errorCode)),
                isValidUsername: false,
            });
        }

        AnalyticsHelper.trackFunction({ function: TrackingFunction.Avatar, action: TrackingAction.Create });
    }

    isAuthorizeResponse = (response): response is AuthorizeResponse => {
        return response?.authorized;
    };

    updateStatePreloadResource() {
        this.setState({ isDonePreloadResource: true });
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
        } = this.state;
        const { t, session, isDirectMode, gameId } = this.props;

        if (isUm) {
            return <UMPage />;
        }

        if (isDonePreloadResource) {
            return (
                <Dashboard
                    session={session}
                    queryGame={gameId}
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

                    <button className={`btn-green ${styles.submit} ${isDonePreloadResource ? styles["btn-blur"] : ""}`} type="submit">
                        {t("SabaNumber.button_play_now")}
                    </button>
                </form>

                <p className={styles.note}>{t("SabaNumber.create_nickname_note")}</p>
                <div className="loading">
                    <div className="progress">
                        <div className="progress-bar" id="register-progress-bar"></div>
                    </div>
                </div>

                {isGalleryOpened && (
                    <AvatarGallery
                        selectedAvatarId={avatar}
                        onSelectAvatar={this.setAvatar.bind(this)}
                        onClose={this.toggleAvatarGallery.bind(this)}
                    />
                )}

                {isTriggerPreloadResources && (
                    <TriggerPreloadResource
                        gameId={LobbyGameId}
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

const TriggerPreloadResource: React.FC<{
    gameId: number;
    updateStatePreloadResource: Function;
    updateLobbyConfigs: Function;
    session: SSOResponse;
    authorizeResponse: AuthorizeResponse;
}> = ({ gameId, updateStatePreloadResource, updateLobbyConfigs, session, authorizeResponse }) => {
    const [bannerId, setBannerId] = useState<number>(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    const handleUnauthorizedAccess = async () => {
        const lobby = await getLobbyConfigs(session);
        if (lobby?.lobbyConfigs) {
            updateLobbyConfigs(lobby?.lobbyConfigs);
            getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
        }

        const gameIds = getGameIdsSetting()?.map((id) => parseInt(id, 10));
        const firstGameId = gameIds[0];
        if (firstGameId > 0) {
            setGameOfferIds(gameIds);
            setBannerId(firstGameId);
        }
    };

    useEffect(() => {
        handleUnauthorizedAccess();
    }, []);

    return useMemo(() => {
        return (
            <PreloadResources
                gameId={gameId}
                setIsDonePreload={updateStatePreloadResource}
                enablePreload={getAppSettings()?.enablePreloadResource || true}
                bannerId={bannerId}
                gameIdsIcon={gameOfferIds}
                progressBarId="register-progress-bar"
            />
        );
    }, [gameId]);
};

export default withTranslator(Register);
