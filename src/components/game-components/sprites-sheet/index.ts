import React, { Component, CSSProperties } from "react";

export interface FrameAction {
    frame: number;
    callback: () => void;
}

export interface SpritesheetProps {
    className?: string;
    style?: CSSProperties;
    image?: string;
    widthFrame?: number;
    heightFrame?: number;
    isResponsive?: boolean;
    writeDebugLog?: boolean;
    steps?: number;
    fps?: number;
    direction?: "forward" | "rewind";
    timeout?: number;
    autoplay?: boolean;
    loop?: boolean;
    startAt?: number;
    endAt?: number | false;
    background?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
    getInstance?: (instance: Spritesheet) => void;
    onClick?: (instance: Spritesheet) => void;
    onDoubleClick?: (instance: Spritesheet) => void;
    onMouseMove?: (instance: Spritesheet) => void;
    onMouseEnter?: (instance: Spritesheet) => void;
    onMouseLeave?: (instance: Spritesheet) => void;
    onMouseOver?: (instance: Spritesheet) => void;
    onMouseOut?: (instance: Spritesheet) => void;
    onMouseDown?: (instance: Spritesheet) => void;
    onMouseUp?: (instance: Spritesheet) => void;
    onInit?: (instance: Spritesheet) => void;
    onResize?: (instance: Spritesheet) => void;
    onPlay?: (instance: Spritesheet) => void;
    onPause?: (instance: Spritesheet) => void;
    onLoopComplete?: (instance: Spritesheet) => void;
    onEachFrame?: (instance: Spritesheet) => void;
    onEnterFrame?: FrameAction[] | false;
}

const defaultProps: SpritesheetProps = {
    className: "",
    style: {},
    isResponsive: true,
    direction: "forward",
    timeout: 0,
    autoplay: true,
    loop: false,
    startAt: 0,
    endAt: false,
    background: "",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "",
    getInstance: () => {},
    onClick: () => {},
    onDoubleClick: () => {},
    onMouseMove: () => {},
    onMouseEnter: () => {},
    onMouseLeave: () => {},
    onMouseOver: () => {},
    onMouseOut: () => {},
    onMouseDown: () => {},
    onMouseUp: () => {},
    onInit: () => {},
    onResize: () => {},
    onPlay: () => {},
    onPause: () => {},
    onLoopComplete: () => {},
    onEachFrame: () => {},
    writeDebugLog: false,
};

export class Spritesheet extends Component<SpritesheetProps> {
    id: string;
    spriteEl: HTMLElement | null = null;
    spriteElContainer: HTMLElement | null | undefined = null;
    spriteElMove: HTMLElement | null | undefined = null;
    imageSprite: HTMLImageElement | null | undefined = null;
    cols: number | null | undefined = null;
    rows: number | null | undefined = null;
    intervalSprite: NodeJS.Timeout | null | undefined = null;
    isResponsive: boolean;
    startAt: number;
    endAt: number | false;
    fps: number;
    steps: number;
    allRowsSteps: number = 0;
    completeLoopCicles: number = 0;
    isPlaying: boolean = false;
    spriteScale: number = 1;
    direction: "forward" | "rewind";
    playTimeout: NodeJS.Timeout;
    resizeTimeout: NodeJS.Timeout;

    constructor(props: SpritesheetProps) {
        super(props);

        const { isResponsive, startAt, endAt, fps, steps, direction } = Object.assign(defaultProps, this.props);

        this.id = `react-responsive-spritesheet-${parseInt(String(Math.random() * 1000000))}`;
        this.isResponsive = isResponsive || true;
        this.startAt = this.setStartAt(startAt || 0);
        this.endAt = this.setEndAt(endAt || false);
        this.fps = fps;
        this.steps = steps;
        this.direction = this.setDirection(direction || "forward");
        this.spriteEl = this.spriteElContainer = this.spriteElMove = this.imageSprite = this.cols = this.rows = null;
        this.intervalSprite = null;
        this.isPlaying = false;
        this.spriteScale = 1;
        this.frame = this.startAt ? this.startAt : this.direction === "rewind" ? (this.steps || 1) - 1 : 0;
    }

    componentDidMount() {
        this.init();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize as any);
        clearInterval(this.intervalSprite);
        clearTimeout(this.playTimeout);
        clearTimeout(this.resizeTimeout);
    }

    renderElements = () => {
        const {
            image,
            className,
            style,
            widthFrame,
            heightFrame,
            background,
            backgroundSize,
            backgroundRepeat,
            backgroundPosition,
            onClick,
            onDoubleClick,
            onMouseMove,
            onMouseEnter,
            onMouseLeave,
            onMouseOver,
            onMouseOut,
            onMouseDown,
            onMouseUp,
        } = this.props;

        let containerStyles: CSSProperties = {
            position: "relative",
            overflow: "hidden",
            width: `${widthFrame}px`,
            height: `${heightFrame}px`,
            transform: `scale(${this.spriteScale})`,
            transformOrigin: "0 0",
            backgroundSize: backgroundSize,
            backgroundRepeat: backgroundRepeat,
            backgroundPosition: backgroundPosition,
        };

        if (background) {
            containerStyles.backgroundImage = `url(${background})`;
        }

        let moveStyles: CSSProperties = {
            overflow: "hidden",
            backgroundRepeat: "no-repeat",
            display: "table-cell",
            backgroundImage: `url(${image})`,
            width: `${widthFrame}px`,
            height: `${heightFrame}px`,
            transformOrigin: "0 50%",
        };

        let elMove = React.createElement("div", {
            className: "react-responsive-spritesheet-container__move",
            style: moveStyles,
        });

        let elContainer = React.createElement(
            "div",
            {
                className: "react-responsive-spritesheet-container",
                style: containerStyles,
            },
            elMove
        );

        let elSprite = React.createElement(
            "div",
            {
                className: `react-responsive-spritesheet ${this.id} ${className || ""}`,
                style: style || {},
                onClick: () => onClick && onClick(this.setInstance()),
                onDoubleClick: () => onDoubleClick && onDoubleClick(this.setInstance()),
                onMouseMove: () => onMouseMove && onMouseMove(this.setInstance()),
                onMouseEnter: () => onMouseEnter && onMouseEnter(this.setInstance()),
                onMouseLeave: () => onMouseLeave && onMouseLeave(this.setInstance()),
                onMouseOver: () => onMouseOver && onMouseOver(this.setInstance()),
                onMouseOut: () => onMouseOut && onMouseOut(this.setInstance()),
                onMouseDown: () => onMouseDown && onMouseDown(this.setInstance()),
                onMouseUp: () => onMouseUp && onMouseUp(this.setInstance()),
            },
            elContainer
        );

        return elSprite;
    };

    init = () => {
        const { image, widthFrame, heightFrame, autoplay, getInstance, onInit } = this.props;

        let imgLoadSprite = new Image();
        imgLoadSprite.src = image;
        imgLoadSprite.onload = () => {
            if (document && document.querySelector(`.${this.id}`)) {
                this.imageSprite = imgLoadSprite;
                this.cols = parseInt(this.imageSprite.width === widthFrame ? "1" : String(this.imageSprite.width / widthFrame));
                this.rows = parseInt(this.imageSprite.height === heightFrame ? "1" : String(this.imageSprite.height / heightFrame));
                this.allRowsSteps = this.rows * this.steps;
                this.spriteEl = document.querySelector(`.${this.id}`);
                this.spriteElContainer = this.spriteEl?.querySelector(".react-responsive-spritesheet-container");
                this.spriteElMove = this.spriteElContainer?.querySelector(".react-responsive-spritesheet-container__move");

                this.resize(false);
                window.addEventListener("resize", this.resize as any);
                this.moveImage(false);
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this?.resize(false);
                }, 10);

                if (autoplay !== false) this.play(true);

                const instance = this.setInstance();

                if (getInstance) getInstance(instance);
                if (onInit) onInit(instance);
            }
        };

        imgLoadSprite.onerror = () => {
            console.error(`Failed to load image ${imgLoadSprite.src}`);
        };
    };

    resize = (callback: boolean = true) => {
        const { widthFrame, onResize } = this.props;

        if (this.isResponsive && this.spriteEl) {
            this.spriteScale = this.spriteEl.offsetWidth / widthFrame;
            if (this.spriteElContainer) this.spriteElContainer.style.transform = `scale(${this.spriteScale})`;
            if (this.spriteEl) this.spriteEl.style.height = `${this.getInfo("height")}px`;
            if (callback && onResize) onResize(this.setInstance());
        }
    };

    play = (withTimeout: boolean = false) => {
        const { onPlay, timeout } = this.props;

        if (!this.isPlaying) {
            clearTimeout(this.playTimeout);
            this.playTimeout = setTimeout(
                () => {
                    if (this) {
                        if (onPlay) onPlay(this.setInstance());
                        this.setIntervalPlayFunctions();
                        this.isPlaying = true;
                    }
                },
                withTimeout ? timeout || 0 : 0
            );
        }
    };

    setIntervalPlayFunctions = () => {
        if (this.intervalSprite) clearInterval(this.intervalSprite);

        this.intervalSprite = setInterval(() => {
            if (this && this.isPlaying) this.moveImage();
        }, 1000 / this.fps);
    };

    moveImage = (play: boolean = true) => {
        const { onEnterFrame, onEachFrame, loop, onLoopComplete } = this.props;

        if (this.spriteElMove) {
            let currentRow = parseInt(String(Math.floor(this.frame / (this.cols || 1))));
            let currentCol = parseInt(String(this.frame - (this.cols || 1) * currentRow));
            this.spriteElMove.style.backgroundPosition = `-${this.props.widthFrame * currentCol}px -${
                this.props.heightFrame * currentRow
            }px`;

            if (this.props.writeDebugLog) {
                console.log(
                    JSON.stringify({
                        id: this.id,
                        cols: this.cols,
                        rows: this.rows,
                        row: currentRow,
                        col: currentCol,
                        pos: this.spriteElMove.style.backgroundPosition,
                    })
                );
            }
        }

        if (onEnterFrame) {
            onEnterFrame.map((frameAction, i) => {
                if (frameAction.frame === this.frame && frameAction.callback) {
                    frameAction.callback();
                }
            });
        }

        if (play) {
            if (this.direction === "rewind") {
                this.frame -= 1;
            } else {
                this.frame += 1;
            }
            if (onEachFrame) onEachFrame(this.setInstance());
        }

        if (this.isPlaying) {
            if (
                (this.direction === "forward" && (this.frame === this.allRowsSteps || this.frame === this.endAt)) ||
                (this.direction === "rewind" && (this.frame === -1 || this.frame === this.endAt))
            ) {
                if (loop) {
                    if (onLoopComplete) onLoopComplete(this.setInstance());
                    this.completeLoopCicles += 1;
                    this.frame = this.startAt ?? (this.direction === "rewind" ? this.steps - 1 : 0);
                } else {
                    this.pause();
                }
            }
        }
    };

    pause = () => {
        const { onPause } = this.props;

        this.isPlaying = false;
        if (this.intervalSprite) clearInterval(this.intervalSprite);
        if (onPause) onPause(this.setInstance());
    };

    goToAndPlay = (frame: number) => {
        this.frame = frame ? frame : this.frame;
        this.play();
    };

    goToAndPause = (frame: number) => {
        this.pause();
        this.frame = frame ? frame : this.frame;
        this.moveImage();
    };

    setStartAt = (frame: number) => {
        this.startAt = frame ? frame - 1 : 0;
        return this.startAt;
    };

    setEndAt = (frame: number | false) => {
        this.endAt = frame;
        return this.endAt;
    };

    setFps(fps: number) {
        this.fps = fps;
        this.setIntervalPlayFunctions();
    }

    setDirection = (direction: string) => {
        this.direction = direction === "rewind" ? "rewind" : "forward";
        return this.direction;
    };

    getInfo = (param: string) => {
        if (!this.spriteElContainer) return;

        switch (param) {
            case "direction":
                return this.direction;
            case "frame":
                return this.frame;
            case "fps":
                return this.fps;
            case "steps":
                return this.steps;
            case "width":
                return this.spriteElContainer.getBoundingClientRect().width;
            case "height":
                return this.spriteElContainer.getBoundingClientRect().height;
            case "scale":
                return this.spriteScale;
            case "isPlaying":
                return this.isPlaying;
            case "isPaused":
                return !this.isPlaying;
            case "completeLoopCicles":
                return this.completeLoopCicles;
            default:
                throw new Error(
                    `Invalid param \`${param}\` requested by Spritesheet.getinfo(). See the documentation on https://github.com/danilosetra/react-responsive-spritesheet`
                );
        }
    };

    setInstance = () => this;

    frame: number = 0;

    render() {
        return this.renderElements();
    }
}
