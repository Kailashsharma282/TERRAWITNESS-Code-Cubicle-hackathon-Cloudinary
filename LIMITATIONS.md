# Methodological Boundaries & Limitations

In compliance with Rule 0 and Section 47 of the TerraWitness Product Charter, this document establishes the explicit methodological and legal boundaries of the system.

TerraWitness prioritizes **“Not available / insufficient evidence”** over fabricated or ungrounded claims.

---

## 1. Visual Change Does Not Guarantee Biological or Economic Impact

* Optical greening measured via the Excess Green Index ($\text{ExG}$) or pixel difference reflects surface reflectance and visible flora.
* Optical change does **NOT** measure soil carbon depth, biological biomass, root health, species biodiversity, or sapling survival over multi-year cycles.
* Organizations must not claim that a high Visible Change Score directly equates to certified carbon credits without accredited in-situ scientific measurement.

---

## 2. Hardware Metadata May Be Inaccurate or Absent

* EXIF timestamps, GPS coordinates, and sensor models are extracted from file headers.
* While TerraWitness detects known editing software signatures (Photoshop, GIMP, Canva), EXIF headers can theoretically be stripped or manipulated by hardware devices prior to ingestion.
* Absence of GPS is labeled as **"NOT AVAILABLE"**, never fabricated.

---

## 3. AI Observations Are Probabilistic, Not Legal Facts

* Cloudinary AI auto-tagging and computer vision semantic classifiers produce probabilistic confidence distributions.
* An AI tag such as `solar_panel` indicates that visual features resemble solar panel hardware; it does not independently verify electrical continuity, power generation, or kilowatt-hour output.

---

## 4. Perceptual Similarity Is Visual Proximity, Not Absolute Forgery Detection

* 64-bit DCT perceptual hashing identifies visual proximity and potential reuse of compressed or resized images.
* A high perceptual similarity score ($>92\%$) flags media as **"POTENTIAL REUSE"** for human auditor inspection. It does not automatically establish fraudulent intent without contextual human investigation.

---

## 5. Scope of TerraWitness Provenance

* TerraWitness cryptographic provenance verifies that the recorded chain of custody (ingest time, byte fingerprint, reviewer actions, and alignment transformations) is internally consistent and unbroken since registration.
* TerraWitness does **NOT** claim to guarantee statutory legal admissibility in court jurisdictions, nor does it independently prove camera sensor originality prior to upload.
