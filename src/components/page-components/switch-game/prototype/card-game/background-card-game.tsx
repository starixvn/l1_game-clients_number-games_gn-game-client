import React from 'react';
import Image from 'next/image';
import styles from './background-card-game.module.scss';

interface BackgroundCardGameProps {
    onClick?: () => void;
    className?: string;
}

export const BackgroundCardGame: React.FC<BackgroundCardGameProps> = ({
    onClick,
    className,
}) => {
    return (
        <div className={`${styles.container} ${className || ''}`} onClick={onClick}>
            <div className={styles.backgroundWrapper}>
                <Image
                    src="/images/mask-group.png"
                    alt="Card Game Background"
                    layout="fill"
                    objectFit="cover"
                    className={styles.backgroundImage}
                    priority
                />
            </div>
            <div className={styles.playButton}>
                <Image
                    src="/images/btnn-play-bg.png"
                    alt="Play Button Background"
                    width={160}
                    height={160}
                    className={styles.playButtonBg}
                />
                <Image
                    src="/images/play-icon.png"
                    alt="Play Icon"
                    width={48}
                    height={48}
                    className={styles.playIcon}
                />
            </div>
        </div>
    );
};

export default BackgroundCardGame;
