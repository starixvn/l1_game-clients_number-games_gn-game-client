import React from "react";
import styles from './active-tab-indicator.module.scss';

interface ActiveTabIndicatorProps {
    title: string;
}

export const ActiveTabIndicator = ({ title }: ActiveTabIndicatorProps): JSX.Element => {
    return (
        <div className={styles.tab}>
            <div className={styles['text-wrapper']}>{title}</div>
            <div className={styles.underline} />
        </div>
    );
};