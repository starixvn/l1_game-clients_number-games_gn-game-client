import { stub } from "jest-auto-stub";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameConfigs, RoundState } from "../type";
import { GameMessageHandler } from "./game-message-handler";
import { PlaceBetHandler, PlaceBetHandlerProps } from "./place-bet-handler";

describe("placeBet", () => {
    let placeBetHandler: PlaceBetHandler;
    let gameMessageHandler: GameMessageHandler;
    let gameStateContextModel: GameStateContextModel<any, any>;
    let systemContextModel: SystemContextModel;
    let placeBetHandlerProps: PlaceBetHandlerProps;
    let gameConfigs: GameConfigs;

    beforeEach(() => {
        jest.clearAllMocks();

        systemContextModel = stub<SystemContextModel>();
        gameMessageHandler = stub<GameMessageHandler>();

        placeBetHandlerProps = {
            gameName: "test",
            dispatch: jest.fn(),
            gameMessageHandler,
            translate: jest.fn(),
            playPlaceBetSound: jest.fn(),
            hedgeBetGroups: [["player", "banker"]],
            getPlayerBalance: jest.fn(),
        };

        placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
    });
    describe("isInPhasePreventBet", () => {
        it("should return if in phase prevent bet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel<any, any>>({ roundState: RoundState.LockingBet });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).toHaveBeenCalled();
        });

        it("Not return if in phase not prevent bet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel<any, any>>({ roundState: RoundState.InRound });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).not.toHaveBeenCalled();
        });
    });

    describe("handleProcessingBet method", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("calls handleProcessingBet when isProcessingBet is true", () => {
            // Arrange
            const gameStateContext = { isProcessingBet: true, roundState: RoundState.InRound };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).toHaveBeenCalled();
        });

        it("does not call handleProcessingBet when isProcessingBet is false", () => {
            // Arrange
            const gameStateContext = { isProcessingBet: false, roundState: RoundState.InRound };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).not.toHaveBeenCalled();
        });
    });

    describe("isBalanceUnavailable function", () => {
        it("returns true when available balance is zero and message: not_enough_money", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(0);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);

            const gameStateContext = { isProcessingBet: false, roundState: RoundState.InRound };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
            };

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns true when amount is greater than zero and available balance - total bet amount is zero and show message: not_enough_money", () => {
            // Arrange
            const availableBalance = 100;
            const amount = 100;

            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);

            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: { bet1: 50, bet2: 30 },
                ownBets: { bet3: 20 },
            };

            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.not_enough_money",
                duration: 2,
                errorCode: "SB1907",
                betChoice1: "",
                betChoice2: "",
            };

            // Act
            placeBetHandler.placeBet("betChoice", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns false when neither condition is true", () => {
            // Arrange
            const availableBalance = 100;
            const amount = 50;
            gameConfigs = stub<GameConfigs>();
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: { bet1: 10, bet2: 20 },
                ownBets: { bet3: 20 },
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");

            // Act
            placeBetHandler.placeBet("betChoice", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).not.toHaveBeenCalled();
        });
    });

    describe("isHedgeBet function", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("calls sendNotice with correct notice when isHedgeBet is true", () => {
            // Arrange
            jest.mock("../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
            }));

            placeBetHandlerProps.hedgeBetGroups = [["choice1", "choice2"]];
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 100;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { choice2: 20 },
            };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_hedge_bet",
                duration: 2,
                errorCode: "SB1939",
                betChoice1: undefined,
                betChoice2: undefined,
            };

            // Act
            placeBetHandler.placeBet("choice1", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("does not call sendNotice when ownBets empty and isHedgeBet is false", () => {
            // Arrange
            jest.mock("../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
            }));
            gameConfigs = stub<GameConfigs>();

            placeBetHandlerProps.hedgeBetGroups = [["choice1", "choice2"]];
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 100;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: {},
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel<any, any>>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_hedge_bet",
                duration: 2,
                errorCode: "SB1939",
                betChoice1: undefined,
                betChoice2: undefined,
            };

            // Act
            placeBetHandler.placeBet("choice1", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).not.toHaveBeenCalledWith(notice);
        });
    });
});
