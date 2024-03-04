import { ResourceTypes } from "../../../_shared/resources";

export interface Props {
    message: string | string[];
    closeModal: Function;
}

export const ConnectFailedReasonKey = {
    lostConnection: `${ResourceTypes.COMMON}.splash_connection_lost`,
    restrictPlayPermission: `${ResourceTypes.SABANUMBER}.game_excluded`,
};
