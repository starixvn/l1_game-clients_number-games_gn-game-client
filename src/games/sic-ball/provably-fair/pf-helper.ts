import { finalHashToNumbers } from "../../../_shared/helpers/pf/pf-round-base-helper";

export default class PfSicBallHelper {
    static buildVerifyInfo({ pfResult, combinedHash, totalBalls, ballsEachRound }) {
        const serverSeed = JSON.parse(pfResult?.serverSeed || "{}");
        const randomNumbers = (serverSeed?.random || "").split(";").map((x: string) => +x) as number[];
        const rawDigits = combinedHash.match(/.{2}/g);
        const convertNumber = Array.from(Array(ballsEachRound), (_, index) => finalHashToNumbers(combinedHash, index));
        const ballIndexes = randomNumbers.map((x, index) => ((x + convertNumber[index]) % totalBalls) + 1);
        const severSeedRemain = (serverSeed?.remain || "2;2").split(";");

        return {
            randomNumbers,
            rawDigits,
            convertNumber,
            ballIndexes,
            severSeedRemain,
        };
    }
}
