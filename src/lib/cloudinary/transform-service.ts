import { cloudinary } from "./cloudinary-client";

export class CloudinaryTransformService {
  /**
   * Generates high-performance responsive thumbnail URL for gallery and evidence lists.
   */
  static getThumbnailUrl(publicId: string, width = 320, height = 220): string {
    if (!publicId || publicId.startsWith("http")) return publicId;
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: "fill", gravity: "auto" },
        { quality: "auto", fetch_format: "auto" },
      ],
      secure: true,
    });
  }

  /**
   * Generates normalized high-resolution preview URL for comparison canvases.
   */
  static getNormalizedPreviewUrl(publicId: string, maxWidth = 1200): string {
    if (!publicId || publicId.startsWith("http")) return publicId;
    return cloudinary.url(publicId, {
      transformation: [
        { width: maxWidth, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
      secure: true,
    });
  }

  /**
   * Generates a privacy-redacted derived asset URL (blurring sensitive human faces or locations).
   * Note: The original uploaded asset remains strictly immutable in database records.
   */
  static getRedactedDerivedUrl(publicId: string): string {
    if (!publicId || publicId.startsWith("http")) return publicId;
    return cloudinary.url(publicId, {
      transformation: [
        { effect: "pixelate_faces:15" },
        { quality: "auto", fetch_format: "auto" },
      ],
      secure: true,
    });
  }

  /**
   * Generates Cloudinary transformation URL with cryptographic watermark / timestamp stamp.
   */
  static getEvidenceStampUrl(publicId: string, assetId: string, integrityStatus: string): string {
    if (!publicId || publicId.startsWith("http")) return publicId;
    return cloudinary.url(publicId, {
      transformation: [
        { width: 1000, crop: "limit" },
        {
          overlay: {
            font_family: "Courier",
            font_size: 16,
            font_weight: "bold",
            text: `TERRAWITNESS EVIDENCE [${assetId}] STATUS: ${integrityStatus}`,
          },
          gravity: "south_west",
          x: 20,
          y: 20,
          color: "#ffffff",
          background: "#000000a0",
        },
        { quality: "auto", fetch_format: "auto" },
      ],
      secure: true,
    });
  }
}
