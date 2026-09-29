# Cloudinary Media Infrastructure Integration

## 1. Verified SDK Version & Zero Hallucination Rule

TerraWitness is built on the official **Cloudinary Node.js SDK version 2.11.0** (`cloudinary.v2`).

In accordance with strict anti-hallucination guidelines:
* Only genuine Cloudinary SDK methods and API endpoints are used.
* No fabricated "Cloudinary forensic", "Cloudinary deepfake", or "Cloudinary provenance" APIs are invoked.
* Cryptographic hashes, perceptual DCT hashes, and EXIF forensics are computed application-side.

---

## 2. Verified Cloudinary SDK Methods Used

| Component | Official SDK Method | Description |
| :--- | :--- | :--- |
| **Signed Uploads** | `cloudinary.utils.api_sign_request(params, secret)` | Generates SHA-1/SHA-256 signatures for direct client upload widgets without exposing secrets. |
| **Server Ingestion** | `cloudinary.uploader.upload_stream(options, callback)` | Streams multipart image/video binaries to Cloudinary storage. |
| **Webhook Security** | `cloudinary.utils.verifyNotificationSignature(body, timestamp, signature, valid_for)` | Validates Cloudinary webhook notifications with timestamp replay defense. |
| **Transformations** | `cloudinary.url(publicId, options)` | Generates responsive thumbnails, normalized comparison canvases, and redacted frames. |
| **Resource Metadata** | `cloudinary.api.resource(publicId, options)` | Queries Cloudinary asset metadata, format, dimensions, and auto-tagging. |

---

## 3. The Immutable Original Media Rule

Under no circumstances is an original uploaded media binary overwritten:

```text
Original Uploaded Asset (Permanent, Unaltered Evidence)
       │
       ├──▶ Derived Thumbnail (c_fill, w_320, h_220, g_auto, q_auto, f_auto)
       ├──▶ Derived Normalized Canvas (c_limit, w_1200, q_auto, f_auto)
       ├──▶ Derived Redacted Asset (e_pixelate_faces:15)
       └──▶ Derived Evidence Stamp (Text overlay watermark with EV-ID & Hash)
```

Every derived asset stores:
* `parentAssetId`: FK pointing to immutable original
* `transformationSpec`: Precise string of Cloudinary transformation parameters
* `createdAt`: Ingest timestamp

---

## 4. Webhook Security & Idempotency

When Cloudinary notifications are received at `/api/webhooks/cloudinary`:

1. Extracts `X-Cld-Signature` and `X-Cld-Timestamp` headers.
2. Invokes `cloudinary.utils.verifyNotificationSignature(rawBody, timestamp, signature, 3600)`.
3. If valid, searches for existing asset using `public_id` or `asset_id` to enforce idempotency.
4. Appends a `CLOUDINARY_WEBHOOK_VERIFIED` event to the provenance ledger.
