import { FC, PropsWithChildren, useEffect, useState } from "react";
import { GameBettingZoneContext, GameBettingZoneContextProps, useGameContext } from "../../../_shared/react-contexts";
import { messageEventType } from "../../game-base/handlers";

const BettingBlock: FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
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

    const bettingZoneContext = <GameBettingZoneContext.Provider value={bettingZoneState}>{children} </GameBettingZoneContext.Provider>;

    return bettingZoneContext;
};

export default BettingBlock;
