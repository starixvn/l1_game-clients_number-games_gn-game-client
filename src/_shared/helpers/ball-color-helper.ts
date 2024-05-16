enum BallColor {
    BLUE = "blue",
    RED = "red",
}

export const getBallColor = (index: number) => {
    const balls = {};

    for (let i = 1; i <= 75; i++) {
        balls[i] = i % 2 === 0 ? BallColor.RED : BallColor.BLUE;
    }

    return balls[index];
};
