import { useEffect } from "react";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { PlaceBetHandler } from "..";

export type PlaceBetWrapperProps = {
    handler: PlaceBetHandler;
    renderBettingBlock: Function;
    signOut: any;
};

export const PlaceBetHanlderWrapper = (props: PlaceBetWrapperProps) => {
    const placeBetDispatchDirect = usePlaceBetDispatch();
    const placeBetContext = usePlaceBetContext();

    useEffect(() => {
        props.handler.registerEvents(props.signOut, placeBetContext);
        props.handler.setPlaceBetDispatch(placeBetDispatchDirect);

        return () => {
            // TO DO: unregister event
        }
    }, [])

    return props.renderBettingBlock();
}
