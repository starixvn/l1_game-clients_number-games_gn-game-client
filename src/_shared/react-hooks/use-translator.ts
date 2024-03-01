import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../resources";

export const useTranslator = (gameNamespaces?: string[]) => {
    const defaultNamespaces = [ResourceTypes.SABANUMBER, ResourceTypes.COMMON];
    const ns = gameNamespaces ? gameNamespaces.concat(defaultNamespaces) : defaultNamespaces;
    const translator = useTranslate(ns);
    const t = (key: string, params?: any) => {
        if (key.includes(".")) {
            const ns = key.split(".")[0];
            const k = key.split(".")[1];
            return translator.t({ key: k, ns, params });
        } else {
            return translator.t({ key, params });
        }
    };
    return { t };
};

export const useCommonTranslate = () => {
    return useTranslate(ResourceTypes.COMMON);
};

export const useSNTranslate = () => {
    return useTranslate(ResourceTypes.SABANUMBER);
};
