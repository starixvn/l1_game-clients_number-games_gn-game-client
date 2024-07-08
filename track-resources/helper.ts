import { Page } from "@playwright/test";

export const trackDownloadResources = async (page: Page) => {
    // const bigSize = 500_000;
    const bigSize = 1000;
    let bigFiles = [];
    let totalDownloadSize = 0;
    page.on("request", async (request) => {
        try {
            const response = await request.response();

            if (response) {
                const content = await response.body();
                const resourceSize = content.byteLength;
                const contentType = response.headers()["content-type"];

                if (resourceSize > bigSize) {
                    const file = `${request.url()} - File type: ${contentType} - size: ${convertToMb(resourceSize)} MB`;
                    console.log(file);
                    bigFiles.push(file);
                }
                totalDownloadSize += resourceSize;
                console.log(`Current total download: ${convertToMb(totalDownloadSize)} MB`);
            }
        } catch (error) {
            console.log(`Error load file ${request.url()}`);
        }
    });
};
export const convertToMb = (size: number) => {
    return (size / 1000 / 1000).toFixed(4);
};

export type NetworkThrottling = {
    download: number;
    upload: number;
    latency: number;
};

export enum NetworkType {
    Regular3G = "Regular3G",
    Good3G = "Good3G",
    Regular4G = "Regular4G",
    Wifi = "Wifi",
}

export type Network = {
    Regular3G: NetworkThrottling;
    Good3G: NetworkThrottling;
    Regular4G: NetworkThrottling;
    Wifi: NetworkThrottling;
};

export const Network: Network = {
    Regular3G: {
        download: 750 * 1000,
        upload: 250 * 1000,
        latency: 100,
    },
    Good3G: {
        download: 1000 * 1000,
        upload: 750 * 1000,
        latency: 40,
    },
    Regular4G: {
        download: 4 * 1000 * 1000,
        upload: 3 * 1000 * 1000,
        latency: 20,
    },
    Wifi: {
        download: 30 * 1000 * 1000,
        upload: 15 * 1000 * 1000,
        latency: 2,
    },
};

export const configNetworkThrottling = async (page: Page, networkThrottling: NetworkThrottling) => {
    const client = await page.context().newCDPSession(page); // enable network emulation
    await client.send("Network.enable"); // change network conditions with specific params
    await client.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: networkThrottling.download,
        uploadThroughput: networkThrottling.upload,
        latency: networkThrottling.latency,
    });
};
