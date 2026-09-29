import { cloudinary, isCloudinaryConfigured } from "./cloudinary-client";
import { UploadApiResponse } from "cloudinary";

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  tags?: string;
  publicId?: string;
  isConfigured: boolean;
}

export class CloudinaryUploadService {
  /**
   * Generates official signed upload parameters for secure frontend direct uploads.
   * Never exposes CLOUDINARY_API_SECRET to the client.
   */
  static generateUploadSignature(params: {
    folder: string;
    tags?: string[];
    publicId?: string;
  }): SignedUploadParams {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "demo";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: params.folder,
    };

    if (params.tags && params.tags.length > 0) {
      paramsToSign.tags = params.tags.join(",");
    }

    if (params.publicId) {
      paramsToSign.public_id = params.publicId;
    }

    let signature = "";
    if (isCloudinaryConfigured && apiSecret) {
      signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    } else {
      // In unconfigured / mock mode, signature is clearly flagged
      signature = "UNCONFIGURED_DEMO_SIGNATURE";
    }

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder: params.folder,
      tags: params.tags ? params.tags.join(",") : undefined,
      publicId: params.publicId,
      isConfigured: isCloudinaryConfigured,
    };
  }

  /**
   * Directly uploads an image buffer to Cloudinary from server runtime.
   */
  static async uploadBuffer(
    buffer: Buffer,
    options: {
      folder: string;
      publicId?: string;
      resourceType?: "image" | "video" | "raw" | "auto";
      tags?: string[];
    }
  ): Promise<UploadApiResponse | null> {
    if (!isCloudinaryConfigured) {
      console.warn("Cloudinary credentials not configured. Using local / direct mock upload response.");
      return null;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          resource_type: options.resourceType || "auto",
          tags: options.tags,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      );
      uploadStream.end(buffer);
    });
  }
}
