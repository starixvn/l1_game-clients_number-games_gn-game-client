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

export const StatisticRuleEntries = Object.entries({
    [BacBallBetOptions.PLAYER]: (countResult: object, total: number) =>
        countResult[BacBallBetOptions.PLAYER] ? Math.round((countResult[BacBallBetOptions.PLAYER] * 100) / total) : 0,
    [BacBallBetOptions.BANKER]: (countResult: object, total: number) =>
        100 -
        ((countResult[BacBallBetOptions.PLAYER] ? Math.round((countResult[BacBallBetOptions.PLAYER] * 100) / total) : 0) +
            (countResult[BacBallBetOptions.TIE] ? Math.round((countResult[BacBallBetOptions.TIE] * 100) / total) : 0)),
    [BacBallBetOptions.TIE]: (countResult: object, total: number) =>
        countResult[BacBallBetOptions.TIE] ? Math.round((countResult[BacBallBetOptions.TIE] * 100) / total) : 0,
});
