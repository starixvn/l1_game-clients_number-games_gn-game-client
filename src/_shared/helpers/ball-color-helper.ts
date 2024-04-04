enum BallColor {
    BLUE = "blue",
    RED = "red",
}

export const getBallColor = (index: number) => {
    let balls = {};

    let isRedColor = true;
    let countTemp = 0;

    for (let i = 1; i <= 75; i++) {
        if (countTemp === 2) {
            countTemp = 0;
            isRedColor = !isRedColor;
        }
        balls[i] = isRedColor ? BallColor.RED : BallColor.BLUE;
        countTemp++;
    }

    return balls[index];
};
