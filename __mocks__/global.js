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
        offeredGames: [1001],
        gameSettings: {},
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
