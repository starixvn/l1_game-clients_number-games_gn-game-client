import { Component, ReactNode } from "react";
import { GameStateContextModel } from "../../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { BacBallSettlementResult } from "../../../../../games/bac-ball/types";
import { GameSettings, Round } from "../../../../game-base/type";
import { SwitchableScoreboard } from "../../../../game-components/round-history/scoreboard";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";

const messageEventTypes = {
    ROUND_HISTORY: "roundHistory",
    FINISH: "finish",
    END_PLACE_BET: "epb",
};

export type LobbyScoreboardProps = {
    gameSettings: GameSettings;
    transmitter: LobbyGameTransmitter;
};

export type LobbyScoreboardState = {
    roundHistory: Round<object, object>[];
    blinkNodeFlag: boolean;
    isShow: boolean;
};

const bigRoadElementContainer: Record<number, { ctor: any; converter: any }> = {};

export function registerBigRoadElement(ctor: unknown, converter: unknown, ...gameIds: number[]) {
    gameIds.forEach((id) => {
        bigRoadElementContainer[id] = { ctor, converter };
    });
}

export function getBigRoadElement(gameId: number) {
    return bigRoadElementContainer[gameId] || ({} as { ctor: any; converter: any });
}

export class LobbyScoreboard extends Component<LobbyScoreboardProps, LobbyScoreboardState> {
    static defaultState: LobbyScoreboardState = {
        roundHistory: [],
        blinkNodeFlag: false,
        isShow: false,
    };
    private listenerIds: string[] = [];

    constructor(props: LobbyScoreboardProps) {
        super(props);

        this.state = LobbyScoreboard.defaultState;
        this.listenerIds = [];
    }

    componentDidMount(): void {
        const { transmitter } = this.props;

        if (transmitter) {
            this.listenerIds.push(transmitter.register(messageEventTypes.ROUND_HISTORY, this.handleRoundHistory.bind(this)));
            this.listenerIds.push(transmitter.register(messageEventTypes.FINISH, this.handleRoundHistory.bind(this)));
            this.listenerIds.push(transmitter.register(messageEventTypes.END_PLACE_BET, this.handleRoundHistory.bind(this)));
        }
    }

    componentWillUnmount(): void {
        this.listenerIds.forEach((listenerId) => this.props.transmitter?.unsubscribe(listenerId));
    }

    handleRoundHistory({ roundHistory, finish, epb }: GameStateContextModel & { finish: Round<object, object>; epb: boolean }) {
        let newState: Partial<LobbyScoreboardState> = {};

        if (roundHistory) {
            newState = { roundHistory: [...roundHistory], isShow: true };
        }

        if (finish) {
            const cloned = [...this.state.roundHistory];
            cloned.unshift(finish);
            cloned.pop();

            newState = { roundHistory: [...cloned] };
        }

        this.setState({ blinkNodeFlag: !!epb, ...newState } as LobbyScoreboardState);
    }

    render(): ReactNode {
        const { roundHistory, blinkNodeFlag, isShow } = this.state;
        const { gameSettings } = this.props;
        const settlements = roundHistory.map((round) => round.settlementResult);
        const { converter, ctor } = getBigRoadElement(gameSettings.id);

        if (!converter || !ctor || !isShow) {
            return;
        }

        blinkNodeFlag && converter.addBlinkNode(settlements as BacBallSettlementResult[]);

        return (
            <div className={Styles.scoreboard}>
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    className={Styles["scoreboard-lobby"]}
                    scoreboards={[
                        {
                            element: ctor,
                            arrange: ctor.arrange(converter.instance),
                            column: 13,
                            row: 6,
                            blockClassName: Styles["scoreboard-lobby-block"],
                            elementClassName: Styles["scoreboard-lobby-element"],
                        },
                    ]}
                />
            </div>
        );
    }
}
