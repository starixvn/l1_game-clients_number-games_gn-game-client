import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

type ScoreboardBlockProps = {
    messageTransmitter: MessageTransmitterType;
};

class HistoryItem {
    result?: TResult;
    settlementResult?: TSettlementResult;
    roundId?: number;
}

export type TResult = {
    [betChoice: string]: any;
};

export type TSettlementResult = {
    [betChoice: string]: boolean;
};

type ScoreboardBlockState = {
    roundHistory: Array<HistoryItem>;
};

export class ScoreboardBlock extends Component<ScoreboardBlockProps, ScoreboardBlockState> {
    constructor(props: ScoreboardBlockProps) {
        super(props);

        this.registerGameEvents();
    }

    registerGameEvents() {
        this.props.messageTransmitter.register("roundHistory", this.handleRoundHistory.bind(this));
    }

    handleRoundHistory = ({ roundHistory }) => {
        this.setState({ roundHistory });
    };

    render() {
        console.log("Secoreboard Block: ", JSON.stringify(this.state).slice(0, 20));

        return <div></div>;
    }
}
