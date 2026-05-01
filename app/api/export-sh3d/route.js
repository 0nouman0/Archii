// ─── Sweet Home 3D XML Export ─────────────────────────────────────────────────
// Generates a Home.xml file importable directly in Sweet Home 3D (File > Open).
// No extra dependencies — pure XML generation.
// Coordinate system: 1 px = 1/10 ft = 3.048 cm (Sweet Home 3D uses centimetres).

const PX_TO_CM = 3.048; // 10px/ft × 30.48cm/ft ÷ 10

function toCm(px) {
  return (parseFloat(px) * PX_TO_CM).toFixed(2);
}

// Map our room color hex to a SH3D-compatible ARGB integer string
function colorToArgb(hex) {
  const clean = (hex || "#E8E8D8").replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // ARGB: alpha=255 (0xFF)
  return ((0xFF << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

function buildRoomsXml(rooms) {
  return rooms.map(r => {
    const x1 = toCm(r.x);
    const y1 = toCm(r.y);
    const x2 = toCm(r.x + r.w);
    const y2 = toCm(r.y + r.h);
    const floorColor = colorToArgb(r.color);

    return [
      `  <room name="${escapeXml(r.name)}" areaVisible="true" floorVisible="true" floorColor="${floorColor}" ceilingVisible="true" ceilingColor="-1">`,
      `    <point x="${x1}" y="${y1}"/>`,
      `    <point x="${x2}" y="${y1}"/>`,
      `    <point x="${x2}" y="${y2}"/>`,
      `    <point x="${x1}" y="${y2}"/>`,
      `  </room>`,
    ].join("\n");
  }).join("\n");
}

function buildWallsXml(rooms) {
  const walls = [];
  let id = 1;
  for (const r of rooms) {
    const x1 = toCm(r.x), y1 = toCm(r.y);
    const x2 = toCm(r.x + r.w), y2 = toCm(r.y + r.h);
    const segments = [
      [x1, y1, x2, y1], // top
      [x2, y1, x2, y2], // right
      [x2, y2, x1, y2], // bottom
      [x1, y2, x1, y1], // left
    ];
    for (const [xs, ys, xe, ye] of segments) {
      walls.push(`  <wall id="w${id++}" xStart="${xs}" yStart="${ys}" xEnd="${xe}" yEnd="${ye}" thickness="15" height="270"/>`);
    }
  }
  return walls.join("\n");
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request) {
  const { rooms, plotW, plotH, bhk, facing, city } = await request.json();

  if (!rooms?.length) {
    return Response.json({ error: "No rooms provided" }, { status: 400 });
  }

  const homeName = escapeXml(`ArchiAI — ${plotW}×${plotH}ft ${bhk}BHK ${facing}-facing${city ? ` · ${city}` : ""}`);

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<home version="7200" name="${homeName}" wallHeight="270" backgroundColor="-1" groundColor="-3355444" skyColor="-8092544" lightColor="-1" cameraType="VIRTUAL_VISITOR">
  <environment groundColor="-3355444" skyColor="-8092544" lightColor="-1" wallsAlpha="0.0"/>
  <compass x="${toCm(20)}" y="${toCm(20)}" diameter="100.0" northDirection="0.0" longitude="77.5946" latitude="12.9716" timeZone="Asia/Kolkata"/>
${buildRoomsXml(rooms)}
${buildWallsXml(rooms)}
</home>`;

  const filename = `ArchiAI_${plotW}x${plotH}_${bhk}BHK_${facing}.xml`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
