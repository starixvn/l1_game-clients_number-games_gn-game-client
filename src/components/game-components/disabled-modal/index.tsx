import React from "react";

import { ViewMode } from "../../game-base/type";
import Styles from "./disabled-modal.module.scss";

const DisabledModal: React.FC<{ disabledMessage: string; viewMode: ViewMode }> = ({ disabledMessage, viewMode }) => (
    <div className={`overlay-mask-white ${Styles["popover-container"]}`}>
        <div
            className={`${Styles["disabled-modal"]} ${viewMode === ViewMode.collapse ? Styles["collapse"] : ""}`}
            data-testid="disabled-modal"
        >
            <div data-testid="disable-message">{disabledMessage}</div>
        </div>
    </div>
);

export default DisabledModal;
