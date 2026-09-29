# Computer Vision & Forensic Analysis Pipeline

## 1. Perceptual Hashing & Duplicate Reuse Detection

TerraWitness computes two distinct perceptual hashes for every asset:

### Discrete Cosine Transform pHash (64-bit)
1. Resizes input image to 32×32 grayscale.
2. Computes the 2D Discrete Cosine Transform (DCT) matrix.
3. Extracts the top-left 8×8 lowest frequencies (excluding DC component).
4. Computes the median value across low frequencies.
5. Emits a 64-bit binary bitstring where `bit = 1` if $DCT[u, v] > \text{median}$, converted to 16 hexadecimal characters.

### Difference Gradient Hash (dHash)
1. Resizes input image to 9×8 grayscale.
2. Compares adjacent horizontal pixels: `bit = left < right ? 1 : 0`.
3. Emits 64 bits represented as a 16-character hexadecimal string.

### Hamming Proximity & Reuse Rules
Hamming distance represents the number of differing bits:
$$\text{Similarity} = \max\left(0, 1 - \frac{\text{HammingDistance}}{64}\right) \times 100\%$$
* If similarity $\ge 94\%$ between ostensibly distinct temporal captures: Flagged as `POTENTIAL_REUSE` for mandatory reviewer audit.

---

## 2. Geo-Temporal Drift Forensics

* **Spatial Drift**: Computed via Haversine great-circle distance over extracted EXIF GPS coordinates:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
  * $< 50\text{m}$: High Proximity
  * $50\text{m} - 250\text{m}$: Moderate Field Drift
  * $> 250\text{m}$: Large Mismatch Anomaly
* **Temporal Gap**: Exact difference in days between EXIF `DateTimeOriginal` headers. Chronology inversion (after dated before baseline) triggers a critical anomaly alert.

---

## 3. Normalized Visible Change Score

Change detection avoids naive raw pixel subtraction by incorporating multi-metric structural variance:

1. **Illumination-Normalized Pixel Delta**: Ignores sensor noise and lighting flicker below intensity threshold ($\Delta > 28$).
2. **Edge Divergence**: Sobel horizontal and vertical gradient divergence.
3. **Structural Similarity Index (SSIM)**: Luminance covariance and variance over 512×512 normalized registration.
4. **Formula**:
   $$\text{Normalized Visible Change} = 0.6 \times \text{PixelDiffPercentage} + 0.4 \times \text{EdgeChangePercentage}$$

---

## 4. Domain-Specific Impact Analyzers

* **Vegetation Analyzer**: Excess Green Index $\text{ExG} = 2G - R - B$. Pixels with $\text{ExG} > 18$ and $G > 45$ denote active green canopy coverage.
* **Solar Analyzer**: Rectilinear grid pattern contrast combined with Cloudinary AI semantic object classification (`solar_panel`, `photovoltaic`, `array`).
* **Water / Flood Analyzer**: Chromatic blue-to-red spectral ratio ($B > 1.25R$).
* **Infrastructure Progression**: Multi-stage structural edge density tracking excavation, foundation, framing, and roof completion.
