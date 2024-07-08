import { Page, test } from "@playwright/test";
import { configNetworkThrottling, convertToMb } from "./helper";
test.setTimeout(2 * 60 * 1000);

test("track download resource splash screen, lobby", async ({ page, context }) => {
    const enableThrottlingNetwork = true;

    if (enableThrottlingNetwork) {
        configNetworkThrottling(page);
    }

    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("https://gn-gamelobby-simulator.lumigame.com/signin?obCustId=1&appType=1");

    const loginLink = await page.locator('//*[@id="link-local"]/a').getAttribute("href");
    console.log(loginLink);
    await page.goto(loginLink);
    console.log(`start loading splash screen`);
    const startTime = Date.now();

    let bigFiles = [];

    let totalDownloadSize = 0;
    let totalDownloadBigFileSize = 0;

    const trackDownloadResources = async (page: Page) => {
        const bigSize = 1000;
        page.on("websocket", (ws) => {
            if (ws.url().includes("gateway/socket")) {
                console.log(`Loading splash screen: ${Date.now() - startTime} ms`);

                console.log(`connect to socket ${ws.url()}`);
                console.log(`Total lobby download: ${convertToMb(totalDownloadSize)} MB`);
                console.log(`Big size before lobby total: ${convertToMb(totalDownloadBigFileSize)} MB - ${bigFiles.length} files`);
            }
        });
        page.on("request", async (request) => {
            try {
                const response = await request.response();

                if (response) {
                    const content = await response.body();
                    const resourceSize = content.byteLength;
                    const contentType = response.headers()["content-type"];
                    const notTolgee = !request.url().includes("tolgee");
                    const notRequestToUserService = !request.url().includes("/user/");
                    const notRequestToSongFile = !request.url().includes("/sounds/bg-music/");

                    if (resourceSize > bigSize && notTolgee && notRequestToUserService && notRequestToSongFile) {
                        const file = ` ${convertToMb(resourceSize)} MB - ${request.url()} - File type: ${contentType}`;
                        bigFiles.push(file);
                        totalDownloadBigFileSize += resourceSize;

                        console.log(`${file}`);
                        // console.log(`${convertToMb(resourceSize)}`);
                    }
                    totalDownloadSize += resourceSize;
                }
            } catch (error) {
                console.log(`Error load file ${request.url()}`);
            }
        });
    };

    await trackDownloadResources(page);

    await page.waitForTimeout(10 * 1000);

    console.log(`Current total download: ${convertToMb(totalDownloadSize)} MB`);
    console.log(`Big size total: ${convertToMb(totalDownloadBigFileSize)} MB - ${bigFiles.length} files`);
});
