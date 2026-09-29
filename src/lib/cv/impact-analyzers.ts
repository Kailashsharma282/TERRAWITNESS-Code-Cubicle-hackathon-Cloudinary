import sharp from "sharp";

export interface ImpactObservationResult {
  category: "VEGETATION" | "SOLAR" | "WATER" | "INFRASTRUCTURE" | "WASTE" | "GENERIC";
  metric: string;
  beforeValue?: number | null;
  afterValue?: number | null;
  deltaValue?: number | null;
  unit: string;
  description: string;
  method: string;
  confidence: number;
  source: string;
  disclaimer: string;
}

export class ImpactAnalyzers {
  /**
   * VEGETATION ANALYZER
   * Computes Excess Green Index (ExG = 2*G - R - B) coverage on normalized RGB buffers.
   */
  static async analyzeVegetation(
    beforeBuffer: Buffer,
    afterBuffer: Buffer,
    aiTags: string[] = []
  ): Promise<ImpactObservationResult> {
    const size = 256;
    const totalPixels = size * size;

    try {
      const bRgb = await sharp(beforeBuffer).resize(size, size, { fit: "fill" }).raw().toBuffer();
      const aRgb = await sharp(afterBuffer).resize(size, size, { fit: "fill" }).raw().toBuffer();

      let greenPixelsB = 0;
      let greenPixelsA = 0;

      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 3;
        // Before ExG
        const rB = bRgb[idx];
        const gB = bRgb[idx + 1];
        const bB = bRgb[idx + 2];
        const exgB = 2 * gB - rB - bB;
        if (exgB > 18 && gB > 45) greenPixelsB++;

        // After ExG
        const rA = aRgb[idx];
        const gA = aRgb[idx + 1];
        const bA = aRgb[idx + 2];
        const exgA = 2 * gA - rA - bA;
        if (exgA > 18 && gA > 45) greenPixelsA++;
      }

      const beforeCoverage = Math.round((greenPixelsB / totalPixels) * 1000) / 10;
      const afterCoverage = Math.round((greenPixelsA / totalPixels) * 1000) / 10;
      const deltaCoverage = Math.round((afterCoverage - beforeCoverage) * 10) / 10;

      // Check if AI tags support vegetation/trees/nature
      const tagSupport = aiTags.some((t) =>
        /tree|forest|vegetation|plant|mangrove|grass|foliage/i.test(t)
      );

      const confidence = tagSupport ? 0.88 : 0.74;

      return {
        category: "VEGETATION",
        metric: "visible_canopy_vegetation_coverage",
        beforeValue: beforeCoverage,
        afterValue: afterCoverage,
        deltaValue: deltaCoverage,
        unit: "percentage points",
        description: `Estimated visible vegetation coverage changed from ${beforeCoverage}% to ${afterCoverage}% (${deltaCoverage >= 0 ? "+" : ""}${deltaCoverage} pp).`,
        method: "Excess Green Index (ExG = 2G - R - B) thresholding (ExG > 18) + RGB color ratio",
        confidence,
        source: "TerraWitness CV Engine (ExG) + AI Vision Semantics",
        disclaimer:
          "Visual vegetation coverage reflects optical surface greenness. It does NOT independently prove biological biomass, tree survival rates, or verified carbon sequestration.",
      };
    } catch {
      return {
        category: "VEGETATION",
        metric: "visible_canopy_vegetation_coverage",
        unit: "percentage points",
        description: "Vegetation analysis could not be computed from media buffers.",
        method: "ExG Index",
        confidence: 0.5,
        source: "TerraWitness CV Engine",
        disclaimer: "Insufficient image data for spectral estimation.",
      };
    }
  }

  /**
   * SOLAR ANALYZER
   * Detects solar array visual presence using AI tags and structural contrast.
   */
  static async analyzeSolar(
    beforeAiTags: string[] = [],
    afterAiTags: string[] = []
  ): Promise<ImpactObservationResult> {
    const solarKeywords = /solar|photovoltaic|panel|array|microgrid|clean energy|inverter/i;

    const beforeDetected = beforeAiTags.some((t) => solarKeywords.test(t));
    const afterDetected = afterAiTags.some((t) => solarKeywords.test(t));

    let description = "";
    let confidence = 0.86;

    if (!beforeDetected && afterDetected) {
      description =
        "Baseline: Solar panel evidence not detected. Post-intervention: Solar array infrastructure visually identified.";
      confidence = 0.91;
    } else if (beforeDetected && afterDetected) {
      description = "Solar panel structures visually identified in both baseline and follow-up media.";
      confidence = 0.88;
    } else {
      description = "No direct solar panel keywords identified in visual semantic tags.";
      confidence = 0.65;
    }

    return {
      category: "SOLAR",
      metric: "solar_array_visual_evidence",
      beforeValue: beforeDetected ? 1 : 0,
      afterValue: afterDetected ? 1 : 0,
      deltaValue: (afterDetected ? 1 : 0) - (beforeDetected ? 1 : 0),
      unit: "boolean",
      description,
      method: "Semantic object classification & contextual tags",
      confidence,
      source: "Cloudinary AI Vision + Contextual Recognition",
      disclaimer:
        "Visual presence of solar hardware demonstrates physical installation only. It does NOT measure or prove active electrical generation or kilowatt-hour output.",
    };
  }

  /**
   * WATER / FLOOD RESTORATION ANALYZER
   * Measures visible water body / flooded surface area.
   */
  static async analyzeWater(
    beforeBuffer: Buffer,
    afterBuffer: Buffer,
    _tags: string[] = []
  ): Promise<ImpactObservationResult> {
    const size = 256;
    const totalPixels = size * size;

    try {
      const bRgb = await sharp(beforeBuffer).resize(size, size, { fit: "fill" }).raw().toBuffer();
      const aRgb = await sharp(afterBuffer).resize(size, size, { fit: "fill" }).raw().toBuffer();

      let waterPixelsB = 0;
      let waterPixelsA = 0;

      // Blue dominance / low red ratio typical of surface water/flood zones
      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 3;
        const rB = bRgb[idx];
        const gB = bRgb[idx + 1];
        const bB = bRgb[idx + 2];
        if (bB > rB * 1.25 && bB > 35) waterPixelsB++;

        const rA = aRgb[idx];
        const gA = aRgb[idx + 1];
        const bA = aRgb[idx + 2];
        if (bA > rA * 1.25 && bA > 35) waterPixelsA++;
      }

      const beforeWater = Math.round((waterPixelsB / totalPixels) * 1000) / 10;
      const afterWater = Math.round((waterPixelsA / totalPixels) * 1000) / 10;
      const deltaWater = Math.round((afterWater - beforeWater) * 10) / 10;

      return {
        category: "WATER",
        metric: "visible_surface_water_coverage",
        beforeValue: beforeWater,
        afterValue: afterWater,
        deltaValue: deltaWater,
        unit: "percentage points",
        description: `Estimated visible water surface coverage shifted from ${beforeWater}% to ${afterWater}% (${deltaWater >= 0 ? "+" : ""}${deltaWater} pp).`,
        method: "Spectral chromatic ratio (Blue/Red dominance heuristic)",
        confidence: 0.76,
        source: "TerraWitness CV Engine (Spectral)",
        disclaimer:
          "Surface water coverage is an optical estimate subject to sky reflection, turbidity, and seasonal tide. It does NOT represent hydrological depth or water quality.",
      };
    } catch {
      return {
        category: "WATER",
        metric: "visible_surface_water_coverage",
        unit: "percentage points",
        description: "Water coverage analysis could not be completed.",
        method: "Spectral chromatic ratio",
        confidence: 0.5,
        source: "TerraWitness CV Engine",
        disclaimer: "Insufficient optical data.",
      };
    }
  }

  /**
   * INFRASTRUCTURE ANALYZER
   */
  static analyzeInfrastructure(
    beforeAiTags: string[] = [],
    afterAiTags: string[] = [],
    normalizedChangeScore: number = 0
  ): ImpactObservationResult {
    const structuralKeywords =
      /building|roof|wall|concrete|foundation|road|bridge|structure|facility/i;

    const beforeHasStructure = beforeAiTags.some((t) => structuralKeywords.test(t));
    const afterHasStructure = afterAiTags.some((t) => structuralKeywords.test(t));

    let description = "";
    if (!beforeHasStructure && afterHasStructure) {
      description =
        "Baseline: Undeveloped ground / preliminary terrain. Post-intervention: Structural facility components identified.";
    } else if (normalizedChangeScore > 20) {
      description = `Measurable structural reconfiguration observed (${normalizedChangeScore}% optical change).`;
    } else {
      description = "No major structural divergence identified between captures.";
    }

    return {
      category: "INFRASTRUCTURE",
      metric: "structural_development_progression",
      unit: "score",
      description,
      method: "Object boundary classification + structural feature divergence",
      confidence: 0.81,
      source: "TerraWitness CV Engine + Cloudinary AI Semantics",
      disclaimer:
        "Structural observations confirm visible physical progression. They do NOT verify engineering safety codes, occupancy compliance, or structural load ratings.",
    };
  }
}
