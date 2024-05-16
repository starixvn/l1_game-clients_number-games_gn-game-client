
export const SeBallConstant = {
    BALLS_EACH_ROUND: 4,
    TOTAL_BALLS: 60
};

export class SeBallPfHelper {
    static finalHashToNumbers(finalHash: string, index: number) {
        return parseInt(finalHash.slice(index * 2, index * 2 + 2), 16);
    };

    static buildRemainingBallList(ballIndexes: number[]) {
        let results: number[] = [];
        let balls = Array.from(Array(SeBallConstant.TOTAL_BALLS), (_, index) => index + 1);
        let remainingBalls = [balls];

        ballIndexes.forEach((i) => {
            const result = balls[i - 1];
            results.push(result);
            balls = balls.filter(ballValue => ballValue !== result);
            remainingBalls.push(balls);
        });

        return { results, remainingBalls };
    }

    static buildVerifyInfo({ pfResult, combinedHash }) {
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];
        const rawDigits = combinedHash.match(/.{2}/g);
        const convertNumber = Array.from(Array(SeBallConstant.BALLS_EACH_ROUND), (_, index) => this.finalHashToNumbers(combinedHash, index));
        const ballIndexes = randomNumbers.map((x, index) => ((x + convertNumber[index]) % (SeBallConstant.TOTAL_BALLS - index)) + 1);

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            ballIndexes,
            ...this.buildRemainingBallList(ballIndexes)
        };
    }

}
