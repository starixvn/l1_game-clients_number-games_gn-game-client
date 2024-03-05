import React, { useEffect, useRef } from "react";
import { getAppSettings } from "../../../_shared/app-settings";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { GameCategoryConfig, GameCategoryKeys, GameCategoryType, GamesInOnePage } from "./constants";
import styles from "./game-category.module.scss";

const renderPagingCategory = (
    category: string,
    numOfPages: number,
    selectedCategory: GameCategoryType,
    selectedPage: number,
    onSelectPage: Function
) => {
    const result = [];

    for (let i = 0; i < numOfPages; i++) {
        result.push(
            <span
                onClick={() => onSelectPage(category, i + 1)}
                className={`${styles["category-page"]} ${
                    GameCategoryType[category] === selectedCategory && selectedPage - 1 === i ? styles["selected"] : ""
                }`}
                key={i}
            >
                {i + 1}
            </span>
        );
    }

    return result;
};

export const GameCategory: React.FC<{
    selectedCategory: GameCategoryType;
    selectedPage: number;
    selectCategoryPage: Function;
}> = ({ selectedCategory, selectCategoryPage, selectedPage }) => {
    const { t } = useSNTranslate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const categoryPage = GameCategoryKeys.reduce((result, category) => {
        const categoryLength = category !== "favorite" ? GameCategoryConfig[getAppSettings().appType][category].length : 0;

        result[category] = Math.ceil(categoryLength / GamesInOnePage);

        return result;
    }, {});

    const appTypeClass = "SM";

    useEffect(() => {
        if (wrapperRef?.current) {
            wrapperRef.current.scrollLeft = GameCategoryKeys.findIndex((cat) => cat === GameCategoryType[selectedCategory]) * 100 - 100;
        }
    }, [wrapperRef?.current, selectedCategory]);

    return (
        <div ref={wrapperRef} className={`${styles["category-container"]}`}>
            <ul className={`${styles["category-list"]} ${styles[appTypeClass]}`}>
                {GameCategoryKeys.map((categoryKey) => (
                    <li
                        className={`${styles["category-item"]} 
                            ${selectedCategory === GameCategoryType[categoryKey] ? styles["selected"] : ""}
                        `}
                        key={categoryKey}
                    >
                        <div className="d-flex">
                            <div className={styles["category-text"]} onClick={() => selectCategoryPage(categoryKey, 1, true)}>
                                {t(`category-${categoryKey}`)}
                            </div>
                            {categoryPage[categoryKey] > 1 && (
                                <div className={styles["paging-container"]}>
                                    {renderPagingCategory(
                                        categoryKey,
                                        categoryPage[categoryKey],
                                        selectedCategory,
                                        selectedPage,
                                        selectCategoryPage
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
