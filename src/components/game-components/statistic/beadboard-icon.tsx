import { usePlayerContext } from "../../../_shared/react-contexts";
import { BeadBoardIconProps } from "./types";
import Image from "next/image";

const DEFAULT_ICONS_PATH = "/static/images/scoreboard-icons";
const BeadBoardIcon: React.FC<BeadBoardIconProps> = (props) => {
    const { locale } = usePlayerContext();

    return (
        <Image
            src={`${DEFAULT_ICONS_PATH}/${props.choice}_${locale}.svg`}
            alt={props.choice}
            priority={true}
            width={props.size}
            height={props.size}
        />
    );
};

export default BeadBoardIcon;
