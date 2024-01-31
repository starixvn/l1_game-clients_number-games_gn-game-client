export interface Props {
    message: string | string[];
    closeModal: Function;
}

export const ConnectFailedReasonKey = {
    lostConnection: "lostGameConnection",
    restrictPlayPermission: "notPermittedToPlay"
}
