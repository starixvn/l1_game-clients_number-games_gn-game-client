import { useEffect } from "react";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { PlaceBetHandler } from "../../game-base/handlers";

export type PlaceBetWrapperProps = {
    handler: PlaceBetHandler;
    renderBettingBlock: Function;
    signOut: any;
};

export const PlaceBetWrapper = (props: PlaceBetWrapperProps) => {
    const placeBetDispatchDirect = usePlaceBetDispatch();
    const placeBetContext = usePlaceBetContext();

    useEffect(() => {
        props.handler.registerEvents(props.signOut, placeBetContext);
        props.handler.setPlaceBetDispatchTmp(placeBetDispatchDirect)
    }, [])

    return props.renderBettingBlock();
}
