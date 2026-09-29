# TerraWitness Security Architecture

## 1. Zero Secret Leakage Policy

* `CLOUDINARY_API_SECRET`, database connection strings, and server-side signing keys are restricted strictly to server execution contexts.
* Client-side bundles only receive the public cloud name (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) and pre-signed upload parameters generated on-demand by authenticated API endpoints.

---

## 2. Signed Upload Architecture

To prevent unauthorized uploads to the organization's Cloudinary storage:
1. Client requests upload signature from `/api/evidence/upload-signature`.
2. Server validates user authorization and generates signature using `cloudinary.utils.api_sign_request()` with timestamp and target folder.
3. Client submits media directly to Cloudinary using signed parameters.
4. Cloudinary validates signature before accepting the media file.

---

## 3. Webhook Signature Verification & Anti-Replay

Notifications from Cloudinary are verified via `CloudinaryWebhookVerifier`:
* Signature header `X-Cld-Signature` and timestamp header `X-Cld-Timestamp` are validated.
* Timestamps older than 3600 seconds (1 hour) are rejected to eliminate replay attacks.
* Idempotency keys based on `public_id` and `asset_id` prevent duplicate event insertion.

---

## 4. Role-Based Access Control (RBAC)

Capabilities are strictly enforced server-side:

| Action | Admin | Project Manager | Field Worker | Reviewer | Viewer |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Project** | ✓ | ✓ | — | — | — |
| **Intake Field Evidence** | ✓ | ✓ | ✓ | — | — |
| **Pair Before/After** | ✓ | ✓ | — | ✓ | — |
| **Corroborate / Review** | — | — | — | ✓ | — |
| **Compile Story** | ✓ | ✓ | — | ✓ | — |
| **Export Audit Report** | ✓ | ✓ | — | ✓ | ✓ |

---

## 5. Input Validation & Injection Defense

* All database queries run through Prisma ORM with parameterized SQL, eliminating SQL injection.
* File buffers undergo MIME and header validation via `sharp` and `exifr`.
* HTML outputs use React's automatic JSX context-aware escaping to prevent XSS.
