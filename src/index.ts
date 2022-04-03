import jimp from "jimp";

import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, "../assets");

const unprocessedPath = path.join(assetsDir, "/unprocessed");
const compressedPath = path.join(assetsDir, "/processed");

let sizes = [1920, 200];

function initialise() {
  try {
    // set desired sizes from argument
    if (sizes == null) {
      const stringSizes = process.argv.slice(2, process.argv.length);

      sizes = stringSizes.map((string: string) => Number.parseInt(string));
    }
    // starts processing
    processImages();
  } catch (err) {
    console.log(err.message);
    return;
  }
}

function processImages() {
  const validFileExtensions = ["png", "jpg", "jpeg", "bmp"];

  if (!Array.isArray(sizes) || sizes.length === 0)
    throw new Error("2nd arg SIZES is INVALID");

  const tasks = []; // populated below

  fs.readdir(unprocessedPath, (err, folders) => {
    if (err) throw new Error(err.message);

    // folders
    folders.forEach((folder) => {
      const filePath = path.join(unprocessedPath, `/${folder}`);

      fs.readdir(filePath, (err, files) => {
        files.forEach((file) => {
          const split = file.split(".");

          // extension validation
          if (!validFileExtensions.includes(split[1]))
            throw new Error(`invalid files extension of ${split[1]}`);

          tasks.push(
            processImage(`${filePath}/${file}`, folder, split[0], split[1])
          );
        });
      });
    });
  });

  // exit if no tasks
  if (tasks.length === 0) return;

  // process all tasks
  Promise.all(tasks);
}

function processImage(
  path: string,
  folderName: string,
  fileName: string,
  fileExtension: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const tasks = [];

    try {
      sizes.forEach((size: number) => {
        jimp.read(path, (err, img) => {
          if (err) throw err;

          const aspectRatio = img.getHeight() / img.getWidth();

          const task = new Promise<void>((resolve, reject) => {
            try {
              img
                .resize(size, size * aspectRatio)
                .quality(60)
                .write(
                  `${compressedPath}/${folderName}/${fileName}/${size}.${fileExtension}`
                );
              resolve();
            } catch (err) {
              reject(err.message);
            }
          });

          tasks.push(task);
        });

        Promise.all(tasks);
      });
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

initialise();
