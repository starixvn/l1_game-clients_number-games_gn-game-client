import React from "react";

import { useTranslate } from "@tolgee/react";

export const ErrorApiText: React.FC<{ errorMessage: string; errorCode: string }> = ({ errorMessage, errorCode }) => {
    const { t } = useTranslate(["Common", "SabaNumber"]);
    return <>{t(errorMessage, { errorCode }).replaceTolgeeFormat()}</>;
};
