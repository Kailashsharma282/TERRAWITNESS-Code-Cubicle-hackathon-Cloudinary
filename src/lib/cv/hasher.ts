import crypto from "crypto";
import sharp from "sharp";

export interface HashFingerprints {
  sha256: string;
  phash: string;
  dhash: string;
}

/**
 * Calculates SHA-256 byte fingerprint.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Computes difference hash (dHash) for an image buffer.
 * Resizes to 9x8 grayscale, compares adjacent horizontal pixels.
 * Returns 64-bit hexadecimal string.
 */
export async function computeDhash(buffer: Buffer): Promise<string> {
  try {
    const rawPixels = await sharp(buffer)
      .grayscale()
      .resize(9, 8, { fit: "fill" })
      .raw()
      .toBuffer();

    let hashBits = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const left = rawPixels[row * 9 + col];
        const right = rawPixels[row * 9 + col + 1];
        hashBits += left < right ? "1" : "0";
      }
    }

    // Convert 64 bits to 16 hex chars
    let hex = "";
    for (let i = 0; i < hashBits.length; i += 4) {
      const nibble = hashBits.substring(i, i + 4);
      hex += parseInt(nibble, 2).toString(16);
    }
    return hex.padStart(16, "0");
  } catch (err) {
    console.error("Failed to compute dHash:", err);
    // Fallback: SHA256 truncated
    return computeSha256(buffer).substring(0, 16);
  }
}

/**
 * Computes perceptual hash (pHash) using 32x32 DCT low frequency thresholding.
 * Returns 64-bit hexadecimal string.
 */
export async function computePhash(buffer: Buffer): Promise<string> {
  try {
    // 1. Resize to 32x32 grayscale
    const size = 32;
    const rawPixels = await sharp(buffer)
      .grayscale()
      .resize(size, size, { fit: "fill" })
      .raw()
      .toBuffer();

    // 2. Perform 2D Discrete Cosine Transform (DCT)
    // We only need top-left 8x8 low frequencies (excluding DC component [0,0])
    const dct: number[][] = [];
    for (let u = 0; u < 8; u++) {
      dct[u] = [];
      for (let v = 0; v < 8; v++) {
        let sum = 0;
        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            const pixel = rawPixels[y * size + x];
            sum +=
              pixel *
              Math.cos(((2 * x + 1) * u * Math.PI) / (2 * size)) *
              Math.cos(((2 * y + 1) * v * Math.PI) / (2 * size));
          }
        }
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
        dct[u][v] = 0.25 * cu * cv * sum;
      }
    }

    // 3. Calculate median value of the 8x8 low frequencies, skipping DC (0,0)
    const values: number[] = [];
    for (let u = 0; u < 8; u++) {
      for (let v = 0; v < 8; v++) {
        if (u === 0 && v === 0) continue;
        values.push(dct[u][v]);
      }
    }
    values.sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];

    // 4. Construct 64-bit hash: 1 if dct[u][v] > median, else 0
    let hashBits = "";
    for (let u = 0; u < 8; u++) {
      for (let v = 0; v < 8; v++) {
        hashBits += dct[u][v] > median ? "1" : "0";
      }
    }

    // Convert 64 bits to 16 hex chars
    let hex = "";
    for (let i = 0; i < hashBits.length; i += 4) {
      const nibble = hashBits.substring(i, i + 4);
      hex += parseInt(nibble, 2).toString(16);
    }
    return hex.padStart(16, "0");
  } catch (err) {
    console.error("Failed to compute pHash:", err);
    return computeSha256(buffer).substring(0, 16);
  }
}

/**
 * Computes all fingerprints for an image buffer.
 */
export async function computeAllFingerprints(buffer: Buffer): Promise<HashFingerprints> {
  const sha256 = computeSha256(buffer);
  const [phash, dhash] = await Promise.all([computePhash(buffer), computeDhash(buffer)]);
  return { sha256, phash, dhash };
}

/**
 * Computes Hamming distance between two hex hashes (number of differing bits).
 */
export function hammingDistance(hex1: string, hex2: string): number {
  if (!hex1 || !hex2) return 64;
  const len = Math.max(hex1.length, hex2.length);
  const h1 = hex1.padStart(len, "0");
  const h2 = hex2.padStart(len, "0");

  let diff = 0;
  for (let i = 0; i < len; i++) {
    const v1 = parseInt(h1[i], 16);
    const v2 = parseInt(h2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      diff += xor & 1;
      xor >>= 1;
    }
  }
  return diff;
}

/**
 * Converts Hamming distance to perceptual similarity percentage (0% to 100%).
 * 64 total bits. Distance of 0 = 100% similarity. Distance of 10 = ~84.4%.
 */
export function perceptualSimilarity(hex1: string, hex2: string): number {
  const distance = hammingDistance(hex1, hex2);
  const similarity = Math.max(0, 1 - distance / 64);
  return Math.round(similarity * 1000) / 10;
}
