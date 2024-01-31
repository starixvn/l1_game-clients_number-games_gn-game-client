const numberRoundDownWithCommas = (number: number, toFixed = 2) => {
    const result = Math.floor(number * Math.pow(10, toFixed)) / Math.pow(10, toFixed);

    return numberWithCommas(result, toFixed);
};

const numberWithCommas = (number: number, toFixed = 2) => {
    return number.toLocaleString("en-US", { maximumFractionDigits: toFixed });
};

const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const sumArray = (numbers: number[]) => numbers.reduce((number, sum) => number + sum, 0);

const formatOdds = (value: number | string | undefined, isFractionalFormat = false) => {
    return isFractionalFormat ? `${numberWithCommas(+value - 1, 2)}:1` : `1:${value}`;
};

export { numberRoundDownWithCommas, numberWithCommas, randomInteger, sumArray, formatOdds };
