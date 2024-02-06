import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

export type HeaderBlockProps = {
    messageTransmitter: MessageTransmitterType;
};

export type HeaderBlockState = {
    roundId: string;
    drawId: string;
};

export class HeaderBlock extends Component<HeaderBlockProps, HeaderBlockState> {
    constructor(props: HeaderBlockProps) {
        super(props);

        this.props.messageTransmitter.register("roundId", this.handleRoundId.bind(this));
    }

    handleRoundId = ({ roundId, drawId }) => {
        this.setState({ roundId: roundId, drawId: drawId });
    };

    render() {
        console.log("Header Block: ", JSON.stringify(this.state));

        return <div></div>;
    }
}
