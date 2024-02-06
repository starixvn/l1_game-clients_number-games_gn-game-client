import { DevTools, FormatSimple, Tolgee } from "@tolgee/react";
const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];
const namespaces = ["Common", "SabaNumber"];

export const tolgee = Tolgee().use(DevTools()).use(FormatSimple()).init({
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
    apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
    projectId: "5",
    ns: namespaces,
});
