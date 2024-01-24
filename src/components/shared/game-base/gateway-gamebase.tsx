import React from "react";

import GameBase from ".";
import { SocketState } from "../../../types";
import { GameBaseState, GameState, GatewayGameBaseProps } from "./type";

export default abstract class GatewayGameBase<P extends GatewayGameBaseProps, S extends GameBaseState<any, any>> extends GameBase<P, S> {
    initSocket() {
        return this.props.socketGateway;
    }

    onStart() {
        super.onStart();
        const { gameName } = this.props;
        const { session } = this.context as any;
        document.visibilityState !== "hidden" && this.socket && this.socket.emit("signIn", { gameName, session });
    }

    onDestroy() {
        super.onDestroy();
        this.socket && this.socket.emit("outGame", this.props.gameName);
    }

    componentDidUpdate(prevProps) {
        if (this.props.socketGatewayState !== prevProps.socketGatewayState) {
            switch (this.props.socketGatewayState) {
                case SocketState.Connected:
                    this.onStart();
                    break;
                case SocketState.Error:
                    this.setState({ gameState: GameState.ConnectFailed });
                    break;
                default:
                    this.setState({ signedIn: false });
                    break;
            }
        }
        if (this.props.viewMode !== prevProps.viewMode) {
            this.setState({ viewMode: this.props.viewMode });
        }
        if (!this.props.isJoinedGame) {
            this.setState({ viewMode: this.props.viewMode }, () => {
                this.props.finishJoinGame();
            });
        }
    }

    protected sendBetMessage(betChoice: string, amount: number) {
        const { gameName } = this.props;
        const betData = { betChoice, amount };
        this.socket.emit("bet", { gameName, betData });
    }

    protected retryConnect() {
        this.socket.connected ? this.onStart() : this.props.retryConnectSocket();
    }
}
