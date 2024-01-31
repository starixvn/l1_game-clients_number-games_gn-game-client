import { GameState } from "../game-base/type";

type Props = {
    gameState: GameState;
    children: React.ReactNode;
};

type BetModalInfo = {
    choice: string;
};
