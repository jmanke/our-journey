import { gps } from "exifr";

export type LongLat = [number, number];

export async function readLongLatFromJpg(file: File | Blob): Promise<LongLat> {
  const gpsData = await gps(file);
  if (
    typeof gpsData?.latitude !== "number" ||
    typeof gpsData?.longitude !== "number"
  ) {
    throw new Error("No GPS data found in EXIF metadata.");
  }

  return [gpsData.longitude, gpsData.latitude];
}
