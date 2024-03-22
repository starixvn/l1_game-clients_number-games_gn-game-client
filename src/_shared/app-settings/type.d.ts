import { GameBaseProps } from "../../components/shared/game-base/type";

interface ProxySetting {
    ssl: string;
    subDomain: string;
    path: string;
}

interface SentryOptions {
    dsn: string;
    environment: string;
}

export default interface AppSettings {
    serverDomainMapper: Array<string>;
    socketGatewayPath: string;
    proxy: ProxySetting;
    sentry: SentryOptions;
    gameSettings: { [id: string]: GameBaseProps };
    subGuideDomain: string;
    googleAnalyticId: string;
    enableMsgpackParser: boolean;
    system: string;
    appType: number;
    useTolgeeStatic: boolean;
    enableDebugLogs: boolean;
}
