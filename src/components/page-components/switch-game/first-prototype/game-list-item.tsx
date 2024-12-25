import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './styles/game-list-item.module.scss';

export interface Game {
    id: string;
    name: string;
    imageUrl: string;
    scoreBoard: {
        results: number[];
        average: number;
    };
    rtp: number;
    bettingLimit: {
        min: number;
        max: number;
    };
    background: string;
}

interface GameListItemProps {
    game: Game;
    onSelect?: (game: Game) => void;
}

const GameListItem: React.FC<GameListItemProps> = ({ game, onSelect }) => {
    const [countdown, setCountdown] = useState(30);
    const TOTAL_SECONDS = 30;
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = ((TOTAL_SECONDS - countdown) / TOTAL_SECONDS) * circumference;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const gridRows = Array.from({ length: 6 }, (_, rowIndex) =>
        game.scoreBoard.results.slice(rowIndex * 17, (rowIndex + 1) * 17)
    );

    return (
        <div
            className={styles.gameItem}
            style={{ background: game.background }}
        >
            <div className={styles.header}>
                <div className={styles.gameInfo}>
                    <div className={styles.gameImage}>
                        <Image
                            src={game.imageUrl}
                            alt={game.name}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <h3>{game.name}</h3>
                </div>
                <div className={styles.timerContainer}>
                    <svg className={styles.timerCircle} width="40" height="40">
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            fill="black"
                            stroke="rgba(0, 255, 0, 0.2)"
                            strokeWidth="2"
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
                    </svg>
                    <div className={styles.timerNumber}>{countdown}</div>
                </div>
            </div>

            <div className={styles.scoreboard}>
                <table className={styles.scoreTable}>
                    <tbody>
                        {gridRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((result, colIndex) => (
                                    <td key={colIndex} className={styles.resultCell}>
                                        {result}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.footer}>
                <div className={styles.infoText}>
                    <span className={styles.label}>Bet Range:</span>
                    <span className={styles.value}>${game.bettingLimit.min} - ${game.bettingLimit.max}</span>
                </div>
                <div className={styles.infoText}>
                    <span className={styles.label}>RTP:</span>
                    <span className={styles.value}>{game.rtp}%</span>
                </div>
                <button className={styles.playButton} onClick={() => onSelect?.(game)}>
                    PLAY
                </button>
            </div>
        </div>
    );
};

export default GameListItem; 