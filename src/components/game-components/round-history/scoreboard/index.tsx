import React, { useEffect, useRef, useState } from "react";

import Styles from "./round-history.module.scss";

type Props = {
    children: React.ReactNode;
    activeScoreboardTab: number;
};

let activeTabCurrent = 0;

const ScoreboardRoundHistory = (props: Props) => {
    const { activeScoreboardTab } = props;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isScrollEndRight, setIsScrollEndRight] = useState(true);
    let scrollLeftWidth = 0;

    const handleTouchEnd = (e) => {
        updateScrollEndRight(e);
    };

    const updateScrollEndRight = (e) => {
        setIsScrollEndRight(e.target.scrollLeft === scrollLeftWidth);
    };

    useEffect(() => {
        const wrapperRefCurrent = wrapperRef?.current;
        let mouseDown = false;
        let startX: number, scrollLeft: number;

        const startDragging = (e) => {
            mouseDown = true;
            startX = e.pageX - e.target.offsetLeft;
            scrollLeft = e.target.scrollLeft;
        };

        const stopDragging = (e) => {
            mouseDown = false;
            updateScrollEndRight(e);
        };

        const handleDragging = (e) => {
            e.preventDefault();

            if (mouseDown) {
                const x: number = e.pageX - e.target.offsetLeft;
                const scroll: number = x - startX;
                e.target.scrollLeft = scrollLeft - scroll;
            }
        };

        if (wrapperRef.current) {
            wrapperRef.current.addEventListener("mousedown", startDragging);
            wrapperRef.current.addEventListener("mouseup", stopDragging);
            wrapperRef.current.addEventListener("mouseleave", stopDragging);
            wrapperRef.current.addEventListener("mousemove", handleDragging);
        }

        return () => {
            if (wrapperRefCurrent) {
                wrapperRefCurrent.removeEventListener("mousedown", startDragging);
                wrapperRefCurrent.removeEventListener("mouseup", stopDragging);
                wrapperRefCurrent.removeEventListener("mouseleave", stopDragging);
                wrapperRefCurrent.removeEventListener("mousemove", handleDragging);
            }
        };
    }, []);

    useEffect(() => {
        if (activeTabCurrent !== activeScoreboardTab) {
            activeTabCurrent = activeScoreboardTab;
            setIsScrollEndRight(true);
        }
    }, [activeScoreboardTab]);

    useEffect(() => {
        if (isScrollEndRight && wrapperRef?.current?.children[0]) {
            wrapperRef.current.children[0].scrollLeft = wrapperRef.current.children[0].scrollWidth;
        }

        if (wrapperRef?.current?.children[0]?.scrollLeft) {
            scrollLeftWidth = Math.max(scrollLeftWidth, wrapperRef.current.children[0].scrollLeft);
        }
    }, [wrapperRef?.current?.children[0], activeScoreboardTab]);

    return (
        <div ref={wrapperRef} className={Styles["board"]} onTouchEnd={handleTouchEnd} data-testid="board">
            {props.children}
        </div>
    );
};

export default ScoreboardRoundHistory;
