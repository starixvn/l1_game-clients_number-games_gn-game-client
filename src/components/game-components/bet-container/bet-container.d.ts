import { RoundState } from "../game-base/type";

type Props = {
    gameState: RoundState;
    children: React.ReactNode;
};

type BetModalInfo = {
    choice: string;
};
