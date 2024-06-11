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

export const DotColorMapper = {
    [SicBallBetOptions.SPECIFIC1]: [true, true, true, false],
    [SicBallBetOptions.SPECIFIC2]: [true, true, true, true],
    [SicBallBetOptions.SPECIFIC3]: [true, false, false, false],
    [SicBallBetOptions.SPECIFIC4]: [false, false, false, false],
    [SicBallBetOptions.SPECIFIC5]: [true, true, false, false],
    [SicBallBetOptions.SPECIFIC6]: [true, true, false, false],
};
