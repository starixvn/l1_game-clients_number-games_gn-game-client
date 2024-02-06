import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

type SlidingChipsBlockProps = {
    messageTransmitter: MessageTransmitterType;
};

type SlidingChipsBlockState = {};

export class SlidingChipsBlock extends Component<SlidingChipsBlockProps, SlidingChipsBlockState> {
    constructor(props: SlidingChipsBlockProps) {
        super(props);

        this.registerGameEvents();
    }

    registerGameEvents() {
        // this.props.messageTransmitter.register("roundHistory", this.handleRoundHistory.bind(this));
    }

    // handleRoundHistory = ({ roundHistory }) => {
    //     this.setState({ roundHistory });
    // };

    render() {
        console.log("SlidingChips Block: ", JSON.stringify(this.state));

        return <div></div>;
    }
}
