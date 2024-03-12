import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../resources";

export const useTranslator = (gameNamespaces?: string[]) => {
    const defaultNamespaces = [ResourceTypes.SABA_NUMBER, ResourceTypes.COMMON];
    const ns = gameNamespaces ? gameNamespaces.concat(defaultNamespaces) : defaultNamespaces;
    const translator = useTranslate(ns);
    const t = (key: string, params?: any, opt?: any) => {
        if (key.includes(".")) {
            const ns = key.split(".")[0];
            const k = key.split(".")[1];
            return translator.t({ key: k, ns, params, ...opt });
        } else {
            return translator.t({ key, params, ...opt });
        }
    };
    return { t };
};

export const useCommonTranslate = () => {
    return useTranslate(ResourceTypes.COMMON);
};

export const useSNTranslate = () => {
    return useTranslate(ResourceTypes.SABA_NUMBER);
};
