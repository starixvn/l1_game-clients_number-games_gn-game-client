import React from "react";

const hasChildren = (node) => node && (node.children || (node.props && node.props.children));

const getChildren = (node) => (node && node.children ? node.children : node.props && node.props.children);
const renderNodes = (reactNodes) => {
    if (typeof reactNodes === "string") {
        return reactNodes;
    }

    return Object.keys(reactNodes).map((key, i) => {
        const child = reactNodes[key];
        const isElement = React.isValidElement(child);

        if (typeof child === "string") {
            return child;
        }
        if (hasChildren(child)) {
            const inner = renderNodes(getChildren(child));
            return React.cloneElement(child, { ...child.props, key: i }, inner);
        }
        if (typeof child === "object" && !isElement) {
            return Object.keys(child).reduce((str, childKey) => `${str}${child[childKey]}`, "");
        }

        return child;
    });
};

jest.mock("next-i18next", () => ({
    useTranslation: () => {
        return {
            t: (str) => str,
            i18n: {
                t: (str) => str,
                changeLanguage: () => new Promise(() => {}),
            },
        };
    },
    withTranslation: () => (Componenti18n) => {
        Componenti18n.defaultProps = { ...Componenti18n.defaultProps, t: () => "" };
        return Componenti18n;
    },
    Trans: ({ children }) => {
        return Array.isArray(children) ? renderNodes(children) : renderNodes([children]);
    },
}));

jest.mock("next/config", () => () => ({
    publicRuntimeConfig: {
        proxy: {
            ssl: false,
            uri: "localhost",
            path: "",
        },
        offeredGames: [22, 2, 9, 1, 4, 8, 24, 3, 7, 27, 10, 35, 36, 37],
        gameSettings: {
            1: {
                id: 1,
                gameName: "BigSmall",
                socketInfo: {
                    namespace: "bigsmall",
                    path: "bigsmall",
                },
                durations: {
                    wholeRound: 62,
                    placingBets: 50,
                    lockingBet: 5,
                    showResult: 6,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                    balancingBet: 3,
                },
            },
            2: {
                id: 2,
                gameName: "SeDie",
                socketInfo: {
                    namespace: "sedie",
                    path: "sedie",
                },
                durations: {
                    wholeRound: 40,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 7,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                },
            },
            3: {
                id: 3,
                gameName: "FishPrawnCrab",
                socketInfo: {
                    namespace: "fishprawncrab",
                    path: "fishprawncrab",
                },
                durations: {
                    wholeRound: 41,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 10,
                    resultAnimation: 2,
                    beforeStartRound: 0,
                },
            },
            4: {
                id: 4,
                gameName: "TXTurbo",
                socketInfo: {
                    namespace: "txturbo",
                    path: "turbobigsmall",
                },
                durations: {
                    wholeRound: 38,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 3,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                    balancingBet: 2,
                },
            },
            7: {
                id: 7,
                gameName: "DragonTiger",
                socketInfo: {
                    namespace: "dragontiger",
                    path: "dragontiger",
                },
                durations: {
                    wholeRound: 37,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 6,
                    resultAnimation: 2,
                    beforeStartRound: 0,
                },
            },
            8: {
                id: 8,
                gameName: "KenoProMax",
                socketInfo: {
                    namespace: "kenopromax",
                    path: "kenopromax",
                },
                durations: {
                    wholeRound: 40,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 9,
                    resultAnimation: 4,
                    beforeStartRound: 0,
                },
            },
            9: {
                id: 9,
                gameName: "MiniSeDie",
                socketInfo: {
                    namespace: "minisedie",
                    path: "minisedie",
                },
                durations: {
                    wholeRound: 38,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 5,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                },
            },
            10: {
                id: 10,
                gameName: "Baccarat",
                socketInfo: {
                    namespace: "baccarat",
                    path: "baccarat",
                },
                durations: {
                    wholeRound: 46,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 15,
                    resultAnimation: 4,
                    beforeStartRound: 0,
                },
            },
            22: {
                id: 22,
                gameName: "VipSeDie",
                socketInfo: {
                    namespace: "vipsedie",
                    path: "vsedie",
                },
                durations: {
                    wholeRound: 40,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 7,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                },
            },
            24: {
                id: 24,
                gameName: "SpecialSeDie",
                socketInfo: {
                    namespace: "specialsedie",
                    path: "specialsedie",
                },
                durations: {
                    wholeRound: 40,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 5,
                    resultAnimation: 2,
                    beforeStartRound: 2,
                    balancingBet: 2,
                },
            },
            27: {
                id: 27,
                gameName: "VipBaccarat",
                socketInfo: {
                    namespace: "vipbaccarat",
                    path: "vipbaccarat",
                },
                durations: {
                    wholeRound: 46,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 15,
                    resultAnimation: 4,
                    beforeStartRound: 0,
                },
            },
            35: {
                id: 35,
                gameName: "ThreeCards",
                socketInfo: {
                    namespace: "threecards",
                    path: "threecards",
                },
                durations: {
                    wholeRound: 40,
                    placingBets: 30,
                    lockingBet: 5,
                    showResult: 9,
                    resultAnimation: 3,
                    beforeStartRound: 0,
                },
            },
            36: {
                id: 36,
                gameName: "KenoMatch1",
                socketInfo: {
                    namespace: "kenomatch1",
                    path: "kenomatch",
                },
                supportMD5: false,
                durations: {
                    wholeRound: 62,
                    showFullTimeSettlementResult: 58,
                    highLightFullTime: 55,

                    halfTimePlacingBets: 54,
                    resetResult: 35,
                    halfTimeLockingBet: 32,
                    showHalfTimeResult: 27,
                    showHalfTimeSettlementResult: 23,
                    highLightFirstHalf: 20,

                    beforeStartFullTimePlacingBet: 19,
                    fullTimePlacingBets: 18,
                    fullTimeLockingBet: 4,
                    showFullTimeResult: 0,

                    halfTimeDuration: 27,
                    fullTimeDuration: 18,
                    resultAnimation: 3,
                },
            },
            37: {
                id: 37,
                gameName: "KenoMatch2",
                socketInfo: {
                    namespace: "kenomatch2",
                    path: "kenomatch",
                },
                supportMD5: true,
                durations: {
                    wholeRound: 70,
                    showFullTimeSettlementResult: 66,
                    highLightFullTime: 59,

                    halfTimePlacingBets: 58,
                    resetResult: 39,
                    halfTimeLockingBet: 36,
                    showHalfTimeResult: 31,
                    showHalfTimeSettlementResult: 27,
                    highLightFirstHalf: 20,

                    beforeStartFullTimePlacingBet: 19,
                    fullTimePlacingBets: 18,
                    fullTimeLockingBet: 4,
                    showFullTimeResult: 0,

                    halfTimeDuration: 27,
                    fullTimeDuration: 18,
                    resultAnimation: 3,
                },
            },
        },
        guideUrl: "https://l1-guide.lumigame.com",
        appType: 1,
        system: "L1",
    },
}));

const localStorageMock = (() => {
    return {
        getItem: () => "{}",
        setItem: () => {},
        clear: () => {},
        removeItem: () => {},
    };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });
