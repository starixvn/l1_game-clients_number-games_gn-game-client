import { Server, WebSocket } from "mock-socket";
import { delay, HttpResponse } from "msw";

import { expect, test } from "./handlers/test";

test("has title", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Click the get started link.
    await page.getByRole("link", { name: "Get started" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible();
});

test.describe.parallel("A demo of playwright-msw's functionality", () => {
    test("should use the default handlers without requiring handlers to be specified on a per-test basis", async ({
        page,
        worker,
        http,
    }) => {
        const fakeURL = "wss://gn-proxy.lumigame.com/sicball";
        const url = "https://gn-proxy.lumigame.com/user/sicball";
        const mockServer = new Server(fakeURL);

        // mockServer.on("sicball",(socket)=>{
        //     console.log("sicball");

        // })
        mockServer.on("connection", (socket) => {
            console.log("on connect to socket");

            socket.on("message", (data) => {
                console.log(`data: ${JSON.stringify(data)}`);

                if (typeof data !== "string") {
                    return;
                }

                console.log(data.toString());
                // socket.send("test message from mock server");
            });

            socket.on("close", () => {
                console.log("WS close");
            });

            socket.on("error", (error) => {
                console.log(`WS error:${JSON.stringify(error)}`);
            });
        });
        const app = new GameService(fakeURL);
        // app.sendMessage("test message from app");

        await worker.use(
            // http.post(`/user/auth/balance`, async () => {
            //     await delay(250);
            //     return HttpResponse.json({
            //         errorCode: "0",
            //         message: null,
            //         umInfo: null,
            //         isSuccessful: true,
            //         isUM: false,
            //         balance: 2000,
            //         scoins: 0,
            //         availableSpins: 0,
            //     });
            // })
        );
        await page.waitForTimeout(2 * 1000);

        await page.goto("/?token=x&lang=en-US&gameId=0&ref=&rurl=&op=SP");

        await page.waitForTimeout(10 * 1000);
        mockServer.stop();
        mockServer.close();
        // await expect(page).toHaveURL("timeout");
    });

    test.only("should allow mocks to be overridden on a per test basis", async ({ page, worker, http }) => {
        await worker.use(
            http.get("/api/users", async () => {
                await delay(250);
                return new HttpResponse(null, {
                    status: 403,
                });
            })
        );
        await page.goto("/");
        await expect(page.locator('text="Alessandro Metcalfe"')).toBeHidden();
        await expect(page.locator('text="Failed to load users"')).toBeVisible();
    });
});
class GameService {
    private connection: WebSocket;
    private messages;
    constructor(url) {
        this.messages = [];
        this.connection = new WebSocket(url);

        this.connection.onmessage = (event) => {
            // this.messages.push(data);
            console.log(event.data);
        };
    }

    sendMessage(message) {
        this.connection.send(message);
    }
}
