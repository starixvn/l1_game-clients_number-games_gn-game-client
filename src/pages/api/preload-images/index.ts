import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    const imagesDir = path.join(process.cwd(), "public/static", "images", "preload-resources");

    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return res.status(500).json(["Failed to read directory"]);
        }

        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ext === ".jpg" || ext === ".png" || ext === ".gif" || ext === ".webp";
        });

        return res.status(200).json(imageFiles);
    });
}
