import React from "react";
import { useTranslator } from "../../../_shared/react-hooks";

export const ErrorApiText: React.FC<{ errorMessage: string; errorCode: string }> = ({ errorMessage, errorCode }) => {
    const { t } = useTranslator();
    return <>{t(errorMessage, { errorCode }).replaceTolgeeFormat()}</>;
};
