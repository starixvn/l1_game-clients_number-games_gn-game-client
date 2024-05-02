import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from "node-cache";
import path from "path";
import { buildVersion } from "../../../_shared/constants";
import { getPathBanner, getPathIconGames, getPathImageGameId, pathImageMapping } from "../../../_shared/constants/resource-image-mapping";

const cacheImages = new NodeCache();

const DEFAULT_STATIC_PATH = "public/static/images/";
const DEFAULT_IMG_PATH = "/static/images/";

interface RequestBody {
    gameId: number;
    locale: string;
    gameIdsIcon: number[];
    bannerId: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    const { gameId, locale, gameIdsIcon, bannerId } = req.body as RequestBody;
    const pathsImg = getPathsImg(gameId, locale, bannerId, gameIdsIcon);
    const cacheKey = `${gameId}-${buildVersion}`;

    if (!Array.isArray(pathsImg)) {
        return res.status(400).json(["Invalid paths provided"]);
    }

    const cachedImageFiles = cacheImages.get<any>(cacheKey);

    if (cachedImageFiles) {
        return res.status(200).json(cachedImageFiles);
    }

    const imagesDir = path.join(process.cwd(), DEFAULT_STATIC_PATH);
    const imageFiles = [];
    for (const dirPath of pathsImg) {
        const imagePath = path.join(DEFAULT_IMG_PATH, dirPath);
        const ext = path.extname(imagePath).toLowerCase();

        if (ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp" || ext === ".svg") {
            const imageUrl = `${imagePath}?v=${buildVersion}`.replace(/\\/g, "/");
            imageFiles.push(imageUrl);
        } else {
            const dirToRead = path.join(imagesDir, dirPath);
            try {
                const files = fs.readdirSync(dirToRead);
                const validImageFiles = files.filter((file) => {
                    const ext = path.extname(file).toLowerCase();
                    return ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp" || ext === ".svg";
                });

                imageFiles.push(
                    ...validImageFiles.map((file) => path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${buildVersion}`).replace(/\\/g, "/"))
                );
            } catch (err) {
                console.error(`Error reading directory ${dirToRead}:`, err);
            }
        }
    }

    cacheImages.set(cacheKey, imageFiles);

    return res.status(200).json(imageFiles);
}

const getPathsImg = (gameId: number, currentLocale: string, bannerId: number, gameIdsIcon: number[]) => {
    if (gameId === 0) {
        return [...pathImageMapping.lobby, ...getPathBanner(currentLocale, bannerId), ...getPathIconGames(gameIdsIcon)];
    }

    if (gameId > 0) {
        return [...pathImageMapping.game, ...getPathImageGameId(gameId)];
    }

    return [];
};

const readFilesFromPath = (dirPath: string, imagesDir: string) => {
    const fullDirPath = path.join(imagesDir, dirPath);
    try {
        const files = fs.readdirSync(fullDirPath);
        const validImageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp" || ext === ".svg";
        });

        const filePaths = validImageFiles.map((file) =>
            path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${buildVersion}`).replace(/\\\\/g, "\\")
        );

        for (const file of files) {
            const subPath = path.join(dirPath, file);
            const fullPath = path.join(imagesDir, subPath);
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                filePaths.push(...readFilesFromPath(subPath, imagesDir));
            }
        }

        return filePaths;
    } catch (err) {
        console.error(`Error reading directory ${fullDirPath}:`, err);
        return [];
    }
};
