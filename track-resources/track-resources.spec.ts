import { test } from "@playwright/test";
import { trackDownloadResources } from "./helper";
test.setTimeout(70 * 1000);

test("should navigate to the about page", async ({ page, context }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto("https://gn-gamelobby-simulator.lumigame.com/signin?obCustId=1&appType=1");

    const loginLink = await page.locator('//*[@id="link-local"]/a').getAttribute("href");
    console.log(loginLink);
    await page.goto(loginLink);

    console.log("Track download resource");

    await trackDownloadResources(page);

    await page.waitForTimeout(60 * 1000);

});
