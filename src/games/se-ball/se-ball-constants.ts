import { BallStatus } from "../../components/game-components/ball";

export enum SeBallBetOptions {
    ODD = "odd",
    EVEN = "even",
    RED3 = "red3",
    RED4 = "red4",
    BLUE3 = "blue3",
    BLUE4 = "blue4",
    RED2 = "red2",
}

export const SeBallBetOptionsPercentageColor = {
    odd: "#84C6FF",
    even: "#FF9090",
};

export const defaultRoundData = [
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
    { number: 0, status: BallStatus.NONE, delayTime: 0 },
];

export const DotColorMapper = {
    [SeBallBetOptions.RED3]: [true, true, true, false],
    [SeBallBetOptions.RED4]: [true, true, true, true],
    [SeBallBetOptions.BLUE3]: [true, false, false, false],
    [SeBallBetOptions.BLUE4]: [false, false, false, false],
    [SeBallBetOptions.RED2]: [true, true, false, false],
};
