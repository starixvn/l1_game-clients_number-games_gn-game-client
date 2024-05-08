import { Component, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { getAppSettings, getGameIdsSetting } from "../../../../_shared/app-settings";
import { LobbyGameId, Themes } from "../../../../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { GetLocalizedErrorMessage } from "../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../_shared/helpers/number-helper";
import PreloadResources from "../../../../_shared/helpers/preload-resources";
import { createNickname, getLobbyConfigs } from "../../../../services/auth-service";
import { updateSignInSMStatus } from "../../../../services/user-setting-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import FirstLoginContainer from "../../../page-components/dashboard/container";
import TextBlock from "../../../page-components/dashboard/text-block";
import ProfilePicture from "../../../page-components/profile-picture";
import { TranslatorProps, withTranslator } from "../../translator";
import { MAX_AVATAR_ID } from "./avatar-gallery";
import NameGenerator from "./name-generator";
import styles from "./register.module.scss";

export type RegisterProps = {
    session: SSOResponse;
    setAuthorizeResponse: Function;
    setLobbyConfigs: Function;
} & TranslatorProps;

export type RegisterState = {
    name: string;
    avatar: number;
    isGalleryOpened: boolean;
    isValidUsername: boolean;
    formValidity: string;
    isTriggerPreloadResources: boolean;
};

export class Register extends Component<RegisterProps, RegisterState> {
    static defaultState: RegisterState = {
        avatar: randomInteger(1, MAX_AVATAR_ID),
        isGalleryOpened: false,
        isValidUsername: true,
        name: NameGenerator.generateName(),
        formValidity: "",
        isTriggerPreloadResources: false,
    };

    constructor(props: RegisterProps) {
        super(props);

        this.state = Register.defaultState;
    }

    componentDidMount() {
        const { isTriggerPreloadResources } = this.state;
        if (!isTriggerPreloadResources) {
            this.setState({
                isTriggerPreloadResources: true,
            });
        }
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
            await this.handleStateLogin(authorizeResponse);
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

    async handleStateLogin(authorizeInfo: AuthorizeResponse) {
        const { setAuthorizeResponse, setLobbyConfigs, session } = this.props;
        updateSignInSMStatus(session);
        authorizeInfo.user.isSignedInSM = true;

        const lobby = await getLobbyConfigs(session);
        lobby?.lobbyConfigs && setLobbyConfigs(lobby?.lobbyConfigs);

        setAuthorizeResponse(authorizeInfo);
    }

    render(): ReactNode {
        const { avatar, isGalleryOpened, isValidUsername, name, formValidity, isTriggerPreloadResources } = this.state;
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

                {isTriggerPreloadResources && <TriggerPreloadResource gameId={LobbyGameId} />}
            </FirstLoginContainer>
        );
    }
}

const TriggerPreloadResource: React.FC<{ gameId: number }> = ({ gameId }) => {
    const [bannerId, setBannerId] = useState<number>(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    const handleUnauthorizedAccess = () => {
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
                setIsDonePreload={() => {}}
                enablePreload={getAppSettings()?.enablePreloadResource || true}
                bannerId={bannerId}
                gameIdsIcon={gameOfferIds}
            />
        );
    }, [gameId]);
};

export default withTranslator(Register);
