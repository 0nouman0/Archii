// Patch formatRAGContext to include spatial rules and South/West warnings
const fs = require('fs');
const path = 'lib/rag/knowledgeBase.js';
let f = fs.readFileSync(path, 'utf8');

// Find the closing of the return template literal
const CLOSING_MARKER = 'Apply the zone map and door/window rules STRICTLY. The reference examples show what a 90+ scoring plan looks like.\r\n`;\r\n}';

if (!f.includes(CLOSING_MARKER)) {
  console.error('Closing marker not found!');
  const near = f.lastIndexOf('90+ scoring plan looks like.');
  console.log('Near:', JSON.stringify(f.slice(near, near + 80)));
  process.exit(1);
}

// Also check if STAIRCASE_RULES injection point exists
const STAIRCASE_END = '${STAIRCASE_RULES}\r\n\r\nHIGH-SCORING REFERENCE EXAMPLES:';
if (!f.includes(STAIRCASE_END)) {
  console.error('Staircase end marker not found!');
  const near2 = f.lastIndexOf('STAIRCASE_RULES}');
  console.log('Near staircase:', JSON.stringify(f.slice(near2, near2 + 100)));
}

// Insert spatial rules reference into the return template
const NEW_SECTION = `\${STAIRCASE_RULES}\r\n\r\nSPATIAL RELATIONSHIP RULES (from ChatHouseDiffusion schema):\r\n\${spatialRulesCtx}\r\n\r\nHIGH-SCORING REFERENCE EXAMPLES:`;
if (f.includes(STAIRCASE_END)) {
  f = f.replace(STAIRCASE_END, NEW_SECTION);
  console.log('Injected spatial rules into RAG context template.');
}

// Update the closing to add facing-specific warnings
const NEW_CLOSING = `Apply the zone map, door/window rules, and spatial relationships STRICTLY. The reference examples show what a 90+ scoring plan looks like for \${facing}-facing \${bhk}BHK.\r\n\${facing === "South" ? "\\n\u26a0\ufe0f SOUTH-FACING: Entrance ONLY in SE portion of South wall. Keep South wall heavy. No large South windows." : facing === "West" ? "\\n\u26a0\ufe0f WEST-FACING: Entrance in NW half of West wall ONLY. Keep North/East sides lighter." : ""}\r\n\`;\r\n}`;

f = f.replace(CLOSING_MARKER, NEW_CLOSING);

// Add spatialRulesCtx variable before return statement
const RETURN_MARKER = '  return `\r\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\r\n## RAG CONTEXT';
const WITH_SPATIAL = '  const spatialRulesCtx = typeof formatSpatialRulesContext === "function" ? formatSpatialRulesContext() : "";\r\n  return `\r\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\r\n## RAG CONTEXT';
if (f.includes(RETURN_MARKER)) {
  f = f.replace(RETURN_MARKER, WITH_SPATIAL);
  console.log('Added spatialRulesCtx variable before return.');
} else {
  console.log('WARNING: return marker not found, skipping spatialRulesCtx injection.');
}

fs.writeFileSync(path, f, 'utf8');
console.log('DONE. File size:', fs.statSync(path).size, 'bytes');
console.log('Has spatialRulesCtx:', f.includes('spatialRulesCtx'));
console.log('Has SOUTH-FACING warning:', f.includes('SOUTH-FACING'));
