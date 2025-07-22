import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, Tolgee } from "@tolgee/react";
import { getAppSettings } from "./app-settings";

const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw", "ja"];
const tolgeeNamespaceByGameSetting = Object.values(getAppSettings().gameSettings)
    .map((setting) => setting.tolgeeNamespace)
    .filter((ns) => ns);
const namespaces = ["SabaNumber", "Common", ...tolgeeNamespaceByGameSetting].filter((value, index, arr) => arr.indexOf(value) === index);
export const tolgee = Tolgee().use(FormatIcu()).use(BackendFetch()).init({
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    projectId: "5",
    ns: namespaces,
    defaultNs: "SabaNumber",
});
