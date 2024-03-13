const numberRoundDownWithCommas = (number: number, toFixed = 2) => {
    const result = Math.floor(number * Math.pow(10, toFixed)) / Math.pow(10, toFixed);

    return numberWithCommas(result, toFixed);
};

const numberWithCommas = (number: number, toFixed = 2, minimumFractionDigits = 0) => {
    const options = { maximumFractionDigits: toFixed } as any;
    if (number % parseInt(number.toString()) !== 0) {
        options.minimumFractionDigits = minimumFractionDigits;
    }
    return number.toLocaleString("en-US", options);
};

const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomNumberSeries = (length: number) => {
    return Array.from({ length }, () => randomInteger(0, 9)).join("");
};

const sumArray = (numbers: number[]) => numbers.reduce((number, sum) => number + sum, 0);

const formatOdds = (value: number | string | undefined, isFractionalFormat = false) => {
    return isFractionalFormat ? `${numberWithCommas(+value - 1, 2, 2)}:1` : `1:${numberWithCommas(+value, 2, 2)}`;
};

const probabilityToBetOdds = (prob: number, margin = 0) => {
    const odds = (1 - margin) / prob;
    return odds > 20 ? Math.floor(odds) : Number((Math.floor(odds * 100) / 100).toFixed(2));
};

export { numberRoundDownWithCommas, numberWithCommas, randomInteger, sumArray, formatOdds, randomNumberSeries, probabilityToBetOdds };
