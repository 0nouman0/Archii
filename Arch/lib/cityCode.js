export const CITY_CODES = {
  "BBMP (Bengaluru)": { far: 2.5, setbackFront: 3, setbackSide: 1.5, maxHeight: 15, name: "BBMP" },
  "BMC (Mumbai)":     { far: 1.33, setbackFront: 4.5, setbackSide: 2.3, maxHeight: 11, name: "BMC" },
  "MCD (Delhi)":      { far: 3.5, setbackFront: 3, setbackSide: 1.5, maxHeight: 15, name: "MCD" },
  "GHMC (Hyderabad)": { far: 2.0, setbackFront: 3, setbackSide: 1.5, maxHeight: 15, name: "GHMC" },
  "CMDA (Chennai)":   { far: 1.5, setbackFront: 3, setbackSide: 1.5, maxHeight: 11, name: "CMDA" },
  "PMC (Pune)":       { far: 2.0, setbackFront: 3, setbackSide: 1.5, maxHeight: 11, name: "PMC" },
  "NBC (Generic)":    { far: 2.0, setbackFront: 3, setbackSide: 1.5, maxHeight: 11, name: "NBC" },
};

export function checkRegulatory(params) {
  const code = CITY_CODES[params.city] || CITY_CODES["NBC (Generic)"];
  const plotArea = params.plotW * params.plotH;
  const builtUp = plotArea * 0.65 * params.floors;
  const far = builtUp / plotArea;
  const errors = [];
  const warnings = [];

  if (far > code.far) errors.push(`FAR ${far.toFixed(2)} exceeds ${params.city} limit of ${code.far}`);
  if (params.plotW < 15) errors.push("Plot width below 15ft minimum");
  if (params.plotH < 20) errors.push("Plot depth below 20ft minimum");
  if (params.bhk >= 4 && plotArea < 800) warnings.push(`${params.bhk}BHK on ${plotArea}sqft is cramped`);
  if (params.facing === "South") warnings.push("South-facing entrance requires Vastu remedies");

  return { errors, warnings, code };
}
