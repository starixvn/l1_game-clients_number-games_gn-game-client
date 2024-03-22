import { stub } from "jest-auto-stub";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { IRoundStateHandler } from "../../round-base/round-state-handler";
import { Round } from "../type";
import { GameFinishHandler, GameFinishHandlerProps } from "./game-finish-handler";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { PlaceBetHandler } from "./place-bet-handler";

jest.useFakeTimers();

describe("GameFinishHandler", () => {
    let mockFinish: Round<object, object>;
    let gameFinishHandler: GameFinishHandler;
    let gameMessageHandler: GameMessageHandler;
    let placeBetHandler: PlaceBetHandler;
    let roundStateHandler: IRoundStateHandler;
    let gameFinishPros: GameFinishHandlerProps;

    beforeEach(() => {
        gameFinishPros = stub<GameFinishHandlerProps>();
        gameMessageHandler = stub<GameMessageHandler>({ broadcastGameEvent: jest.fn(), register: jest.fn() });
        placeBetHandler = stub<PlaceBetHandler>();
        roundStateHandler = stub<IRoundStateHandler>();
        gameFinishPros.dispatch = jest.fn();
        gameFinishPros.gameMessageHandler = gameMessageHandler;
        gameFinishPros.placeBetHandler = placeBetHandler;
        gameFinishPros.roundStateHandler = roundStateHandler;
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

            // Act
            gameFinishHandler.handleFinish({ finish: mockFinish });

            // Assert
            expect(gameFinishPros.dispatch).toHaveBeenCalledTimes(2);
            expect(gameFinishPros.dispatch).toHaveBeenCalledWith({
                type: GameEventActionType.END_BET_PROCESSING,
                payload: {},
            });
            expect(gameFinishPros.dispatch).toHaveBeenCalledWith({
                type: GameEventActionType.FINISH,
                payload: {
                    playResultAnimation: true,
                    result: mockFinish.result,
                    settlementResult: mockFinish.settlementResult,
                    roundId: mockFinish.roundId,
                    drawId: mockFinish.drawId,
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
