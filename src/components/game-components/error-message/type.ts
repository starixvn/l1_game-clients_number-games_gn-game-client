export interface Props {
    message: string | string[];
    closeModal: Function;
}

export const ConnectFailedReasonKey = {
    lostConnection: "message_lost_game_connection",
    restrictPlayPermission: "game_excluded",
};
