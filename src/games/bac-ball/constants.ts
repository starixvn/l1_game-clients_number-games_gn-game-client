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

const isFirstLoad = (countResult) =>
    !countResult[BacBallBetOptions.PLAYER] && !countResult[BacBallBetOptions.TIE] && !countResult[BacBallBetOptions.BANKER];
export const StatisticRuleEntries = Object.entries({
    [BacBallBetOptions.PLAYER]: (countResult: object, total: number) =>
        countResult[BacBallBetOptions.PLAYER] ? Math.round((countResult[BacBallBetOptions.PLAYER] * 100) / total) : 0,
    [BacBallBetOptions.BANKER]: (countResult: object, total: number) =>
        isFirstLoad(countResult)
            ? 0
            : 100 -
              ((countResult[BacBallBetOptions.PLAYER] ? Math.round((countResult[BacBallBetOptions.PLAYER] * 100) / total) : 0) +
                  (countResult[BacBallBetOptions.TIE] ? Math.round((countResult[BacBallBetOptions.TIE] * 100) / total) : 0)),
    [BacBallBetOptions.TIE]: (countResult: object, total: number) =>
        countResult[BacBallBetOptions.TIE] ? Math.round((countResult[BacBallBetOptions.TIE] * 100) / total) : 0,
});

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
