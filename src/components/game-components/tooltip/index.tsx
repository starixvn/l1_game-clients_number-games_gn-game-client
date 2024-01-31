import React, { useEffect, useRef, useState } from "react";
import { isDesktop } from "react-device-detect";

import Styles from "./tooltip.module.scss";

export const Tooltip: React.FC<{ message: string; hoverWrapper: React.MutableRefObject<HTMLDivElement>; isShowAtHoverPosition?: boolean }> =
    ({ message, hoverWrapper, isShowAtHoverPosition }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const [customStyle, setCustomStyle] = useState<React.CSSProperties>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const classShow = showTooltip ? "show" : "";

        useEffect(() => {
            const handleClick = () => {
                setShowTooltip(false);
            };

            document.addEventListener("mousedown", handleClick);

            return () => {
                document.removeEventListener("mousedown", handleClick);
            };
        }, []);

        useEffect(() => {
            if (wrapperRef.current) {
                const wrapperLeftPosition = wrapperRef.current.getBoundingClientRect().x;
                !isShowAtHoverPosition && wrapperLeftPosition < 0 && setCustomStyle({ left: -60, right: "auto" });
            }
        }, [wrapperRef]);

        useEffect(() => {
            let timeOut: NodeJS.Timeout = null;
            const mousePosition = {
                x: 0,
                y: 0,
            };

            const handleMouseIn = () => {
                setShowTooltip(true);

                if (isShowAtHoverPosition) {
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        const tooltipWidth = wrapperRef.current.getBoundingClientRect().width;
                        const windowWidth = window.innerWidth;
                        const moveLeft = windowWidth < mousePosition.x + tooltipWidth + 30 ? -tooltipWidth : 20;

                        setCustomStyle({ position: "fixed", left: mousePosition.x + moveLeft, top: mousePosition.y + 20, right: "auto" });
                    }, 500);
                }
            };

            const handleMouseOut = () => {
                clearTimeout(timeOut);
                setShowTooltip(false);
            };

            const handleMouseMove = (event: MouseEvent) => {
                mousePosition.x = event.clientX;
                mousePosition.y = event.clientY;
            };

            if (isDesktop) {
                hoverWrapper?.current?.addEventListener("mouseenter", handleMouseIn);
                hoverWrapper?.current?.addEventListener("mouseleave", handleMouseOut);
                isShowAtHoverPosition && document.addEventListener("mousemove", handleMouseMove);
            }

            return () => {
                if (hoverWrapper?.current && isDesktop) {
                    hoverWrapper.current.removeEventListener("mouseenter", handleMouseIn);
                    hoverWrapper.current.removeEventListener("mouseleave", handleMouseOut);
                }

                isDesktop && isShowAtHoverPosition && document.addEventListener("mousemove", handleMouseMove);
                clearTimeout(timeOut);
            };
        }, [hoverWrapper]);

        return (
            <div className={`tooltip info ${classShow} ${Styles["tooltip-buttons"]} ${Styles[classShow]}`}>
                <div ref={wrapperRef} style={customStyle} className={`tooltip-inner ${Styles["tooltip-inner"]}`}>
                    {message}
                </div>
                {!isShowAtHoverPosition && <span className={`arrow up ${Styles["arrow"]}`}></span>}
            </div>
        );
    };
