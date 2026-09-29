import exifr from "exifr";
import sharp from "sharp";

export interface ExtractedMetadata {
  captureTimestamp: Date | null;
  captureTimestampRaw: string | null;
  gpsLat: number | null;
  gpsLon: number | null;
  gpsAltitude: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lensModel: string | null;
  focalLength: number | null;
  fNumber: number | null;
  iso: number | null;
  exposureTime: string | null;
  orientation: number | null;
  softwareMetadata: string | null;
  hasEditingSoftwareSignature: boolean;
  width: number | null;
  height: number | null;
  format: string | null;
  colorSpace: string | null;
  rawExifJson: Record<string, unknown>;
}

const EDITING_SOFTWARE_KEYWORDS = [
  "photoshop",
  "lightroom",
  "gimp",
  "canva",
  "snapseed",
  "picsart",
  "pixlr",
  "affinity",
  "paint.net",
  "after effects",
  "blender",
  "stable diffusion",
  "midjourney",
  "dall-e",
];

export async function extractExifAndMetadata(buffer: Buffer): Promise<ExtractedMetadata> {
  let exifData: Record<string, unknown> = {};
  let dimensions: { width?: number; height?: number; format?: string } = {};

  try {
    const imgInfo = await sharp(buffer).metadata();
    dimensions = {
      width: imgInfo.width,
      height: imgInfo.height,
      format: imgInfo.format,
    };
  } catch (err) {
    console.warn("Could not read image dimensions via sharp:", err);
  }

  try {
    // Parse complete EXIF, GPS, TIFF, and XMP tags
    const parsed = await exifr.parse(buffer, {
      tiff: true,
      xmp: true,
      icc: true,
      jfif: true,
      ihdr: true,
      gps: true,
    });
    if (parsed) {
      exifData = parsed;
    }
  } catch (err) {
    console.warn("EXIF extraction notice (metadata absent or format unparseable):", err);
  }

  // Parse GPS coordinates safely
  let gpsLat: number | null = null;
  let gpsLon: number | null = null;
  let gpsAltitude: number | null = null;

  if (typeof exifData.latitude === "number" && !isNaN(exifData.latitude)) {
    gpsLat = exifData.latitude;
  }
  if (typeof exifData.longitude === "number" && !isNaN(exifData.longitude)) {
    gpsLon = exifData.longitude;
  }
  if (typeof exifData.altitude === "number" && !isNaN(exifData.altitude)) {
    gpsAltitude = exifData.altitude;
  }

  // Parse Capture Timestamp
  let captureTimestamp: Date | null = null;
  let captureTimestampRaw: string | null = null;
  const dateCandidates = [
    exifData.DateTimeOriginal,
    exifData.CreateDate,
    exifData.ModifyDate,
    exifData.DateCreated,
  ];

  for (const candidate of dateCandidates) {
    if (candidate instanceof Date && !isNaN(candidate.getTime())) {
      captureTimestamp = candidate;
      captureTimestampRaw = candidate.toISOString();
      break;
    } else if (typeof candidate === "string" && candidate.trim()) {
      const parsedDate = new Date(candidate);
      if (!isNaN(parsedDate.getTime())) {
        captureTimestamp = parsedDate;
        captureTimestampRaw = candidate;
        break;
      }
    }
  }

  // Software signature detection
  const software = typeof exifData.Software === "string" ? exifData.Software.trim() : null;
  let hasEditingSoftwareSignature = false;
  if (software) {
    const lower = software.toLowerCase();
    hasEditingSoftwareSignature = EDITING_SOFTWARE_KEYWORDS.some((kw) => lower.includes(kw));
  }

  return {
    captureTimestamp,
    captureTimestampRaw,
    gpsLat,
    gpsLon,
    gpsAltitude,
    cameraMake: typeof exifData.Make === "string" ? exifData.Make.trim() : null,
    cameraModel: typeof exifData.Model === "string" ? exifData.Model.trim() : null,
    lensModel: typeof exifData.LensModel === "string" ? exifData.LensModel.trim() : null,
    focalLength: typeof exifData.FocalLength === "number" ? exifData.FocalLength : null,
    fNumber: typeof exifData.FNumber === "number" ? exifData.FNumber : null,
    iso: typeof exifData.ISO === "number" ? exifData.ISO : null,
    exposureTime: exifData.ExposureTime ? String(exifData.ExposureTime) : null,
    orientation: typeof exifData.Orientation === "number" ? exifData.Orientation : null,
    softwareMetadata: software,
    hasEditingSoftwareSignature,
    width: dimensions.width || (typeof exifData.ExifImageWidth === "number" ? exifData.ExifImageWidth : null),
    height: dimensions.height || (typeof exifData.ExifImageHeight === "number" ? exifData.ExifImageHeight : null),
    format: dimensions.format || null,
    colorSpace: typeof exifData.ColorSpace === "string" ? exifData.ColorSpace : null,
    rawExifJson: exifData,
  };
}
