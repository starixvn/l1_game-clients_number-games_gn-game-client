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

function percentOf(countResult: object, property: string, total: number) {
    const counted = countResult[property] || 0;

    return Math.round((counted * 100) / total);
}

export const StatisticRuleEntries = Object.entries({
    [BacBallBetOptions.PLAYER]: (countResult: object, total: number) => percentOf(countResult, BacBallBetOptions.PLAYER, total),
    [BacBallBetOptions.BANKER]: (countResult: object, total: number) =>
        isFirstLoad(countResult)
            ? 0
            : 100 - percentOf(countResult, BacBallBetOptions.PLAYER, total) - percentOf(countResult, BacBallBetOptions.TIE, total),
    [BacBallBetOptions.TIE]: (countResult: object, total: number) => percentOf(countResult, BacBallBetOptions.TIE, total),
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
