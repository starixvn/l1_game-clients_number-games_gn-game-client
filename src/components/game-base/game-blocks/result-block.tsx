import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

export type ResultBlockProps = {
    messageTransmitter: MessageTransmitterType;
    getGameState: () => any;
};

export class ResultBlockState {
    status: Status;
    finish: Finish;
}

export class Status {
    winningByChoices: {
        [betChoice: string]: number;
    };
    win: boolean;
    bet: number;
    reachMaxWin?: boolean;
}

export class Finish {
    result?: TResult;
    settlementResult?: TSettlementResult;
    roundId?: number;

    static eventName = "finish";
}

export type TResult = {
    [betChoice: string]: any;
};

export type TSettlementResult = {
    [betChoice: string]: boolean;
};

export class ResultBlock<Props extends ResultBlockProps, State extends ResultBlockState> extends Component<Props, State> {
    constructor(props: Props) {
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
