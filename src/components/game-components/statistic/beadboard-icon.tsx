import { usePlayerContext } from "../../../_shared/react-contexts";
import { BeadBoardIconProps } from "./types";

const BeadBoardIcon: React.FC<BeadBoardIconProps> = (props) => {
    const { locale } = usePlayerContext();

    return (
        <span className={`icon-${props.choice}_${locale}`}>
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
        </span>
    );
};

export default BeadBoardIcon;
