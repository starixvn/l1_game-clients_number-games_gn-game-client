import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const DEFAULT_STATIC_PATH = "public/static/images/";
const DEFAULT_IMG_PATH = "/static/images/";

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    const { paths } = req.query;
    const parsedPaths = typeof paths === "string" ? JSON.parse(paths) : paths;

    if (!Array.isArray(parsedPaths)) {
        return res.status(400).json(["Invalid paths provided"]);
    }

    const imagesDir = path.join(process.cwd(), DEFAULT_STATIC_PATH);
    const imageFiles = [];
    for (const dirPath of parsedPaths) {
        const dirToRead = path.join(imagesDir, dirPath);

        try {
            const files = fs.readdirSync(dirToRead);
            const validImageFiles = files.filter((file) => {
                const ext = path.extname(file).toLowerCase();
                return ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp" || ext === ".svg";
            });

            imageFiles.push(
                ...validImageFiles.map((file) =>
                    path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${process.env.buildVersion}`).replace(/\\\\/g, "\\")
                )
            );
        } catch (err) {
            console.error(`Error reading directory ${dirToRead}:`, err);
        }
    }

    return res.status(200).json(imageFiles);
}

const readFilesFromPath = (dirPath: string, imagesDir: string) => {
    const fullDirPath = path.join(imagesDir, dirPath);
    try {
        const files = fs.readdirSync(fullDirPath);
        const validImageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp" || ext === ".svg";
        });

        const filePaths = validImageFiles.map((file) =>
            path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${process.env.buildVersion}`).replace(/\\\\/g, "\\")
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
