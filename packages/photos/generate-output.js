const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const exifr = require("exifr");

const imagesPath = path.join(__dirname, "./images");
const outputPath = path.join(__dirname, "./output");
const baseUrl = "https://soft-cake-52a8.jeffman879.workers.dev";

async function cropCenterSquare(inputPath, outputPath, size = 200) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const minDim = Math.min(metadata.width, metadata.height);
  const left = Math.floor((metadata.width - minDim) / 2);
  const top = Math.floor((metadata.height - minDim) / 2);

  await image
    .extract({ left, top, width: minDim, height: minDim })
    .resize(size, size)
    .withMetadata()
    .toFile(outputPath);

  console.log("Cropped image saved to", outputPath);
}

async function deleteImagesWithoutGPS() {
  const files = fs.readdirSync(imagesPath);
  for (const file of files) {
    const filePath = path.join(imagesPath, file);
    try {
      const exif = await exifr.gps(filePath);
      if (!exif || exif.latitude == null || exif.longitude == null) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${file}`);
      } else {
        console.log(`Kept: ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
}

async function processImagesAndWriteList() {
  await deleteImagesWithoutGPS();

  const outputData = [];
  const files = fs.readdirSync(imagesPath);
  for (const file of files) {
    const inputPath = path.join(imagesPath, file);
    try {
      const exif = await exifr.gps(inputPath);
      const { name, ext } = path.parse(file);
      const thumbnailFilename = `${name}_thumbnail${ext}`;
      const outPath = path.join(outputPath, thumbnailFilename);
      outputData.push({
        src: `${baseUrl}/${file}`,
        thumbnailSrc: `${baseUrl}/${thumbnailFilename}`,
        longLat: [exif.longitude, exif.latitude],
      });
      await cropCenterSquare(inputPath, outPath, 250);
    } catch (err) {
      console.error(`${file}: error reading EXIF`, err);
    }
  }
  // Write the output file names to a JSON file
  const jsonArray = JSON.stringify(outputData, null, 2);
  fs.writeFileSync(path.join(outputPath, "photo-data.json"), jsonArray);
  console.log("Wrote photo-data.json with", outputData.length, "entries");
}

// Ensure output directory exists
if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output");
}

// Delete all files in ./output
fs.readdirSync("./output").forEach((file) => {
  const filePath = path.join("./output", file);
  if (fs.lstatSync(filePath).isFile()) {
    fs.unlinkSync(filePath);
  }
});

// Copy all files from ./images to ./output
fs.readdirSync("./images").forEach((file) => {
  const srcPath = path.join("./images", file);
  const destPath = path.join("./output", file);
  if (fs.lstatSync(srcPath).isFile()) {
    fs.copyFileSync(srcPath, destPath);
  }
});

processImagesAndWriteList();
