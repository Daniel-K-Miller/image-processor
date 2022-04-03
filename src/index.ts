import jimp from "jimp";

import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, "../assets");

const unprocessedPath = path.join(assetsDir, "/unprocessed");
const processedPath = path.join(assetsDir, "/processed");

const validFileExtensions = ["png", "jpg", "jpeg", "bmp"];

let sizes = [1920, 200];
let quality = 60;

const fileTasks: Array<Promise<void>> = []; // populated below

//#region processImage
function processImage(
  srcPath: string,
  outRoot: string,
  fileName: string,
  fileExtension: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const resizeTasks = [];

    try {
      sizes.forEach((width: number) => {
        console.log(`STARTED: ${srcPath}`);
        jimp.read(srcPath, (err, img) => {
          if (err) throw err;

          const aspectRatio = img.getHeight() / img.getWidth();

          const task = new Promise<void>((resolve, reject) => {
            try {
              const height = Math.round(width * aspectRatio);
              const outPath = `${outRoot}/${fileName}/${width}.${fileExtension}`;
              img.resize(width, height).quality(quality).write(outPath);
              console.log(
                `SUCCESSFULLY CREATED: ${outPath} @ ${width}x${height}`
              );
              resolve();
            } catch (err) {
              reject(err.message);
            }
          });

          resizeTasks.push(task);
        });

        Promise.all(resizeTasks);
      });
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}
//#endregion

//#region processDir
function processDir(rootPath: string): void {
  //process dir
  fs.readdir(rootPath, (err, items) => {
    if (err) throw new Error(err.message);

    // look through contents
    items.forEach((item) => {
      const fullPath = path.join(rootPath, `/${item}`);

      // if folder - start recursion
      if (!item.includes(".")) return processDir(fullPath);

      // exclude zone identifiers
      if (item.includes(":Zone.Identifier")) return;

      const split = item.split(".");

      // extension validation
      if (!validFileExtensions.includes(split[1]))
        throw new Error(`invalid files extension of ${split[1]}`);

      fileTasks.push(
        processImage(
          `${rootPath}/${item}`,
          `${rootPath.replace(unprocessedPath, processedPath)}`,
          split[0],
          split[1]
        )
      );
    });
  });
}
//#endregion

//#region processImages
function processImages() {
  if (!Array.isArray(sizes) || sizes.length === 0)
    throw new Error("2nd arg SIZES is INVALID");

  console.log("Image processor started...");
  const startTime = Date.now();

  // start
  processDir(unprocessedPath);

  // exit if no tasks
  if (fileTasks.length === 0) return;

  // process all tasks
  Promise.all(fileTasks).then((data) => {
    console.log("************************************************");
    console.log(
      `Image processor finished - time taken: ${Math.floor(
        (Date.now() - startTime) / 1000
      )}s`
    );
    console.log("************************************************");
  });
}
//#endregion

//#region initialise
function initialise() {
  try {
    const argQuality = Number.parseInt(process.argv[2]);

    if (argQuality != null) {
      quality = argQuality;
    }

    // set desired sizes from argument
    const argsSizes = process.argv.slice(3, process.argv.length);

    if (argsSizes.length !== 0)
      sizes = argsSizes.map((string: string) => Number.parseInt(string));

    // starts processing
    processImages();
  } catch (err) {
    console.log(err.message);
    return;
  }
}
//#endregion

initialise();
