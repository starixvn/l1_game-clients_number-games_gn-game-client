import { stub } from "jest-auto-stub";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameConfigs, IUserStakeLevel, RoundState } from "../type";
import { GameMessageHandler } from "./game-message-handler";
import { PlaceBetHandler, PlaceBetHandlerProps } from "./place-bet-handler";

describe("placeBet", () => {
    let placeBetHandler: PlaceBetHandler;
    let gameMessageHandler: GameMessageHandler;
    let gameStateContextModel: GameStateContextModel;
    let systemContextModel: SystemContextModel;
    let placeBetHandlerProps: PlaceBetHandlerProps;
    let gameConfigs: GameConfigs;
    let userStakeLevel: IUserStakeLevel;

    beforeEach(() => {
        jest.clearAllMocks();

        systemContextModel = stub<SystemContextModel>();
        gameMessageHandler = stub<GameMessageHandler>();
        gameConfigs = stub<GameConfigs>();
        userStakeLevel = stub<IUserStakeLevel>();
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
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.LockingBet });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).toHaveBeenCalled();
        });

        it("should return if in phase prevent bet - enabled QuickBet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.LockingBet });
            const handlePreventBetSpy = jest.spyOn(placeBetHandler, "handlePreventBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(handlePreventBetSpy).toHaveBeenCalled();
        });

        it("Not return if in phase not prevent bet", () => {
            // Arrange
            gameStateContextModel = stub<GameStateContextModel>({ roundState: RoundState.InRound });
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
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).toHaveBeenCalled();
        });

        it("calls handleProcessingBet when isProcessingBet is true - enabled QuickBet", () => {
            // Arrange
            const gameStateContext = { isProcessingBet: true, roundState: RoundState.InRound };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const handleProcessingBetSpy = jest.spyOn(placeBetHandler, "handleProcessingBet");

            // Act
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(handleProcessingBetSpy).toHaveBeenCalled();
        });

        it("does not call handleProcessingBet when isProcessingBet is false", () => {
            // Arrange

            const gameStateContext = { isProcessingBet: false, roundState: RoundState.InRound, gameConfigs };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                gameConfigs,
                notConfirmOwnBets: {},
                ownBets: {},
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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

        it("returns true when available balance is zero and message: not_enough_money -  enabled QuickBet", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(0);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                gameConfigs,
                notConfirmOwnBets: {},
                ownBets: {},
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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
            placeBetHandler.placeBet("betChoice", 100, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns true when amount is greater than zero and available balance `subtract` total bet amount is zero and show message: not_enough_money", () => {
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

            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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

        it("returns true when amount is greater than zero and available balance `subtract` total bet amount is zero and show message: not_enough_money - enable QuickBet", () => {
            // Arrange
            const availableBalance = 0;
            const amount = 100;

            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);

            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: { bet1: 50, bet2: 30 },
                ownBets: { bet3: 20 },
            };

            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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
            placeBetHandler.placeBet("betChoice", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("returns false when neither condition is true", () => {
            // Arrange
            const availableBalance = 100;
            const amount = 50;
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(availableBalance);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: { bet1: 10, bet2: 20 },
                ownBets: { bet3: 20 },
                gameConfigs,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
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

    describe("handleBetValidation function", () => {
        let gameConfigMock: GameConfigs;
        let userStakeLevelMock: IUserStakeLevel;
        beforeEach(() => {
            jest.clearAllMocks();
            jest.mock("../../../_shared/helpers/validate-bet-helper", () => ({
                isInPhasePreventBet: jest.fn(() => false),
                isBalanceUnavailable: jest.fn(() => false),
                isHedgeBet: jest.fn(() => false),
            }));

            gameConfigMock = {
                minBet: 1,
                maxBet: 200,
                maxBetPerChoices: {
                    player: 200,
                    banker: 200,
                    tie: 100,
                },
                chips: [],
                enableFreeBet: false,
                margin: 0.1,
                odds: {},
            };

            userStakeLevelMock = {
                minBet: 1,
                maxBet: 200,
            };

            gameConfigs = stub<GameConfigs>(gameConfigMock);
            userStakeLevel = stub<IUserStakeLevel>(userStakeLevelMock);
        });

        it("call sendNotice with maxBet Round", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 200 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_round_maxbet",
                duration: 2,
                errorCode: "SB1911",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 200,
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call sendNotice with maxBet Round - Enabled QuickBet", () => {
            // Arrange
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 200 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_round_maxbet",
                duration: 2,
                errorCode: "SB1911",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 200,
            };

            // Act
            placeBetHandler.placeBet("player", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call sendNotice with maxBet PerChoice", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 150 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call sendNotice with maxBet PerChoice -  Enabled QuickBet", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 150 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
            };

            // Act
            placeBetHandler.placeBet("player", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("Not call sendNotice with maxBet PerChoice when maxBetPerChoice equal total-amount on current Choice", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(300);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 1;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 149 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_option_maxbet",
                duration: 2,
                errorCode: "SB1910",
                betChoice1: undefined,
                betChoice2: undefined,
                maxBet: 150,
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).not.toHaveBeenCalledWith(notice);
        });

        it("call sendNotice with min-bet choice", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigMock.minBet = 5;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(3);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 5;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 100 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_min_bet_notice",
                duration: 2,
                errorCode: "SB1909",
                betChoice1: undefined,
                betChoice2: undefined,
                minBet: 5,
            };

            // Act
            placeBetHandler.placeBet("player", amount, false, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        it("call sendNotice with min-bet choice - Enabled QuickBet", () => {
            // Arrange
            gameConfigMock.maxBetPerChoices.player = 150;
            gameConfigMock.minBet = 5;
            gameConfigs = stub<GameConfigs>(gameConfigMock);
            placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(3);
            placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
            const amount = 5;
            const gameStateContext = {
                isProcessingBet: false,
                roundState: RoundState.InRound,
                notConfirmOwnBets: {},
                ownBets: { player: 100 },
                gameConfigs,
                userStakeLevel,
            };
            gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
            const sendNoticeSpy = jest.spyOn(placeBetHandler, "sendNotice");
            const notice = {
                gameName: "test",
                message: "Common.message_min_bet_notice",
                duration: 2,
                errorCode: "SB1909",
                betChoice1: undefined,
                betChoice2: undefined,
                minBet: 5,
            };

            // Act
            placeBetHandler.placeBet("player", amount, true, gameStateContextModel, systemContextModel);

            // Assert
            expect(sendNoticeSpy).toHaveBeenCalledWith(notice);
        });

        describe("Suggest bet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;

            beforeEach(() => {
                betChoice = "player";
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    isProcessingBet: false,
                    roundState: RoundState.InRound,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                    gameConfigs,
                    userStakeLevel,
                };

                amount = 100;
            });

            it("call suggest-bet with case InsufficientFunds", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(50);
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: true,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
            });

            it("call suggest-bet with case InsufficientFunds - Enabled QuickBet", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(50);
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: true,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
            });

            it("call suggest-bet with case max-bet choice", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandlerProps.dispatch).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice - Enabled QuickBet", () => {
                // Arrange
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandlerProps.dispatch).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice and max-bet round", () => {
                // Arrange
                gameConfigMock.maxBet = 140;
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    isProcessingBet: false,
                    roundState: RoundState.InRound,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 40,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandlerProps.dispatch).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("call suggest-bet with case max-bet choice and max-bet round -  Enabled QuickBet", () => {
                // Arrange
                gameConfigMock.maxBet = 140;
                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                gameStateContext = {
                    isProcessingBet: false,
                    roundState: RoundState.InRound,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                    gameConfigs,
                    userStakeLevel,
                };

                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const availableSuggestBet = {
                    suggestAmount: 40,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, true, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(placeBetHandlerProps.dispatch).toHaveBeenCalledTimes(2);
                expect(showConfirmDialogSpy).toHaveBeenCalled();
            });

            it("Not call suggest-bet with normal case", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const suggestBetSpy = jest.spyOn(placeBetHandler, "suggestBetAmount");
                const showConfirmDialogSpy = jest.spyOn(placeBetHandler, "showConfirmDialog");
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const availableSuggestBet = {
                    suggestAmount: 50,
                    isInsufficientFunds: false,
                    isSuggestBet: true,
                    mode: "SuggestBet",
                };

                // Act
                placeBetHandler.placeBet(betChoice, amount, false, gameStateContextModel, systemContextModel);

                // Assert
                expect(suggestBetSpy).not.toHaveBeenCalledWith(betChoice, availableSuggestBet);
                expect(showConfirmDialogSpy).not.toHaveBeenCalled();
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
            });
        });

        describe("Enabled QuickBet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;
            let enabledQuickBet: boolean;

            beforeEach(() => {
                betChoice = "player";
                gameStateContext = {
                    isProcessingBet: false,
                    roundState: RoundState.InRound,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                    gameConfigs,
                    userStakeLevel,
                };

                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                enabledQuickBet = true;
            });

            it("Valid bet", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const handleEnabledQuickBetSpy = jest.spyOn(placeBetHandler, "handleEnabledQuickBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
                expect(handleEnabledQuickBetSpy).toHaveBeenCalledWith(amount, betChoice);
            });

            it("Invalid bet: amount > player-balance", () => {
                // Arrange
                amount = 300;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const handleEnabledQuickBetSpy = jest.spyOn(placeBetHandler, "handleEnabledQuickBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(handleEnabledQuickBetSpy).not.toHaveBeenCalledWith(amount, betChoice);
            });
        });

        describe("Disable QuickBet function", () => {
            let gameStateContext: any;
            let betChoice: string;
            let amount: number;
            let enabledQuickBet: boolean;

            beforeEach(() => {
                betChoice = "player";
                gameStateContext = {
                    isProcessingBet: false,
                    roundState: RoundState.InRound,
                    notConfirmOwnBets: {},
                    ownBets: { player: 100 },
                    gameConfigs,
                    userStakeLevel,
                };

                gameConfigMock.maxBetPerChoices.player = 150;
                gameConfigMock.minBet = 5;
                gameConfigs = stub<GameConfigs>(gameConfigMock);
                enabledQuickBet = false;
            });

            it("Valid bet", () => {
                // Arrange
                amount = 50;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const showConfirmBetSpy = jest.spyOn(placeBetHandler, "showConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).toHaveBeenCalled();
                expect(showConfirmBetSpy).toHaveBeenCalled();
            });

            it('Valid bet with betChoice =  "confirmBet"', () => {
                // Arrange
                amount = 50;
                betChoice = "confirmBet";
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const sendConfirmBetSpy = jest.spyOn(placeBetHandler, "sendConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(sendConfirmBetSpy).toHaveBeenCalled();
            });

            it("Invalid bet: amount > player-balance", () => {
                // Arrange
                amount = 300;
                placeBetHandlerProps.getPlayerBalance = jest.fn().mockReturnValue(200);
                placeBetHandler.sendOutstandingBet = jest.fn();
                placeBetHandler = new PlaceBetHandler(placeBetHandlerProps);
                gameStateContextModel = stub<GameStateContextModel>(gameStateContext);
                const updateNotConfirmedBetStateSpy = jest.spyOn(placeBetHandler, "updateNotConfirmedBetState");
                const sendConfirmBetSpy = jest.spyOn(placeBetHandler, "sendConfirmBet");

                // Act
                placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, gameStateContextModel, systemContextModel);

                // Assert
                expect(updateNotConfirmedBetStateSpy).not.toHaveBeenCalled();
                expect(sendConfirmBetSpy).not.toHaveBeenCalled();
            });
        });
    });
});
