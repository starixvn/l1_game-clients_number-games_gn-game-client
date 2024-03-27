import React, { useContext } from "react";
import { URLContext } from "../../../_shared/react-contexts";
import { useCommonTranslate } from "../../../_shared/react-hooks";

const ButtonReturnToURL: React.FC = () => {
    const { t } = useCommonTranslate();

    const { backToRedirectUrl, redirectUrl } = useContext(URLContext);
    const handleBackToReturnURL = () => {
        backToRedirectUrl(redirectUrl);
    };
    return redirectUrl !== "" ? (
        <button id="btn-back" onClick={() => handleBackToReturnURL()}>
            {t(`back`)}
        </button>
    ) : (
        <></>
    );
};

export default ButtonReturnToURL;
