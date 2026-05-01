// ─── Room colour palette ──────────────────────────────────────────────────────
export const ROOM_COLORS = {
  "Living":       "#7EC8A0",
  "Dining":       "#9ECFA8",
  "Kitchen":      "#E8923C",
  "Master Bed":   "#5A8FC0",
  "Bedroom 2":    "#82B8D8",
  "Bedroom 3":    "#A0CAE0",
  "Bedroom 4":    "#B8D8EA",
  "Bedroom 5":    "#C8E2EE",
  "Puja":         "#D4B800",
  "Bathroom":     "#AABBBB",
  "Master Bath":  "#98ABAB",
  "Toilet":       "#90A8A8",
  "Utility":      "#C8BEB4",
  "Store":        "#CCC8BC",
  "Corridor":     "#E0DCD4",
  "Staircase":    "#C8C0A8",
  "Balcony":      "#B4D4A8",
  "Study":        "#B8C8D4",
  "Family Room":  "#A0C0A0",
  "Car Porch":    "#D8D8D4",
};

// ─── Template definitions ─────────────────────────────────────────────────────
// xp, yp = top-left position as fraction of inner area (0–1)
// wp, hp = width/height as fraction of inner area (0–1)
// vastu  = compass zone this room occupies
// For all templates, North is UP (top of SVG), South is DOWN.

const T = {
  // ── 1 BHK ────────────────────────────────────────────────────────────────
  "1BHK_North": [
    { name:"Toilet",    xp:0.00,yp:0.00,wp:0.25,hp:0.30,vastu:"NW" },
    { name:"Living",    xp:0.25,yp:0.00,wp:0.75,hp:0.45,vastu:"N"  },
    { name:"Bathroom",  xp:0.00,yp:0.30,wp:0.25,hp:0.25,vastu:"NW" },
    { name:"Corridor",  xp:0.00,yp:0.55,wp:0.25,hp:0.10,vastu:"W"  },
    { name:"Bedroom",   xp:0.00,yp:0.45,wp:0.55,hp:0.55,vastu:"SW" },  // merged SW
    { name:"Kitchen",   xp:0.55,yp:0.45,wp:0.45,hp:0.55,vastu:"SE" },
  ],
  "1BHK_East": [
    { name:"Toilet",    xp:0.00,yp:0.00,wp:0.25,hp:0.30,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.30,wp:0.25,hp:0.25,vastu:"NW" },
    { name:"Bedroom",   xp:0.25,yp:0.00,wp:0.40,hp:0.55,vastu:"N"  },
    { name:"Living",    xp:0.65,yp:0.00,wp:0.35,hp:0.55,vastu:"NE" },
    { name:"Kitchen",   xp:0.00,yp:0.55,wp:0.40,hp:0.45,vastu:"SW" },
    { name:"Corridor",  xp:0.40,yp:0.55,wp:0.25,hp:0.45,vastu:"S"  },
    { name:"Dining",    xp:0.65,yp:0.55,wp:0.35,hp:0.45,vastu:"SE" },
  ],
  "1BHK_West": [
    { name:"Living",    xp:0.00,yp:0.00,wp:0.35,hp:0.55,vastu:"NW" },
    { name:"Bedroom",   xp:0.35,yp:0.00,wp:0.40,hp:0.55,vastu:"N"  },
    { name:"Toilet",    xp:0.75,yp:0.00,wp:0.25,hp:0.30,vastu:"NE" },
    { name:"Bathroom",  xp:0.75,yp:0.30,wp:0.25,hp:0.25,vastu:"NE" },
    { name:"Dining",    xp:0.00,yp:0.55,wp:0.35,hp:0.45,vastu:"SW" },
    { name:"Corridor",  xp:0.35,yp:0.55,wp:0.25,hp:0.45,vastu:"S"  },
    { name:"Kitchen",   xp:0.60,yp:0.55,wp:0.40,hp:0.45,vastu:"SE" },
  ],
  "1BHK_South": [
    { name:"Toilet",    xp:0.00,yp:0.00,wp:0.25,hp:0.30,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.30,wp:0.25,hp:0.25,vastu:"NW" },
    { name:"Bedroom",   xp:0.25,yp:0.00,wp:0.75,hp:0.55,vastu:"N"  },
    { name:"Kitchen",   xp:0.00,yp:0.55,wp:0.35,hp:0.45,vastu:"SW" },
    { name:"Corridor",  xp:0.35,yp:0.55,wp:0.30,hp:0.45,vastu:"S"  },
    { name:"Living",    xp:0.65,yp:0.55,wp:0.35,hp:0.45,vastu:"SE" },
  ],

  // ── 2 BHK ────────────────────────────────────────────────────────────────
  // Bathroom moved from NE (forbidden) to NW column; Puja expands to fill NE
  "2BHK_North": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.18,hp:0.13,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.13,wp:0.18,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.18,hp:0.10,vastu:"NW" },
    { name:"Living",    xp:0.18,yp:0.00,wp:0.55,hp:0.34,vastu:"N"  },
    { name:"Puja",      xp:0.73,yp:0.00,wp:0.27,hp:0.34,vastu:"NE" },
    { name:"Bedroom 2", xp:0.00,yp:0.34,wp:0.36,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.36,yp:0.34,wp:0.28,hp:0.34,vastu:"C"  },
    { name:"Dining",    xp:0.64,yp:0.34,wp:0.36,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.68,wp:0.36,hp:0.32,vastu:"SW" },
    { name:"Master Bath",xp:0.36,yp:0.68,wp:0.18,hp:0.32,vastu:"S" },
    { name:"Kitchen",   xp:0.54,yp:0.68,wp:0.46,hp:0.32,vastu:"SE" },
  ],
  "2BHK_East": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.18,hp:0.13,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.13,wp:0.18,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.18,hp:0.10,vastu:"NW" },
    { name:"Bedroom 2", xp:0.18,yp:0.00,wp:0.55,hp:0.34,vastu:"N"  },
    { name:"Puja",      xp:0.73,yp:0.00,wp:0.27,hp:0.34,vastu:"NE" },
    { name:"Dining",    xp:0.00,yp:0.34,wp:0.36,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.36,yp:0.34,wp:0.28,hp:0.34,vastu:"C"  },
    { name:"Living",    xp:0.64,yp:0.34,wp:0.36,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.68,wp:0.36,hp:0.32,vastu:"SW" },
    { name:"Master Bath",xp:0.36,yp:0.68,wp:0.18,hp:0.32,vastu:"S" },
    { name:"Kitchen",   xp:0.54,yp:0.68,wp:0.46,hp:0.32,vastu:"SE" },
  ],
  "2BHK_West": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.18,hp:0.13,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.13,wp:0.18,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.18,hp:0.10,vastu:"NW" },
    { name:"Bedroom 2", xp:0.18,yp:0.00,wp:0.55,hp:0.34,vastu:"N"  },
    { name:"Puja",      xp:0.73,yp:0.00,wp:0.27,hp:0.34,vastu:"NE" },
    { name:"Living",    xp:0.00,yp:0.34,wp:0.36,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.36,yp:0.34,wp:0.28,hp:0.34,vastu:"C"  },
    { name:"Dining",    xp:0.64,yp:0.34,wp:0.36,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.68,wp:0.36,hp:0.32,vastu:"SW" },
    { name:"Master Bath",xp:0.36,yp:0.68,wp:0.18,hp:0.32,vastu:"S" },
    { name:"Kitchen",   xp:0.54,yp:0.68,wp:0.46,hp:0.32,vastu:"SE" },
  ],
  "2BHK_South": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.18,hp:0.13,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.13,wp:0.18,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.18,hp:0.10,vastu:"NW" },
    { name:"Bedroom 2", xp:0.18,yp:0.00,wp:0.55,hp:0.34,vastu:"N"  },
    { name:"Puja",      xp:0.73,yp:0.00,wp:0.27,hp:0.34,vastu:"NE" },
    { name:"Master Bed",xp:0.00,yp:0.34,wp:0.36,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.36,yp:0.34,wp:0.28,hp:0.34,vastu:"C"  },
    { name:"Dining",    xp:0.64,yp:0.34,wp:0.36,hp:0.34,vastu:"E"  },
    { name:"Kitchen",   xp:0.00,yp:0.68,wp:0.28,hp:0.32,vastu:"SW" },
    { name:"Master Bath",xp:0.28,yp:0.68,wp:0.18,hp:0.32,vastu:"S" },
    { name:"Living",    xp:0.46,yp:0.68,wp:0.54,hp:0.32,vastu:"SE" },
  ],

  // ── 3 BHK ────────────────────────────────────────────────────────────────
  "3BHK_North": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.17,hp:0.14,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.14,wp:0.17,hp:0.10,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.17,hp:0.09,vastu:"NW" },
    { name:"Living",    xp:0.17,yp:0.00,wp:0.53,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 2", xp:0.00,yp:0.33,wp:0.33,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.34,vastu:"C"  },
    { name:"Bedroom 3", xp:0.67,yp:0.33,wp:0.33,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.67,wp:0.33,hp:0.33,vastu:"SW" },
    { name:"Dining",    xp:0.33,yp:0.67,wp:0.34,hp:0.33,vastu:"S"  },
    { name:"Kitchen",   xp:0.67,yp:0.67,wp:0.33,hp:0.33,vastu:"SE" },
  ],
  "3BHK_East": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.17,hp:0.14,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.14,wp:0.17,hp:0.10,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.17,hp:0.09,vastu:"NW" },
    { name:"Bedroom 3", xp:0.17,yp:0.00,wp:0.53,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 2", xp:0.00,yp:0.33,wp:0.33,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.34,vastu:"C"  },
    { name:"Living",    xp:0.67,yp:0.33,wp:0.33,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.67,wp:0.33,hp:0.33,vastu:"SW" },
    { name:"Dining",    xp:0.33,yp:0.67,wp:0.34,hp:0.33,vastu:"S"  },
    { name:"Kitchen",   xp:0.67,yp:0.67,wp:0.33,hp:0.33,vastu:"SE" },
  ],
  "3BHK_West": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.17,hp:0.14,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.14,wp:0.17,hp:0.10,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.17,hp:0.09,vastu:"NW" },
    { name:"Bedroom 3", xp:0.17,yp:0.00,wp:0.53,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Living",    xp:0.00,yp:0.33,wp:0.33,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.34,vastu:"C"  },
    { name:"Bedroom 2", xp:0.67,yp:0.33,wp:0.33,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.67,wp:0.33,hp:0.33,vastu:"SW" },
    { name:"Dining",    xp:0.33,yp:0.67,wp:0.34,hp:0.33,vastu:"S"  },
    { name:"Kitchen",   xp:0.67,yp:0.67,wp:0.33,hp:0.33,vastu:"SE" },
  ],
  "3BHK_South": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.17,hp:0.14,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.14,wp:0.17,hp:0.10,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.24,wp:0.17,hp:0.09,vastu:"NW" },
    { name:"Bedroom 3", xp:0.17,yp:0.00,wp:0.53,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 2", xp:0.00,yp:0.33,wp:0.33,hp:0.34,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.34,vastu:"C"  },
    { name:"Dining",    xp:0.67,yp:0.33,wp:0.33,hp:0.34,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.67,wp:0.33,hp:0.33,vastu:"SW" },
    { name:"Kitchen",   xp:0.33,yp:0.67,wp:0.34,hp:0.33,vastu:"S"  },
    { name:"Living",    xp:0.67,yp:0.67,wp:0.33,hp:0.33,vastu:"SE" },
  ],

  // ── 4 BHK ────────────────────────────────────────────────────────────────
  "4BHK_North": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.11,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.22,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Living",    xp:0.15,yp:0.00,wp:0.55,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 4", xp:0.00,yp:0.33,wp:0.33,hp:0.33,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.33,vastu:"C"  },
    { name:"Bedroom 3", xp:0.67,yp:0.33,wp:0.33,hp:0.33,vastu:"E"  },
    { name:"Bedroom 2", xp:0.00,yp:0.66,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Master Bed",xp:0.25,yp:0.66,wp:0.25,hp:0.34,vastu:"SW" },
    { name:"Dining",    xp:0.50,yp:0.66,wp:0.22,hp:0.34,vastu:"S"  },
    { name:"Kitchen",   xp:0.72,yp:0.66,wp:0.28,hp:0.34,vastu:"SE" },
  ],
  "4BHK_East": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.11,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.22,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bedroom 4", xp:0.15,yp:0.00,wp:0.55,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 3", xp:0.00,yp:0.33,wp:0.33,hp:0.33,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.33,vastu:"C"  },
    { name:"Living",    xp:0.67,yp:0.33,wp:0.33,hp:0.33,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.66,wp:0.25,hp:0.34,vastu:"SW" },
    { name:"Bedroom 2", xp:0.25,yp:0.66,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Dining",    xp:0.50,yp:0.66,wp:0.22,hp:0.34,vastu:"S"  },
    { name:"Kitchen",   xp:0.72,yp:0.66,wp:0.28,hp:0.34,vastu:"SE" },
  ],
  "4BHK_West": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.11,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.22,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bedroom 4", xp:0.15,yp:0.00,wp:0.55,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Living",    xp:0.00,yp:0.33,wp:0.33,hp:0.33,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.33,vastu:"C"  },
    { name:"Bedroom 3", xp:0.67,yp:0.33,wp:0.33,hp:0.33,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.66,wp:0.25,hp:0.34,vastu:"SW" },
    { name:"Bedroom 2", xp:0.25,yp:0.66,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Dining",    xp:0.50,yp:0.66,wp:0.22,hp:0.34,vastu:"S"  },
    { name:"Kitchen",   xp:0.72,yp:0.66,wp:0.28,hp:0.34,vastu:"SE" },
  ],
  "4BHK_South": [
    { name:"Utility",   xp:0.00,yp:0.00,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Toilet",    xp:0.00,yp:0.11,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bathroom",  xp:0.00,yp:0.22,wp:0.15,hp:0.11,vastu:"NW" },
    { name:"Bedroom 4", xp:0.15,yp:0.00,wp:0.55,hp:0.33,vastu:"N"  },
    { name:"Puja",      xp:0.70,yp:0.00,wp:0.30,hp:0.33,vastu:"NE" },
    { name:"Bedroom 3", xp:0.00,yp:0.33,wp:0.33,hp:0.33,vastu:"W"  },
    { name:"Corridor",  xp:0.33,yp:0.33,wp:0.34,hp:0.33,vastu:"C"  },
    { name:"Bedroom 2", xp:0.67,yp:0.33,wp:0.33,hp:0.33,vastu:"E"  },
    { name:"Master Bed",xp:0.00,yp:0.66,wp:0.25,hp:0.34,vastu:"SW" },
    { name:"Kitchen",   xp:0.25,yp:0.66,wp:0.25,hp:0.34,vastu:"S"  },
    { name:"Dining",    xp:0.50,yp:0.66,wp:0.22,hp:0.34,vastu:"S"  },
    { name:"Living",    xp:0.72,yp:0.66,wp:0.28,hp:0.34,vastu:"SE" },
  ],

  // ── 5 BHK ────────────────────────────────────────────────────────────────
  "5BHK_North": [
    { name:"Utility",    xp:0.00,yp:0.00,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Toilet",     xp:0.00,yp:0.11,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bathroom",   xp:0.00,yp:0.22,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Living",     xp:0.14,yp:0.00,wp:0.52,hp:0.33,vastu:"N"  },
    { name:"Puja",       xp:0.66,yp:0.00,wp:0.34,hp:0.33,vastu:"NE" },
    { name:"Bedroom 5",  xp:0.00,yp:0.33,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Family Room",xp:0.25,yp:0.33,wp:0.25,hp:0.34,vastu:"C"  },
    { name:"Corridor",   xp:0.50,yp:0.33,wp:0.16,hp:0.34,vastu:"C"  },
    { name:"Bedroom 4",  xp:0.66,yp:0.33,wp:0.34,hp:0.34,vastu:"E"  },
    { name:"Master Bed", xp:0.00,yp:0.67,wp:0.25,hp:0.33,vastu:"SW" },
    { name:"Bedroom 2",  xp:0.25,yp:0.67,wp:0.25,hp:0.33,vastu:"W"  },
    { name:"Bedroom 3",  xp:0.50,yp:0.67,wp:0.16,hp:0.33,vastu:"S"  },
    { name:"Dining",     xp:0.66,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
    { name:"Kitchen",    xp:0.83,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
  ],
  "5BHK_East": [
    { name:"Utility",    xp:0.00,yp:0.00,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Toilet",     xp:0.00,yp:0.11,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bathroom",   xp:0.00,yp:0.22,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bedroom 5",  xp:0.14,yp:0.00,wp:0.52,hp:0.33,vastu:"N"  },
    { name:"Puja",       xp:0.66,yp:0.00,wp:0.34,hp:0.33,vastu:"NE" },
    { name:"Bedroom 4",  xp:0.00,yp:0.33,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Family Room",xp:0.25,yp:0.33,wp:0.25,hp:0.34,vastu:"C"  },
    { name:"Corridor",   xp:0.50,yp:0.33,wp:0.16,hp:0.34,vastu:"C"  },
    { name:"Living",     xp:0.66,yp:0.33,wp:0.34,hp:0.34,vastu:"E"  },
    { name:"Master Bed", xp:0.00,yp:0.67,wp:0.25,hp:0.33,vastu:"SW" },
    { name:"Bedroom 2",  xp:0.25,yp:0.67,wp:0.25,hp:0.33,vastu:"W"  },
    { name:"Bedroom 3",  xp:0.50,yp:0.67,wp:0.16,hp:0.33,vastu:"S"  },
    { name:"Dining",     xp:0.66,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
    { name:"Kitchen",    xp:0.83,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
  ],
  "5BHK_West": [
    { name:"Utility",    xp:0.00,yp:0.00,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Toilet",     xp:0.00,yp:0.11,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bathroom",   xp:0.00,yp:0.22,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bedroom 5",  xp:0.14,yp:0.00,wp:0.52,hp:0.33,vastu:"N"  },
    { name:"Puja",       xp:0.66,yp:0.00,wp:0.34,hp:0.33,vastu:"NE" },
    { name:"Living",     xp:0.00,yp:0.33,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Family Room",xp:0.25,yp:0.33,wp:0.25,hp:0.34,vastu:"C"  },
    { name:"Corridor",   xp:0.50,yp:0.33,wp:0.16,hp:0.34,vastu:"C"  },
    { name:"Bedroom 4",  xp:0.66,yp:0.33,wp:0.34,hp:0.34,vastu:"E"  },
    { name:"Master Bed", xp:0.00,yp:0.67,wp:0.25,hp:0.33,vastu:"SW" },
    { name:"Bedroom 2",  xp:0.25,yp:0.67,wp:0.25,hp:0.33,vastu:"W"  },
    { name:"Bedroom 3",  xp:0.50,yp:0.67,wp:0.16,hp:0.33,vastu:"S"  },
    { name:"Dining",     xp:0.66,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
    { name:"Kitchen",    xp:0.83,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
  ],
  "5BHK_South": [
    { name:"Utility",    xp:0.00,yp:0.00,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Toilet",     xp:0.00,yp:0.11,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bathroom",   xp:0.00,yp:0.22,wp:0.14,hp:0.11,vastu:"NW" },
    { name:"Bedroom 5",  xp:0.14,yp:0.00,wp:0.52,hp:0.33,vastu:"N"  },
    { name:"Puja",       xp:0.66,yp:0.00,wp:0.34,hp:0.33,vastu:"NE" },
    { name:"Bedroom 4",  xp:0.00,yp:0.33,wp:0.25,hp:0.34,vastu:"W"  },
    { name:"Family Room",xp:0.25,yp:0.33,wp:0.25,hp:0.34,vastu:"C"  },
    { name:"Corridor",   xp:0.50,yp:0.33,wp:0.16,hp:0.34,vastu:"C"  },
    { name:"Bedroom 3",  xp:0.66,yp:0.33,wp:0.34,hp:0.34,vastu:"E"  },
    { name:"Master Bed", xp:0.00,yp:0.67,wp:0.25,hp:0.33,vastu:"SW" },
    { name:"Bedroom 2",  xp:0.25,yp:0.67,wp:0.25,hp:0.33,vastu:"W"  },
    { name:"Kitchen",    xp:0.50,yp:0.67,wp:0.16,hp:0.33,vastu:"S"  },
    { name:"Dining",     xp:0.66,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
    { name:"Living",     xp:0.83,yp:0.67,wp:0.17,hp:0.33,vastu:"SE" },
  ],
};

// ─── Adjust room list based on user feature preferences ───────────────────────
function adjustRooms(rooms, params, innerW, innerH) {
  const {
    hasParking, parkingCount = 0,
    hasBalcony, hasPujaRoom = true, hasDining = true,
    hasStudy, hasStore = true, hasUtility = true,
    attachedBaths = "master", // "all" | "master" | "none"
  } = params;

  let result = [...rooms];

  // Remove puja room if not wanted — absorb into living/corridor
  if (hasPujaRoom === false) {
    result = result.filter(r => r.name !== "Puja");
  }

  // Remove dining if not wanted (open-plan) — absorb into living
  if (hasDining === false) {
    result = result.filter(r => r.name !== "Dining");
  }

  // Remove store if not wanted
  if (hasStore === false) {
    result = result.filter(r => r.name !== "Store");
  }

  // Remove utility if not wanted
  if (hasUtility === false) {
    result = result.filter(r => r.name !== "Utility");
  }

  // Add study room — replace Store slot if store was removed, else shrink corridor
  if (hasStudy === true && !result.find(r => r.name === "Study")) {
    const corridor = result.find(r => r.name === "Corridor");
    if (corridor && corridor.wp > 0.18) {
      const studyWp = 0.12;
      result = result.map(r =>
        r.name === "Corridor"
          ? { ...r, wp: r.wp - studyWp }
          : r
      );
      result.push({ ...corridor, name: "Study", xp: corridor.xp + corridor.wp - studyWp, wp: studyWp, vastu: "NW" });
    }
  }

  // Add balcony — attach to master bedroom (top edge) if floors > 1
  if (hasBalcony === true && (params.floors || 1) > 1) {
    const master = result.find(r => r.name === "Master Bed");
    if (master && !result.find(r => r.name === "Balcony")) {
      const balcHp = 0.08;
      result = result.map(r =>
        r.name === "Master Bed" ? { ...r, hp: r.hp - balcHp, yp: r.yp + balcHp } : r
      );
      result.push({ name: "Balcony", xp: master.xp, yp: master.yp, wp: master.wp, hp: balcHp, vastu: "SW" });
    }
  }

  // Add car porch — append at front boundary (same facing side as entrance)
  if (hasParking === true && parkingCount > 0 && !result.find(r => r.name === "Car Porch")) {
    result.push({ name: "Car Porch", xp: 0.60, yp: 0.00, wp: 0.20 * Math.min(parkingCount, 2), hp: 0.10, vastu: "NW" });
  }

  // Attached bathrooms for all bedrooms (add Master Bath if missing)
  if (attachedBaths === "all") {
    const hasMasterBath = result.find(r => r.name === "Master Bath");
    if (!hasMasterBath) {
      const master = result.find(r => r.name === "Master Bed");
      if (master) {
        const bathWp = 0.10;
        result = result.map(r =>
          r.name === "Master Bed" ? { ...r, wp: r.wp - bathWp } : r
        );
        const masterAfter = result.find(r => r.name === "Master Bed");
        if (masterAfter) {
          result.push({ name: "Master Bath", xp: masterAfter.xp + masterAfter.wp, yp: masterAfter.yp, wp: bathWp, hp: masterAfter.hp, vastu: "SW" });
        }
      }
    }
  } else if (attachedBaths === "none") {
    result = result.filter(r => r.name !== "Master Bath");
  }

  return result;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function computeLayout(params) {
  const { plotW, plotH, bhk, facing } = params;
  const SCALE = 10;           // 10px = 1 ft
  const W = plotW * SCALE;
  const H = plotH * SCALE;
  const OUTER = 6;            // outer wall thickness px

  // ── Setbacks (in px, = ft × SCALE) ──────────────────────────────────────
  // Typical Indian urban setbacks: front 3m, rear 2.5m, sides 1.2m
  // For North-facing plots: front = North side
  const setbackFront = Math.round(3.0 * SCALE);   // 30px = 3m
  const setbackRear  = Math.round(2.5 * SCALE);   // 25px = 2.5m
  const setbackSide  = Math.round(1.2 * SCALE);   // 12px = 1.2m

  // Map setbacks to NSEW based on facing direction
  const sb = {
    North: { top: setbackFront, bottom: setbackRear,  left: setbackSide, right: setbackSide },
    South: { top: setbackRear,  bottom: setbackFront, left: setbackSide, right: setbackSide },
    East:  { top: setbackSide,  bottom: setbackSide,  left: setbackRear, right: setbackFront },
    West:  { top: setbackSide,  bottom: setbackSide,  left: setbackFront, right: setbackRear },
  }[facing] || { top: setbackFront, bottom: setbackRear, left: setbackSide, right: setbackSide };

  // Building envelope (inside setbacks)
  const bldX = sb.left;
  const bldY = sb.top;
  const bldW = W - sb.left - sb.right;
  const bldH = H - sb.top  - sb.bottom;

  // Inner room area (inside outer walls of building)
  const innerX = bldX + OUTER;
  const innerY = bldY + OUTER;
  const innerW = bldW - OUTER * 2;
  const innerH = bldH - OUTER * 2;

  const key = `${bhk}BHK_${facing}`;
  const template = T[key] || T["3BHK_North"];

  const adjustedTemplate = adjustRooms(template, params, innerW, innerH);
  const rooms = adjustedTemplate.map(r => {
    const x = Math.round(innerX + r.xp * innerW);
    const y = Math.round(innerY + r.yp * innerH);
    const w = Math.round(r.wp * innerW);
    const h = Math.round(r.hp * innerH);
    const ftW = Math.round((w / SCALE) * 10) / 10;
    const ftH = Math.round((h / SCALE) * 10) / 10;
    return {
      ...r,
      x, y, w, h,
      ftW, ftH,
      color: ROOM_COLORS[r.name] || "#D0D0C8",
      label: `${r.name}\n${ftW}×${ftH}ft`,
    };
  });

  // Entrance position (on building boundary, not plot boundary)
  const entrancePos = {
    North: { x: bldX + bldW / 2, y: bldY, wall: "top" },
    South: { x: bldX + bldW / 2, y: bldY + bldH, wall: "bottom" },
    East:  { x: bldX + bldW, y: bldY + bldH / 2, wall: "right" },
    West:  { x: bldX, y: bldY + bldH / 2, wall: "left" },
  }[facing] || { x: bldX + bldW / 2, y: bldY, wall: "top" };

  return {
    rooms, W, H,
    innerW, innerH, innerX, innerY,
    bldX, bldY, bldW, bldH,
    OUTER,
    setbacks: sb,
    setbackFront, setbackRear, setbackSide,
    entrance: entrancePos,
    scale: SCALE,
  };
}
