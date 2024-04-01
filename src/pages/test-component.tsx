import { Spritesheet } from "../components/game-components/sprites-sheet";

const testComponent = () => {
    return (
        <Spritesheet
            key={1}
            className={"component-test"}
            image={`/static/images/cage/cage-loop-anim.png`}
            widthFrame={130}
            isResponsive
            heightFrame={130}
            steps={11}
            autoplay={true}
            loop={true}
            // startAt={0}
            // endAt={55}
            writeDebugLog={false}
            fps={40}
        />
    );
};

export default testComponent;
