import { useEffect } from "react";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";
import { PlaceBetHandler } from "..";

export type PlaceBetWrapperProps = {
    handler: PlaceBetHandler;
    renderBettingBlock: Function;
    signOut: any;
};

export const PlaceBetHanlderWrapper = (props: PlaceBetWrapperProps) => {
    const dispatch = usePlaceBetDispatch();
    const placeBetContext = usePlaceBetContext();

    useEffect(() => {
        console.log(`PlaceBetHanlderWrapper`);
        props.handler.registerEvents(props.signOut, placeBetContext);
        props.handler.setPlaceBetDispatch(dispatch);

        return () => {
            props.handler.unRegisterEvents();
        }
    }, [placeBetContext]);

    return props.renderBettingBlock();
}
