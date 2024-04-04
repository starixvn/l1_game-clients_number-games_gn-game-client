import { isAndroid } from "react-device-detect";
import { RoundState } from "../../game-base/type";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const BallLoops: React.FC<{ roundState: RoundState }> = ({ roundState }) => {
    const renderBalls = () => (
        <Spritesheet
            className={`fade-in ${Styles["balls-loop"]}`}
            image="/static/images/cage/cage-loop-anim.png"
            widthFrame={130}
            isResponsive
            heightFrame={130}
            steps={11}
            autoplay
            loop
            fps={isAndroid ? 30 : 40}
        />
    );

    return (
        <div id="cage-balls" className={Styles["cage-balls"]}>
            {roundState === RoundState.SwitchRound ? <div className={Styles["idle-balls"]} /> : renderBalls()}
        </div>
    );
};

export default BallLoops;
