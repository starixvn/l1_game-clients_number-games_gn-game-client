interface PositionCss {
    top: string;
    bottom?: string;
    left?: string;
}

export interface BetFormCss {
    position: PositionCss;
    arrowStyle: string;
    arrowStyleLeft?: string;
}

export const adjustPopupPosition = (
    isMobileOnly: boolean,
    orgBetFormCss: BetFormCss,
    gameContainerRect: any,
    popupRect: any,
    betOptionRect: any,
    betChoiceRect: any
): BetFormCss => {
    const betFormCss = calculateLeftPosition(isMobileOnly, orgBetFormCss, gameContainerRect, popupRect, betChoiceRect);

    if (window.innerHeight - betOptionRect.bottom > popupRect.height) {
        return betFormCss;
    }

    return calculateBottomPosition(betFormCss, gameContainerRect, popupRect, betOptionRect);
};

export const calculateBottomPosition = (
    orgBetFormCss: BetFormCss,
    gameContainerRect: any,
    popupRect: any,
    betOptionRect: any
): BetFormCss => {
    const betFormCss = { ...orgBetFormCss };

    betFormCss.position.bottom = `${
        betOptionRect.top > popupRect.height ? gameContainerRect.bottom - betOptionRect.top : betOptionRect.bottom + 15
    }px`;
    betFormCss.position.top = "auto";
    betFormCss.arrowStyle = "down";

    return betFormCss;
};

export const calculateLeftPosition = (
    isMobileOnly: boolean,
    orgBetFormCss: BetFormCss,
    gameContainerRect: any,
    popupRect: any,
    betChoiceRect: any
): BetFormCss => {
    const betFormCss = { ...orgBetFormCss };

    if (isMobileOnly) {
        betFormCss.arrowStyleLeft = `${betChoiceRect.left + betChoiceRect.width / 2}px`;
        return betFormCss;
    }

    const rightGap = Math.round(betChoiceRect.right - gameContainerRect.right);
    const leftGap = Math.round(gameContainerRect.left - betChoiceRect.left);
    const isAlignRight = rightGap > -5 && rightGap < 5;
    const isAlignLeft = leftGap > -5 && leftGap < 5;
    const right = 20,
        halfArrowWidth = 8;

    let left = 20;

    if (isAlignRight) {
        left = gameContainerRect.width - popupRect.width - right;
    }

    if ((!isAlignRight && !isAlignLeft) || (isAlignRight && isAlignLeft)) {
        left = (gameContainerRect.width - popupRect.width) / 2;
    }

    betFormCss.position.left = `${left}px`;
    betFormCss.arrowStyleLeft = `${betChoiceRect.right - betChoiceRect.width / 2 - gameContainerRect.left - left - halfArrowWidth}px`;

    return betFormCss;
};
