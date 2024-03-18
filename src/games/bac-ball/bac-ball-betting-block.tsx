import { FC, useEffect, useState } from "react";

import WinningResultEffect from "../../components/game-components/winning-result-effect";
import { BacBallBetOptionsComponent } from "./bac-ball-options";
import Style from "./bac-ball.module.scss";
import { GameBettingZoneContext, GameBettingZoneContextProps, useGameContext } from "../../_shared/react-contexts";
import { messageEventType } from "../../components/game-base/handlers";

export const BacBallBettingBlock: FC = () => {
    const { gameMessageHandler } = useGameContext();
    const defaultBettingZoneState: GameBettingZoneContextProps = {
        totalBets: { player: 0, banker: 0, tie: 0 },
        betPercentage: { banker: 0, player: 0, tie: 0 },
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

        return () => {
            gameMessageHandler.removeHandler(totalBetHandler);
            gameMessageHandler.removeHandler(betPercentageHandler);
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
