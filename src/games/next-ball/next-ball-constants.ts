import { BallStatus } from "../../components/game-components/ball";

export enum NextBallBetOptions {
    OVER = "over",
    UNDER = "under",
    ODD = "odd",
    EVEN = "even",
}

export const NextBallBetOptionsPercentageColor = {
    over: "#98CDFF",
    under: "#F9BCB9",
    odd: "#98CDFF",
    even: "#F9BCB9",
};

export const defaultRoundData = [
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
];
