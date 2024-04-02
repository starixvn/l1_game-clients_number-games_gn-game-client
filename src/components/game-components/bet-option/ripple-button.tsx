import { useEffect, useRef, useState } from "react";
import { useSystemContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import { setRipplePosition } from "./ripple-effect";

interface RippleButtonProps {
    choice: string;
    onClickBet: (choice: string) => void;
    className: string;
    id: string;
    indexRef: number;
}

const DEFAULT_CHIP_CURSOR_PATH = "/static/images/chips/cursor";
const RippleButton: React.FC<RippleButtonProps> = ({ choice, onClickBet, className, id, indexRef, ...props }) => {
    const systemContext = useSystemContext();
    const { roundState } = useGameStateContext();
    const rippleButtons = useRef([]);

    const [customStyle, setCustomStyle] = useState<object>();
    const [cursorImage, setCursorImage] = useState<string>("");
    const [ripplePosX, setRipplePosX] = useState(0);
    const [ripplePosY, setRipplePosY] = useState(0);

    useEffect(() => {
        setCursorImage(`${DEFAULT_CHIP_CURSOR_PATH}/cursor-chip-${systemContext.selectedChip}.svg`);
    }, [systemContext.selectedChip]);

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setCustomStyle({ cursor: `url(${cursorImage}), auto` });
        } else {
            setCustomStyle({ cursor: "not-allowed" });
        }
    }, [cursorImage, roundState]);

    useEffect(() => {
        return setRipplePosition(setRipplePosX, setRipplePosY, rippleButtons);
    }, [rippleButtons]);

    return (
        <>
            <button
                ref={(el) => (rippleButtons.current[indexRef] = el)}
                className={`btn-ripple  ${className}`}
                id={id}
                onClick={() => onClickBet(choice)}
                {...props}
                style={customStyle}
            >
                {<span className="ripple-effect"></span>}
            </button>

            <style>
                {`
                 .ripple-effect {
                    top: calc(1 / var(--zoom-game) * ${ripplePosY}px);
                    left: calc(1 / var(--zoom-game) * ${ripplePosX}px);
                   }
                 `}
            </style>
        </>
    );
};

export default RippleButton;
