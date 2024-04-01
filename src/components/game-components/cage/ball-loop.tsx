import { useMemo } from "react";

import { RoundState } from "../../game-base/type";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const BallLoops: React.FC<{ roundState: RoundState }> = ({ roundState }) => {
    const isSwitchRound = roundState === RoundState.SwitchRound;

    return useMemo(() => {
        console.log("BallLoops");
        return (
            <div id="cage-balls" className={Styles["cage-balls"]}>
                {isSwitchRound && <div className={Styles["idle-balls"]}></div>}
                {!isSwitchRound && (
                    <Spritesheet
                        className={`fade-in ${Styles["balls-loop"]}`}
                        image={`/static/images/cage/cage-loop-anim.png`}
                        widthFrame={130}
                        isResponsive
                        heightFrame={130}
                        steps={11}
                        autoplay={true}
                        loop={true}
                        fps={40}
                    />
                )}
            </div>
        );
    }, [roundState]);
};

export default BallLoops;
