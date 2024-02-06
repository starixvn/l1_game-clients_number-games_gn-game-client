import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

type StatisticBlockProps = {
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

type StatisticBlockState = {
    roundHistory: Array<HistoryItem>;
};

export class StatisticBlock extends Component<StatisticBlockProps, StatisticBlockState> {
    constructor(props: StatisticBlockProps) {
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
        console.log("Statistic Block: ", JSON.stringify(this.state).slice(0, 20));

        return <div></div>;
    }
}
