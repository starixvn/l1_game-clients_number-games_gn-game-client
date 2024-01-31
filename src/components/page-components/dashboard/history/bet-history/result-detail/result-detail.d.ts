export type Props = {
    roundId: number;
    children: React.ReactNode;
    closeModal: () => void;
    gameName: string;
    customizeClass?: string;
};
