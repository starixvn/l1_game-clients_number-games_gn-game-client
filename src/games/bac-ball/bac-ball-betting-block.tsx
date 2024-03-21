import { FC, useEffect, useState } from "react";

import { GameBettingZoneContext, GameBettingZoneContextProps, useGameContext } from "../../_shared/react-contexts";
import { messageEventType } from "../../components/game-base/handlers";
import WinningResultEffect from "../../components/game-components/winning-result-effect";
import { BacBallBetOptionsComponent } from "./bac-ball-options";
import Style from "./bac-ball.module.scss";

export const BacBallBettingBlock: FC = () => {
    const { gameMessageHandler } = useGameContext();
    const defaultBettingZoneState: GameBettingZoneContextProps = {
        totalBets: { player: 0, banker: 0, tie: 0 },
        betPercentage: { banker: 0, player: 0, tie: 0 },
        playerBetCount: { banker: 0, player: 0, tie: 0 },
    };
    const [bettingZoneState, setBettingZoneState] = useState(defaultBettingZoneState);

    useEffect(() => {
        const totalBetHandler = gameMessageHandler.register(messageEventType.TOTAL_BETS, ({ totalBets }) => {
            setBettingZoneState((bettingZoneState) => {
                return {
                    ...bettingZoneState,
                    totalBets,
                };
            });
        });

        const betPercentageHandler = gameMessageHandler.register(messageEventType.BET_PERCENTAGE, ({ betPercentage }) => {
            setBettingZoneState((bettingZoneState) => {
                return {
                    ...bettingZoneState,
                    betPercentage,
                };
            });
        });

        const playerBetCountHandler = gameMessageHandler.register(messageEventType.PLAYER_BET_COUNT, ({ playerBetCount }) => {
            setBettingZoneState((bettingZoneState) => {
                return {
                    ...bettingZoneState,
                    playerBetCount,
                };
            });
        });

        return () => {
            gameMessageHandler.removeHandler(totalBetHandler);
            gameMessageHandler.removeHandler(betPercentageHandler);
            gameMessageHandler.removeHandler(playerBetCountHandler);
        };
    }, [gameMessageHandler, bettingZoneState]);

    const bettingZoneContext = (
        <GameBettingZoneContext.Provider value={bettingZoneState}>
            <div className={`${Style["betting-zone"]}`}>
                <BacBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </GameBettingZoneContext.Provider>
    );

    return bettingZoneContext;
};
