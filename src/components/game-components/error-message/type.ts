import { ResourceTypes } from "../../../_shared/resources";

export interface Props {
    message: string | string[];
    closeModal: Function;
}

export const ConnectFailedReasonKey = {
    lostConnection: `${ResourceTypes.COMMON}.splash_connection_lost`,
    restrictPlayPermission: `${ResourceTypes.COMMON}.game_excluded`,
};
