const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const exifr = require("exifr");

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

async function processImagesAndWriteList() {
  const outputFiles = [];
  const files = fs.readdirSync("./images");
  for (const file of files) {
    const inputPath = `./images/${file}`;
    try {
      const exif = await exifr.gps(inputPath);
      if (exif && exif.latitude != null && exif.longitude != null) {
        console.log(`${file}: has GPS (${exif.latitude}, ${exif.longitude})`);
        const outputFileName = path.parse(file).name;
        const extension = path.parse(file).ext;
        const outputPath = `./output/${outputFileName}_thumbnail${extension}`;
        outputFiles.push(`${outputFileName}_thumbnail${extension}`);
        await cropCenterSquare(
          inputPath,
          outputPath,
          250
        );
      } else {
        console.log(`${file}: skipped (no GPS data)`);
      }
    } catch (err) {
      console.error(`${file}: error reading EXIF`, err);
    }
  }
  // Write the output file names to a JS file as an array
  const jsArray = `// Auto-generated list of output photo thumbnails\nmodule.exports = [\n${outputFiles.map(f => `  \"${f}\"`).join(",\n")}\n];\n`;
  fs.writeFileSync("./output/photo-thumbnails.js", jsArray);
  console.log("Wrote ./output/photo-thumbnails.js with", outputFiles.length, "entries");
}

processImagesAndWriteList();
