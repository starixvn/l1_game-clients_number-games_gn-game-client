import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

type ResultBlockProps = {
    messageTransmitter: MessageTransmitterType;
};

type ResultBlockState = {
    status: Status;
    finish: Finish;
};

class Status {
    winningByChoices: {
        [betChoice: string]: number;
    };
    win: boolean;
    bet: number;
    reachMaxWin?: boolean;
}

class Finish {
    result?: TResult;
    settlementResult?: TSettlementResult;
    roundId?: number;

    static eventName = "finish";
}

type TResult = {
    [betChoice: string]: any;
};

type TSettlementResult = {
    [betChoice: string]: boolean;
};

export class ResultBlock extends Component<ResultBlockProps, ResultBlockState> {
    /**
     *
     */
    constructor(props: ResultBlockProps) {
        super(props);

        this.registerGameEvents();
    }

    registerGameEvents() {
        this.props.messageTransmitter.register("finish", this.handleFinish.bind(this));
        this.props.messageTransmitter.register("status", this.handleStatus.bind(this));
    }

    handleFinish = ({ finish }) => {
        this.setState({ finish: finish });
    };

    handleStatus = ({ status }) => {
        this.setState({ status: status });
    };

    render() {
        console.log("Result Block: ", JSON.stringify(this.state));

        return <div></div>;
    }
}
