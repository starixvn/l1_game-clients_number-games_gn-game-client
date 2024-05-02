import Swiper from "swiper";
import { useClickSound } from "../../../../_shared/react-hooks";
import Styles from "./button-swipe.module.scss";

const ButtonSwipe: React.FC<{ swiper: React.RefObject<Swiper>; isPrev: boolean }> = ({
    swiper,
    isPrev,
}: {
    swiper: React.RefObject<Swiper>;
    isPrev: boolean;
}) => {
    const clickSound = useClickSound();
    const click = () => {
        clickSound();
        if (isPrev) {
            swiper.current.slidePrev();
        } else {
            swiper.current.slideNext();
        }
    };
    const buttonStyleByState = isPrev ? `prev-button` : `next-button`;
    return (
        <button onClick={() => click()} className={`${Styles[buttonStyleByState]}`}>
            <span className={`icon-back ${Styles["icon"]}`}></span>
        </button>
    );
};

export default ButtonSwipe;
