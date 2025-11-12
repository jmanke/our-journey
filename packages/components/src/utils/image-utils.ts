import { parse } from "exifr";

export type LongLat = [number, number];

export async function readLongLatFromJpg(file: File | Blob): Promise<LongLat> {
  const exifData = await parse(file);
  if (
    typeof exifData?.latitude !== "number" ||
    typeof exifData?.longitude !== "number"
  ) {
    throw new Error("No GPS data found in EXIF metadata.");
  }

  return [exifData.longitude, exifData.latitude];
}
