import { test as base, expect } from "@playwright/test";
import { http } from "msw";
import type { MockServiceWorker } from "playwright-msw";
import { createWorkerFixture } from "playwright-msw";

import handlers from "./handlers";

const test = base.extend<{
    worker: MockServiceWorker;
    http: typeof http;
}>({
    worker: createWorkerFixture(handlers),
    http,
});
const newTest = base.extend({
    login: async ({ page }, use) => {
        await page.addInitScript(() => {
            (window as any).envConfig = {
                serverDomainMapper: {
                    localhost: "lumigame.com",
                },
                proxy: {
                    ssl: true,
                    subDomain: "gn-proxy",
                    path: "",
                },
                sentry: {
                    dsn: "",
                    environment: "",
                    tracesSampleRate: 1,
                },
                enableSourceMap: true,
                subGuideDomain: "gn-guide",
                enableMsgpackParser: false,
                system: "GN",
                appType: 1,
                useTolgeeStatic: false,
                enableDebugLogs: true,
                socketGatewayPath: "gateway",
            };
        });
        await use(page); //runs test here
        //logic after test
    },
});

export { expect, newTest, test };

