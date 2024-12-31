import React from "react";
import styles from './high-light-tab.module.scss';

interface HighLightTabProps {
    title: string;
}

export const HighLightTab = ({ title }: HighLightTabProps): JSX.Element => {
    return (
        <div className={styles.tab}>
            <div className={styles['text-wrapper']}>{title}</div>
        </div>
    );
};