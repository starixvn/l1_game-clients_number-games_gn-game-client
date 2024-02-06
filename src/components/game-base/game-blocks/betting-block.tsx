import React, { Component } from "react";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";

export type BettingBlockProps = {
    messageTransmitter: MessageTransmitterType;
    getGameState: () => any;
};
export interface BetChoice {
    name: string;
    odds: number;
    totalBet?: number;
    totalPlayer?: number;
    percent?: number;
}
export interface Bet {
    [betChoice: string]: number | any;
}
export class BettingBlockState {
    betChoices: Array<BetChoice> = [];
    mainPlayerBet: Bet = {};
    totalBets: Bet;
}

export class BettingBlock<Props extends BettingBlockProps, State extends BettingBlockState> extends Component<Props, State> {
    /**
     *
     */
    constructor(props: Props) {
        super(props);

        this.props.messageTransmitter.register("totalBets", this.handleTotalBet.bind(this));
    }

    handleTotalBet = ({ totalBets }) => {
        this.setState({ totalBets });
    };

    render() {
        console.log("Betting Block: ", JSON.stringify(this.state));

        return <div></div>;
    }
}
