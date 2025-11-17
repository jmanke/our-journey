const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const exifr = require("exifr");

const assetsPath = path.join(__dirname, "../../assets");
const baseUrl =
  "https://media.githubusercontent.com/media/jmanke/our-journey/refs/heads/main/assets";

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

if (fs.existsSync("./output") === false) {
  fs.mkdirSync("./output");
}

async function deleteImagesWithoutGPS() {
  const files = fs.readdirSync(path.join(assetsPath, "photos"));
  for (const file of files) {
    const filePath = path.join(assetsPath, "photos", file);
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
  const files = fs.readdirSync(path.join(assetsPath, "photos"));
  for (const file of files) {
    const inputPath = path.join(assetsPath, "photos", file);
    try {
      const exif = await exifr.gps(inputPath);
      console.log(`${file}: has GPS (${exif.latitude}, ${exif.longitude})`);
      const outputPath = path.join(assetsPath, "thumbnails", file);
      outputData.push({
        src: `${baseUrl}/photos/${file}`,
        thumbnailSrc: `${baseUrl}/thumbnails/${file}`,
        longLat: [exif.longitude, exif.latitude],
      });
      await cropCenterSquare(inputPath, outputPath, 250);
    } catch (err) {
      console.error(`${file}: error reading EXIF`, err);
    }
  }
  // Write the output file names to a JSON file
  const jsonArray = JSON.stringify(outputData, null, 2);
  fs.writeFileSync(path.join(assetsPath, "photo-data.json"), jsonArray);
  console.log("Wrote photo-data.json with", outputData.length, "entries");
}

processImagesAndWriteList();
