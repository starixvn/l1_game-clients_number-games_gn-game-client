import React, { useEffect, useState } from "react";

import { OddNames, ResultBet } from "..";

import { Result, SettlementResult } from "./../fish-prawn-crab";
import Styles from "./bet-options.module.scss";
import { GameConfigs, GameState } from "../../../components/shared/game-base/type";
import BetOption from "../../../components/shared/bet-option";
import { useGameContext } from "../../../contexts/game-context/game-context";

const Choices = ["stag", "gourd", "rooster", "fish", "crab", "prawn"];

const IconMapper = {
    stag: "nai",
    gourd: "bau",
    rooster: "ga",
    fish: "ca",
    crab: "cua",
    prawn: "tom",
};

type Props = {
    settlementResult: SettlementResult;
    gameState: GameState;
    result: Result;
    isShowWinningEffect: boolean;
};

const renderHighLightNumber = (choice: string, countsAppearDice: object) => {
    let classCount = "";
    Object.keys(countsAppearDice).forEach((number) => {
        if (+ResultBet[choice] === +number) {
            if (+countsAppearDice[number] === 2) {
                classCount = "x2";
                return;
            }

            if (+countsAppearDice[number] === 3) {
                classCount = "x3";
                return;
            }
        }
    });

    return classCount;
};

const getClassPrevRound = (gameState: GameState) => {
    switch (gameState) {
        case GameState.BeforeStartRound:
        case GameState.InRound:
            return "prev-round";
        default:
            return "";
    }
};

const renderBetOptionByChoice = (
    choice: string,
    gameState: GameState,
    settlementResult: SettlementResult,
    countsAppearDice: object,
    isShowWinningEffect: boolean,
    gameConfigs: GameConfigs,
    isShowCountOfDice: boolean
) => {
    const { odds } = gameConfigs;
    const isHighLight = gameState !== GameState.LockingBet && settlementResult[choice];
    const classCount = renderHighLightNumber(choice, countsAppearDice);

    return (
        <BetOption
            choice={choice}
            odd={odds[OddNames.single]}
            isDisplayOdd={false}
            isHighlight={isHighLight}
            gameState={gameState}
            isShowWinningEffect={isShowWinningEffect}
        >
            <div className={`${Styles["symbol-size"]}`}>
                <img src={`/static/images/fpc-${IconMapper[choice]}.svg`} className="img-fluid" width="70" height="70" alt="symbol" />
            </div>
            {isShowCountOfDice && classCount !== "" && (
                <div className={`${Styles["highlight-result-label"]} ${Styles[getClassPrevRound(gameState)]} ${Styles[classCount]}`}></div>
            )}
        </BetOption>
    );
};

const FishPrawnCrabBetOptions: React.FunctionComponent<Props> = (props) => {
    const { gameState, settlementResult, result, isShowWinningEffect } = props;
    const countsAppearDice = {};
    const { gameConfigs, gameSetting } = useGameContext();

    if (result) {
        Object.values(result).forEach((value) => {
            countsAppearDice[value] = (countsAppearDice[value] || 0) + 1;
        });
    }

    const [isShowCountOfDice, setIsShowCountOfDice] = useState<boolean>(false);

    useEffect(() => {
        let displayResultTimeOut = null;
        const actionByGameState = {
            [GameState.LockingBet]: () => {
                setIsShowCountOfDice(false);
            },
            [GameState.DisplayResult]: () => {
                displayResultTimeOut = setTimeout(() => setIsShowCountOfDice(true), gameSetting.durations.resultAnimation * 1000);
            },
            [GameState.InRound]: () => {
                setIsShowCountOfDice(true);
            },
            [GameState.BeforeStartRound]: () => {
                setIsShowCountOfDice(true);
            },
        };
        actionByGameState[gameState] && actionByGameState[gameState]();

        return () => displayResultTimeOut && clearTimeout(displayResultTimeOut);
    }, [gameState]);

    return (
        <div className={`${Styles["layout-FPC"]}`}>
            {Choices.map((choice, index) => (
                <div key={index}>
                    {renderBetOptionByChoice(
                        choice,
                        gameState,
                        settlementResult,
                        countsAppearDice,
                        isShowWinningEffect,
                        gameConfigs,
                        isShowCountOfDice
                    )}
                </div>
            ))}
        </div>
    );
};

export default FishPrawnCrabBetOptions;
