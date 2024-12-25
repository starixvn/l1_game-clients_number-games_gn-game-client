import React, { useState, useEffect } from 'react';
import styles from './styles/game-selection.module.scss';

interface Game {
    id: string;
    name: string;
    variant: string;
    betRange: {
        min: number;
        max: number;
    };
    rtp: number;
    roundCount: number;
    background: string;
    results: ('red' | 'blue')[];
}

interface GameItemProps {
    game: Game;
    onSelect: (game: Game) => void;
}

const GameItem: React.FC<GameItemProps> = ({ game, onSelect }) => {
    const [countdown, setCountdown] = useState(30);
    const TOTAL_SECONDS = 30;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * circumference;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : TOTAL_SECONDS));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className={styles.gameCard}
            style={{ background: game.background }}
        >
            <div className={styles.gameHeader}>
                <div className={styles.gameInfo}>
                    <h2>{game.name} - {game.variant}</h2>
                </div>
                <div className={styles.timerContainer}>
                    <svg className={styles.timerCircle} width="40" height="40">
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            fill="none"
                            stroke="rgba(0, 255, 0, 0.2)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            fill="none"
                            stroke="#00ff00"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 20 20)"
                        />
                        <text
                            x="20"
                            y="20"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#00ff00"
                            className={styles.timerNumber}
                            fontWeight="bold"
                        >
                            {countdown}
                        </text>
                    </svg>
                </div>
            </div>

            <div className={styles.resultGrid}>
                {game.results.map((color, index) => (
                    <div
                        key={index}
                        className={`${styles.dot} ${styles[color]}`}
                    />
                ))}
            </div>

            <div className={styles.gameFooter}>
                <div className={styles.info}>
                    <span className={styles.betRange}>
                        {game.betRange.min} - {game.betRange.max}
                    </span>
                    <span className={styles.rtp}>
                        RTP 24h: {game.rtp}%
                    </span>
                </div>
                <button
                    className={styles.playButton}
                    onClick={() => onSelect(game)}
                >
                    PLAY
                </button>
            </div>
        </div>
    );
};

export default GameItem; 