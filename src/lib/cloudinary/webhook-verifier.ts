import { cloudinary, isCloudinaryConfigured } from "./cloudinary-client";

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: string;
}

export class CloudinaryWebhookVerifier {
  /**
   * Verifies incoming Cloudinary webhook notifications using the official SDK method:
   * cloudinary.v2.utils.verifyNotificationSignature(body, timestamp, signature, valid_for)
   */
  static verify(params: {
    rawBody: string;
    timestamp: number;
    signature: string;
    validForSeconds?: number;
  }): WebhookVerificationResult {
    if (!isCloudinaryConfigured) {
      // In development / demo mode when secrets are not configured, allow with explicit log
      console.warn("Cloudinary not configured with API secret; webhook signature verification bypassed for local demo.");
      return { isValid: true };
    }

    if (!params.signature || !params.timestamp) {
      return {
        isValid: false,
        reason: "Missing X-Cld-Signature or X-Cld-Timestamp header in notification request.",
      };
    }

    try {
      const isValid = cloudinary.utils.verifyNotificationSignature(
        params.rawBody,
        params.timestamp,
        params.signature,
        params.validForSeconds || 3600 // 1 hour replay window
      );

      if (!isValid) {
        return {
          isValid: false,
          reason: "Cryptographic signature does not match computed payload hash or timestamp expired.",
        };
      }

      return { isValid: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        isValid: false,
        reason: `Webhook verification error: ${errorMessage}`,
      };
    }
  }
}
