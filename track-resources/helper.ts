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
