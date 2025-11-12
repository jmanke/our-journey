const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

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

fs.readdirSync("./images").forEach((file) => {
  console.log(file);
  const outputFileName = path.parse(file).name;
  const extension = path.parse(file).ext;
  cropCenterSquare(
    `./images/${file}`,
    `./output/${outputFileName}_thumbnail${extension}`,
    250
  );
});
