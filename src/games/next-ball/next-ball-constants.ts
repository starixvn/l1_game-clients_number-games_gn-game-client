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
    odd: "#2FC856",
    even: "#2FC856",
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
