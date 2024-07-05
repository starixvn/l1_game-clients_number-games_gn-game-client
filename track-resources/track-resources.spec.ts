import { Page, test } from "@playwright/test";
import { convertToMb } from "./helper";
test.setTimeout(2 * 60 * 1000);

test("should navigate to the about page", async ({ page, context }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("https://gn-gamelobby-simulator.lumigame.com/signin?obCustId=1&appType=1");

    const loginLink = await page.locator('//*[@id="link-local"]/a').getAttribute("href");
    console.log(loginLink);
    await page.goto(loginLink);
    const startTime = Date.now();
    console.log(`start loading ${startTime}`);

    const GetLobbyBackgroundAppear = async () => (await page.locator("/html/body").getAttribute("class")) === "galaxy-bg";
    console.log("Track download resource");

    let bigFiles = [];

    let totalDownloadSize = 0;
    let totalDownloadBigFileSize = 0;

    const trackDownloadResources = async (page: Page) => {
        const bigSize = 1000;
        page.on("websocket", (ws) => {
            if (ws.url().includes("gateway/socket")) {
                console.log(`Start load lobby ${Date.now() - startTime}`);

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

                    if (resourceSize > bigSize && notTolgee && notRequestToUserService) {
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

    await page.waitForTimeout(20 * 1000);

    console.log(`Current total download: ${convertToMb(totalDownloadSize)} MB`);
    console.log(`Big size total: ${convertToMb(totalDownloadBigFileSize)} MB - ${bigFiles.length} files`);
});
