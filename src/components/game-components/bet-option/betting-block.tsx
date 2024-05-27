import { FC, PropsWithChildren, useEffect, useState } from "react";
import { GameBettingZoneContext, GameBettingZoneContextProps, useGameContext } from "../../../_shared/react-contexts";
import { messageEventType } from "../../game-base/handlers";

const BettingBlock: FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
    const { gameMessageHandler } = useGameContext();

    const [bettingZoneState, setBettingZoneState] = useState<GameBettingZoneContextProps>({
        totalBets: {},
        betPercentage: {},
        playerBetCount: {},
    });

    useEffect(() => {
        const handleTotalBets = ({ totalBets }) => {
            setBettingZoneState((prevState) => ({ ...prevState, totalBets }));
        };

        const handleBetPercentage = ({ betPercentage }) => {
            setBettingZoneState((prevState) => ({ ...prevState, betPercentage }));
        };

        const handlePlayerBetCount = ({ playerBetCount }) => {
            setBettingZoneState((prevState) => ({ ...prevState, playerBetCount }));
        };

        const handleAcceptedBets = ({ endBet }) => {
            endBet > 0 && setBettingZoneState((prevState) => ({ ...prevState, acceptedBets: endBet }));
        };

        const totalBetHandler = gameMessageHandler.register(messageEventType.TOTAL_BETS, handleTotalBets);
        const betPercentageHandler = gameMessageHandler.register(messageEventType.BET_PERCENTAGE, handleBetPercentage);
        const playerBetCountHandler = gameMessageHandler.register(messageEventType.PLAYER_BET_COUNT, handlePlayerBetCount);
        const acceptedBetsHandler = gameMessageHandler.register(messageEventType.END_BET, handleAcceptedBets);

        return () => {
            gameMessageHandler.removeHandler(totalBetHandler);
            gameMessageHandler.removeHandler(betPercentageHandler);
            gameMessageHandler.removeHandler(playerBetCountHandler);
            gameMessageHandler.removeHandler(acceptedBetsHandler);
        };
    }, [gameMessageHandler, bettingZoneState]);

    return <GameBettingZoneContext.Provider value={bettingZoneState}>{children}</GameBettingZoneContext.Provider>;
};

export default BettingBlock;
