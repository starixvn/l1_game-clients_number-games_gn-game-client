import { AnimatedSprite, Container, Stage } from "@pixi/react";
import Style from "./bac-ball.module.scss";
import PercentageCircle from "../../components/game-components/percentage-circle";
import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import { BetOptionData } from "../../_shared/constants";
import { GameState } from "../../components/game-base/type";
import { FC, useContext, useEffect, useState } from "react";
import { GameContext } from "../../_shared/react-contexts";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";

export type BettingBlockProps = {
    getGameState: () => any;
};

export interface BetChoice {
    name: string;
    odds: number;
    totalBet?: number;
    totalPlayer?: number;
    percent?: number;
}
export interface Bet {
    [betChoice: string]: number | any;
}

const betData: BetOptionData[] = [
    {
        betChoice: "Player",
        odds: 1.97,
        players: 37,
        percent: 55,
    },
    {
        betChoice: "Banker",
        odds: 1.97,
        players: 15,
        percent: 35,
    },
    {
        betChoice: "Tie",
        odds: 1.97,
        players: 7,
        percent: 10,
    },
];

export const BacBallBettingBlockFC: FC<BettingBlockProps> = (props) => {
    const [winningPlayerFrames, setWinningPlayerFrames] = useState<Texture<Resource>[]>([]);
    const [winningTieFrames, setWinningTieFrames] = useState<Texture<Resource>[]>([]);
    const [totalBets, setTotalBets] = useState<Bet>({});
    const [odds, setOdds] = useState<Bet>({});
    const gameContext = useContext(GameContext);

    useEffect(() => {
        if (winningPlayerFrames.length === 0) {
            loadPixiAnimations("/static/images/bac-number/highlight-winning-player.json", (sprite) => {
                setWinningPlayerFrames(sprite.animations["highlight-winning-player"]);
            });
        }
    }, [winningPlayerFrames.length]);

    useEffect(() => {
        if (winningTieFrames.length === 0) {
            loadPixiAnimations("/static/images/bac-number/highlight-winning-tie.json", (sprite) => {
                setWinningTieFrames(sprite.animations["highlight-winning-tie"]);
            });
        }
    }, [winningTieFrames.length]);

    const handleTotalBet = ({ totalBets }) => {
        setTotalBets(totalBets);
    };

    const handleOdds = ({ odds }) => {
        setOdds(odds);
    };

    gameContext.messageTransmitter.register("totalBets", handleTotalBet);
    gameContext.messageTransmitter.register("odds", handleOdds);

    const onClickPlayer = () => {
        console.log("onClickPlayer");
    };

    const onClickBanker = () => {
        console.log("onClickBanker");
    };
    const onClickTie = () => {
        console.log("onClickTie");
    };

    const dataPlayer = betData[0];
    const dataBanker = betData[1];
    const dataTie = betData[2];

    if (winningPlayerFrames.length > 0 && winningTieFrames.length > 0) {
        // waiting for rounduration class
        const parentState = props.getGameState();
        const isShowWinningHighlightPlayer =
            parentState.gameState === GameState.DisplayResult && parentState?.settlementResult?.player && winningPlayerFrames.length > 0;
        const isShowWinningHighlightBanker =
            parentState.gameState === GameState.DisplayResult && parentState?.settlementResult?.banker && winningPlayerFrames.length > 0;
        const isShowWinningHighlightTie =
            parentState.gameState === GameState.DisplayResult && parentState?.settlementResult?.tie && winningTieFrames.length > 0;

        return (
            <div className={`${Style["betting-zone"]}`}>
                <div className={Style["left-corner"]}>
                    <div className={Style["winning-effect"]}>
                        {isShowWinningHighlightPlayer && (
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 110]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={winningPlayerFrames}
                                        autoUpdate
                                        isPlaying={true}
                                        initialFrame={0}
                                        animationSpeed={0.2}
                                        loop={true}
                                    />
                                </Container>
                            </Stage>
                        )}
                    </div>
                </div>
                <div className={Style["right-corner"]}>
                    <div className={Style["winning-effect"]}>
                        {isShowWinningHighlightBanker && (
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 108]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={winningPlayerFrames}
                                        autoUpdate
                                        isPlaying={true}
                                        initialFrame={0}
                                        animationSpeed={0.2}
                                        loop={true}
                                    />
                                </Container>
                            </Stage>
                        )}
                    </div>
                </div>
                <div className={`${Style["player"]} text-white relative`} onClick={onClickPlayer}>
                    <div className={`flex justify-between pt-5`}>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="player-coin-icon" className="icon-coin"></span>
                                <span id="player-total-stakes">{totalBets["player"]}</span>
                            </div>
                            <div className="flex items-center players gap-1">
                                <span id="player-user-icon" className="icon-user"></span>
                                <span id="player-no">{dataPlayer.players}</span>
                            </div>
                        </div>
                        <div id="player-percent" className={Style.percent}>
                            <PercentageCircle percentage={dataPlayer.percent} />
                        </div>
                    </div>
                    <div id="player-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataPlayer.betChoice}
                    </div>
                    <div id="player-odds" className="bet-odds text-center">
                        {odds["player"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span id="player-own-bet" className="bet-value">
                            10
                        </span>
                    </div>
                </div>

                <div className={`${Style["banker"]} text-white relative`} onClick={onClickBanker}>
                    <div className={`flex pt-5 justify-between`}>
                        <div id="banker-percent" className={Style.percent}>
                            <PercentageCircle percentage={dataBanker.percent} />
                        </div>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="banker-coin-icon" className="icon-coin"></span>
                                <span id="banker-total-stakes">{totalBets["banker"]}</span>
                            </div>
                            <div className="flex items-center players gap-1 justify-end">
                                <span id="banker-user-icon" className="icon-user"></span>
                                <span id="banker-no">{dataBanker.players}</span>
                            </div>
                        </div>
                    </div>
                    <div id="banker-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataBanker.betChoice}
                    </div>
                    <div id="banker-odds" className="bet-odds text-center">
                        {odds["banker"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span id="banker-own-bet" className="bet-value">
                            10
                        </span>
                    </div>
                </div>

                <div className={`${Style["tie"]} text-white flex flex-col items-center pt-2 relative`} onClick={onClickTie}>
                    {isShowWinningHighlightTie && (
                        <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                            <Container position={[105, 77]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={winningTieFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.2}
                                    loop={true}
                                />
                            </Container>
                        </Stage>
                    )}
                    <div id="tie-percent" className={Style.percent}>
                        <PercentageCircle percentage={dataTie.percent} />
                    </div>
                    <div className={Style.stake}>
                        <div className={`flex items-center ${Style["total-stakes"]} gap-1 justify-center`}>
                            <span id="tie-coin-icon" className="icon-coin"></span>
                            <span id="tie-total-stakes">{totalBets["tie"]}</span>
                        </div>
                        <div className="flex items-center players gap-1 justify-center">
                            <span id="tie-user-icon" className="icon-user"></span>
                            <span id="tie-no">{dataTie.players}</span>
                        </div>
                    </div>
                    <div id="tie-bet-name" className="bet-name text-center mt-4">
                        {dataTie.betChoice}
                    </div>
                    <div id="tie-odds" className="bet-odds text-center">
                        {odds["tie"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span id="tie-own-bet" className="bet-value">
                            10
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return <div>Loading....</div>;
};
