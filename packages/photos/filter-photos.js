const fs = require("fs");
const path = require("path");
const exifr = require("exifr");

const imagesDir = path.join(__dirname, "images");

async function deleteImagesWithoutGPS() {
  const files = fs.readdirSync(imagesDir);
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
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

deleteImagesWithoutGPS();
