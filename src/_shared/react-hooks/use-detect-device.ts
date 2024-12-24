import { useEffect, useState } from "react";

// Using Iphone 14 pro max for default size
const MIN_HEIGHT_VIEW_PORT = 739;
const MAX_HEIGHT_VIEW_PORT = 821;
const MAX_WIDTH_VIEW_PORT = 430;

const DEFAULT_MIN_CAGE_SCALE = 0.5;
const DEFAULT_MAX_SCALE = 0.84;
const DEFAULT_RESULT_AREA_HEIGHT = 120;
const DEFAULT_RESULT_HEIGHT = 90;

const useDetectDevice = () => {
    const [resultAreaHeight, setResultAreaHeight] = useState(0);
    const [resultHeight, setResultHeight] = useState(0);
    const [cageScale, setCageScale] = useState(0);
    const [gameScale, setGameScale] = useState(1);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [offsetHeight, setOffsetHeight] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;

            setViewportHeight((prev) => {
                const offset = viewportHeight - prev;
                setOffsetHeight(offset > 0 && offset !== viewportHeight ? offset : 0);
                return viewportHeight;
            });
            setViewportWidth(viewportWidth);
        };

        handleResize();

        // Attach the resize event listener to visualViewport
        window.visualViewport?.addEventListener("resize", handleResize);

        // Cleanup listener on component unmount
        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        if (viewportWidth < MAX_WIDTH_VIEW_PORT || viewportWidth > MAX_WIDTH_VIEW_PORT) {
            setGameScale(viewportWidth / MAX_WIDTH_VIEW_PORT);
        } else {
            setGameScale(1);
        }
    }, [viewportWidth]);

    useEffect(() => {
        if (viewportHeight === MIN_HEIGHT_VIEW_PORT) {
            setCageScale(DEFAULT_MIN_CAGE_SCALE);
            setResultAreaHeight(DEFAULT_RESULT_AREA_HEIGHT);
            setResultHeight(DEFAULT_RESULT_HEIGHT);
        } else if (viewportHeight < MIN_HEIGHT_VIEW_PORT) {
            const cageScale = (viewportHeight * DEFAULT_MIN_CAGE_SCALE) / MIN_HEIGHT_VIEW_PORT;
            setCageScale(cageScale);
            setResultAreaHeight((DEFAULT_RESULT_AREA_HEIGHT * Math.min(gameScale, cageScale)) / DEFAULT_MIN_CAGE_SCALE);
            setResultHeight((DEFAULT_RESULT_HEIGHT * Math.min(gameScale, cageScale)) / DEFAULT_MIN_CAGE_SCALE);
        } else {
            const cageScale = (viewportHeight * DEFAULT_MAX_SCALE) / MAX_HEIGHT_VIEW_PORT;
            setCageScale(cageScale);
            setResultAreaHeight(DEFAULT_RESULT_AREA_HEIGHT * Math.max(gameScale, cageScale) + offsetHeight);
            setResultHeight(DEFAULT_RESULT_HEIGHT * Math.max(gameScale, cageScale) + offsetHeight);
        }
    }, [gameScale, viewportHeight]);

    return {
        resultAreaHeight: resultAreaHeight,
        resultHeight: resultHeight,
        cageScale: cageScale,
        gameScale: gameScale,
        offsetHeight: offsetHeight,
    };
};

export default useDetectDevice;
