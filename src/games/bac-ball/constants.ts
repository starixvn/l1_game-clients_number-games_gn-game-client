export enum BacBallBetOptions {
    BANKER = "banker",
    PLAYER = "player",
    TIE = "tie",
}

export const BacBallBetOptionsPercentageColor = {
    player: "#98CDFF",
    banker: "#F9BCB9",
    tie: "#2FC856",
};
export const MinProbability = {
    player: 2346 / (72 * 72),
    banker: 2346 / (72 * 72),
    tie: 69 / (72 * 72),
};

export const MaxProbability = {
    player: 2769 / (72 * 72),
    banker: 2769 / (72 * 72),
    tie: 1 / 72,
};
