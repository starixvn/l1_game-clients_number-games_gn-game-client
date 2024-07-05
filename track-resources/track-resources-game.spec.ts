import { Page, test } from "@playwright/test";
import { convertToMb } from "./helper";
test.setTimeout(2 * 60 * 1000);

test("track download resource game", async ({ page, context }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("https://gn-gamelobby-simulator.lumigame.com/signin?obCustId=1&appType=1");

    //Change game for change test game
    const games = {
        bacBall: {
            gameName: "Bac Ball 1",
            wsName: "bacball",
        },
        luckNext: {
            gameName: "Lucky Next 1",
            wsName: "luckynext",
        },
        luckyThree: {
            gameName: "Lucky Three",
            wsName: "luckythree",
        },
        seBall: {
            gameName: "Se Ball",
            wsName: "seball",
        },
        sicBall: {
            gameName: "Sic Ball",
            wsName: "sicball",
        },
    };

    const game = games.sicBall;

    const gameName = game.gameName;
    const wsName = game.wsName;
    console.log(`Track resource ${gameName}`);
    await page.getByText("Advance", { exact: true }).click();

    await page.getByLabel("Game", { exact: true }).selectOption({ label: gameName });

    // await page.click('option[value="1000"]');

    await page.click("input#get-token");
    await page.waitForTimeout(2 * 1000);

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
            if (ws.url().includes(wsName)) {
                console.log(`Start to load game ${gameName} after : ${Date.now() - startTime} ms`);
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
                    }
                    totalDownloadSize += resourceSize;
                }
            } catch (error) {
                console.log(`Error load file ${request.url()}`);
            }
        });
    };

    await trackDownloadResources(page);

    await page.waitForTimeout(35 * 1000);

    console.log(`Current total download: ${convertToMb(totalDownloadSize)} MB`);
    console.log(`Big size total: ${convertToMb(totalDownloadBigFileSize)} MB - ${bigFiles.length} files`);
});
