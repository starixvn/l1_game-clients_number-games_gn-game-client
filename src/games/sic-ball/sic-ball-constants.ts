import { BallStatus } from "../../components/game-components/ball";

export enum SicBallBetOptions {
    BIG = "big",
    SMALL = "small",
    SPECIFIC1 = "specific1",
    SPECIFIC2 = "specific2",
    SPECIFIC3 = "specific3",
    SPECIFIC4 = "specific4",
    SPECIFIC5 = "specific5",
    SPECIFIC6 = "specific6",
}

export enum SicBallSideBetOdds {
    SINGLE = "single",
    DOUBLE = "double",
    TRIPLE = "triple",
}

export const SicBallBetOptionsPercentageColor = {
    big: "#84C6FF",
    small: "#FF9090",
};

export const defaultRoundData = [
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
];
