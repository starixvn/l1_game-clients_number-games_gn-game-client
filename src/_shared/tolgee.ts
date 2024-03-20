import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, Tolgee } from "@tolgee/react";
import { InContextTools } from "@tolgee/web/tools";
import { getAppSettings } from "./app-settings";

const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];
const tolgeeNamespaceByGameSetting = Object.values(getAppSettings().gameSettings).map((setting) => setting.tolgeeNamespace);
const namespaces = ["SabaNumber", "Common", ...tolgeeNamespaceByGameSetting].filter((value, index, arr) => arr.indexOf(value) === index);
export const tolgee = Tolgee().use(FormatIcu()).use(BackendFetch()).init({
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    projectId: "5",
    ns: namespaces,
    defaultNs: "SabaNumber",
});

if (!getAppSettings().useTolgeeStatic) {
    tolgee.addPlugin(
        InContextTools({
            credentials: {
                apiUrl: process.env.REACT_APP_TOLGEE_API_URL,
                apiKey: process.env.REACT_APP_TOLGEE_API_KEY,
                projectId: "5",
            },
        })
    );
}
