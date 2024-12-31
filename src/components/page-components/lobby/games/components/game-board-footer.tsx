import styles from "./game-board.module.scss";

type GameBoardFooterProps = {
    onPlay: () => void;
};

export const GameBoardFooter: React.FC<GameBoardFooterProps> = ({ onPlay }) => {
    return (
        <div className={styles.gameFooter}>
            <div className={styles.info}>
                {/* Info content commented out for now */}
            </div>
            <button
                className={styles.playButton}
                onClick={onPlay}
            >
                PLAY
            </button>
        </div>
    );
}; 