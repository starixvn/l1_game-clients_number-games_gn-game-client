import { stub } from "jest-auto-stub";
import { Dispatch } from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import {
    PlaceBetEventAction,
    PlaceBetEventActionType,
} from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { BacBallResult } from "../../../games/bac-ball/types";
import { IRoundStateHandler } from "../../round-base/round-state-handler";
import { Round, RoundState } from "../type";
import { GameFinishHandler, GameFinishHandlerProps } from "./game-finish-handler";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { GameRoundDataHandler } from "./game-round-data-handler";
import { PlaceBetHandler } from "./place-bet-wrapper/place-bet-handler";

jest.useFakeTimers();
jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
}));

describe("GameFinishHandler", () => {
    let mockFinish: Round<BacBallResult, object>;
    let gameFinishHandler: GameFinishHandler;
    let gameMessageHandler: GameMessageHandler;
    let placeBetHandler: PlaceBetHandler;
    let roundStateHandler: IRoundStateHandler;
    let gameFinishPros: GameFinishHandlerProps;
    let gameRoundDatatHandler: GameRoundDataHandler;
    let buildGameRoundDataAfterReceiveFinishEvent: jest.Mock;
    let placeBetDispatch: Dispatch<PlaceBetEventAction>;

    beforeEach(() => {
        buildGameRoundDataAfterReceiveFinishEvent = jest.fn();
        gameFinishPros = stub<GameFinishHandlerProps>();
        gameMessageHandler = stub<GameMessageHandler>({ broadcastGameEvent: jest.fn(), register: jest.fn() });
        gameRoundDatatHandler = stub<GameRoundDataHandler>({ buildGameRoundDataAfterReceiveFinishEvent });
        placeBetHandler = stub<PlaceBetHandler>();
        roundStateHandler = stub<IRoundStateHandler>();
        gameFinishPros.dispatch = jest.fn();
        gameFinishPros.gameMessageHandler = gameMessageHandler;
        gameFinishPros.placeBetHandler = placeBetHandler;
        gameFinishPros.placeBetHandler.getPlaceBetDispatch = jest.fn().mockReturnValue(jest.fn());
        gameFinishPros.gameRoundDatatHandler = gameRoundDatatHandler;
        gameFinishPros.roundStateHandler = roundStateHandler;
        gameFinishPros.gameStateContextModel = jest.fn().mockReturnValue({ roundState: RoundState.InRound } as GameStateContextModel);

        gameFinishHandler = new GameFinishHandler(gameFinishPros);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("Handle finish", () => {
        beforeEach(() => {
            mockFinish = {
                result: {
                    player: 5,
                    banker: 1,
                    drawId: 37973,
                    time: "2024-03-22T09:19:50.035Z",
                },
                settlementResult: {
                    player: true,
                    banker: false,
                    tie: false,
                    drawId: 37973,
                },
                roundId: 9494,
                drawId: 37973,
            };

            gameFinishHandler.handleRoundHistory = jest.fn();
        });

        it("should handle finish correctly", () => {
            // Arrange
            gameFinishHandler.betWin = 4;

            const { result, drawId, settlementResult, roundId } = mockFinish;

            const roundData = {
                bankerBalls: [result.banker],
                playerBalls: [result.player],
                drawId,
            };

            buildGameRoundDataAfterReceiveFinishEvent.mockReturnValue(roundData);
            // Act
            gameFinishHandler.handleFinish({ finish: mockFinish });

            // Assert
            expect(gameFinishPros.placeBetHandler.getPlaceBetDispatch()).toHaveBeenCalledWith({
                type: PlaceBetEventActionType.END_BET_PROCESSING,
                payload: {},
            });
            expect(gameFinishPros.dispatch).toHaveBeenCalledWith({
                type: GameEventActionType.FINISH,
                payload: {
                    playResultAnimation: true,
                    result: result,
                    settlementResult: settlementResult,
                    roundId: roundId,
                    drawId: drawId,
                    roundData,
                },
            });

            jest.advanceTimersByTime(0);

            expect(gameFinishPros.gameMessageHandler.broadcastGameEvent).toHaveBeenCalledTimes(1);
            expect(gameFinishPros.gameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.UPDATE_PLAYER_BALANCE]: true,
            });
        });
    });

    describe("Handle status", () => {
        it("should handle status correctly when win is true", () => {
            // Arrange
            const mockStatus = {
                win: true,
                bet: 100,
            };

            // Act
            gameFinishHandler.handleStatus({ status: mockStatus });

            // Assert
            expect(gameFinishPros.dispatch).toHaveBeenCalledTimes(1);
            expect(gameFinishPros.dispatch).toHaveBeenCalledWith({
                type: "WIN_STATUS",
                payload: { status: mockStatus },
            });
            expect(gameFinishHandler["_betWin"]).toEqual(mockStatus.bet);
        });

        it("should handle status correctly when win is false", () => {
            // Arrange
            const mockStatus = {
                win: false,
                bet: 100,
            };

            // Act
            gameFinishHandler.handleStatus({ status: mockStatus });

            // Assert
            expect(gameFinishPros.dispatch).not.toHaveBeenCalled();
            expect(gameFinishHandler["_betWin"]).toEqual(0);
        });
    });
});
