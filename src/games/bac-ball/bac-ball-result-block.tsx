import { Assets, Spritesheet } from "pixi.js";
import { ResultBlock, ResultBlockProps, ResultBlockState } from "../../components/game-base/game-blocks/result-block";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import Style from "./bac-ball.module.scss";

class BacBallResultBlockState extends ResultBlockState {
    cageBallFrames = { blue: [], red: [] };
    cageBallsLoopFrames = [];
}

export class BacBallResultBlock extends ResultBlock<ResultBlockProps, BacBallResultBlockState> {
    constructor(props: ResultBlockProps) {
        super(props);
    }

    async loadBallJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/ball.json");
        const blueFrames = sprite.animations["blue"];
        const redFrames = sprite.animations["red"];

        this.setState({ cageBallFrames: { blue: blueFrames, red: redFrames } });
    }

    async loadCageLoopsJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/cage-balls.json");

        this.setState({ cageBallsLoopFrames: sprite.animations["loop"] });
    }

    componentDidMount(): void {
        this.loadCageLoopsJson();
        this.loadBallJson();
    }

    render() {
        // waiting for rounduration class
        const parentState = this.props.getGameState();

        if (!parentState.result || this.state.cageBallsLoopFrames?.length === 0 || this.state.cageBallFrames?.blue?.length === 0) {
            return <></>;
        }

        const { player, banker } = parentState.result;

        return (
            <div className={Style["result-container"]}>
                <div className={Style["player-container"]}>
                    <div className={Style["lottery-player-container"]}>
                        <Cage
                            cageBallsLoopFrames={this.state.cageBallsLoopFrames}
                            cageBallFrames={this.state.cageBallFrames}
                            color={CageColor.Blue}
                            ballColor={BallColor.Blue}
                            isSmall={true}
                            result={player}
                            isShowResult={parentState.playResultAnimation}
                        />
                    </div>
                    <div className={Style["ball-container"]}>
                        <Ball number={38} color="red" />
                        <Ball number={27} color="blue" />
                        <Ball isLoading />
                        <Ball isEmpty />
                    </div>
                </div>
                <div className={Style["player-container"]}>
                    <div className={Style["ball-container"]}>
                        <Ball number={48} color="blue" />
                        <Ball number={3} color="blue" />
                        <Ball isLoading />
                        <Ball isEmpty />
                    </div>
                    <div className="lottery">
                        <Cage
                            cageBallsLoopFrames={this.state.cageBallsLoopFrames}
                            cageBallFrames={this.state.cageBallFrames}
                            color={CageColor.Red}
                            ballColor={BallColor.Red}
                            isSmall={true}
                            result={banker}
                            isShowResult={parentState.playResultAnimation}
                            delayShowResultTime={1000}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
