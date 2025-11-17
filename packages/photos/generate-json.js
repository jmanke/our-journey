const cloudinary = require("cloudinary");
const axios = require("axios");
const exifr = require("exifr");

require("dotenv").config();

cloudinary.config({
  cloud_name: "dxhgsvp7b",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

function photoFilename(filename) {
  const val = filename.split("_");
  val.pop();
  return val.join("_");
}

async function getLongLatFromUrl(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const gps = await exifr.gps(buffer);

  return [gps.longitude, gps.latitude];
}

async function getAssets() {
  const fs = require("fs");
  const photos = await cloudinary.v2.search
    .expression("folder:Alondra_and_Jeff/Photos/*")
    .max_results(10000)
    .execute();

  const thumbnails = await cloudinary.v2.search
    .expression("folder:Alondra_and_Jeff/Thumbnails/*")
    .max_results(10000)
    .execute();

  const photoData = await Promise.all(
    photos.resources.map(async (photo) => {
      const longLat = await getLongLatFromUrl(photo.url);

      const filename = photoFilename(photo.filename);
      const thumbnail = thumbnails.resources.find((thumbnail) =>
        thumbnail.filename.includes(filename)
      );

      return {
        src: photo.url,
        thumbnailSrc: thumbnail ? thumbnail.url : null,
        longLat,
      };
    })
  );

  fs.writeFileSync(
    "./output/photo-data.json",
    JSON.stringify(photoData, null, 2)
  );
  console.log("Wrote ./output/photo-data.json with", photoData.length, "items");
}

getAssets();
