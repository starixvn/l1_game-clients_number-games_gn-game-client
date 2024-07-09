import React, { useEffect, useRef, useState } from "react";
import Styles from "./side-bet-scoreboard.module.scss";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";

type Props = {
    children: React.ReactNode;
};

const SideBetScoreboard = (props: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { roundHistory } = useGameStateContext();
    const [isScrollEndRight, setIsScrollEndRight] = useState(false);
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
        const isRight = roundHistory?.length >= 11;
        if ((isScrollEndRight || isRight) && wrapperRef?.current?.children[0]) {
            wrapperRef.current.children[0].scrollLeft = wrapperRef.current.children[0].scrollWidth;
        }

        if (wrapperRef?.current?.children[0]?.scrollLeft) {
            scrollLeftWidth = Math.max(scrollLeftWidth, wrapperRef.current.children[0].scrollLeft);
        }
    }, [wrapperRef?.current?.children[0], roundHistory]);


    return (
        <div ref={wrapperRef} className={Styles["board"]} onTouchEnd={handleTouchEnd} data-testid="board">
            {props.children}
        </div>
    );
};

export default SideBetScoreboard;
