import { getAppSettings } from "../app-settings";

interface chip {
    [key: number]: string;
}

export interface BetOptionData {
    betChoice: string;
    odds: number;
    totalStakes?: number;
    players?: number;
    percent?: number;
}

export interface RoundResultData {
    betChoiceShort: string;
    color: string;
    count: number;
}

export const systemName = getAppSettings().system.toLocaleLowerCase();

export const ChipMapper = {
    gn: {
        "1": "chip-1",
        "5": "chip-2",
        "10": "chip-3",
        "20": "chip-4",
        "50": "chip-5",
        "100": "chip-6",
        "200": "chip-7",
        "500": "chip-8",
        "1000": "chip-9",
        "2000": "chip-10",
        "3000": "chip-11",
        "5000": "chip-12",
    },
};

export const ChipLabelMapper = {
    gn: {
        1: "1",
        5: "5",
        10: "10",
        50: "50",
        100: "100",
        200: "200",
        500: "500",
        1000: "1k",
        2000: "2k",
        3000: "3k",
    },
};

const ChipValues = {
    gn: [1, 5, 10, 50, 100, 200, 500, 1000, 2000, 3000],
};

export const ChipValuesBySystem = ChipValues[systemName];

export const locales = { en: "en", vi: "vi", th: "th", id: "id", zh_cn: "zh_cn", zh_tw: "zh_tw" };

export const languageMapper = { "en-US": "en", "vi-VN": "vi", "th-TH": "th", "id-ID": "id", "zh-CN": "zh_cn", "zh-TW": "zh_tw" };

export const LanguageLocaleMapper = {
    en: "en-US",
    vi: "vi-VN",
    th: "th-TH",
    id: "id-ID",
    zh_cn: "zh-CN",
    zh_tw: "zh-TW",
};

export const languageNameMapper = { en: "English", vi: "Tiếng Việt" };

export const Themes = {
    light: "light",
};

export const sabaMobileName = "Saba.mobi";
export const sabaClubName = "Saba.games";
export const vGamingMobileName = "Vgaming Mobi";
export const vGamingName = "Vgaming";

export const buildVersion = process.env.buildVersion;
export const AppTypes = {
    mobile: 1,
};
