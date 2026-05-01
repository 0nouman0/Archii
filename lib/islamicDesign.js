// ─── Vastu AI — Islamic Architectural Design Terms ────────────────────────────
// 28 Islamic residential architecture glossary terms with Arabic script,
// transliterations, definitions, and practical residential design tips.
//
// Categories: 'orientation' | 'spaces' | 'privacy' | 'light' | 'water'
//             'ornamentation' | 'jurisprudence'

export const ISLAMIC_TERMS = [
  // ── ORIENTATION (4) ──────────────────────────────────────────────────────────
  {
    id: "qibla",
    term: "Qibla",
    arabic: "قِبْلَة",
    transliteration: "Qib-la",
    category: "orientation",
    definition:
      "The Qibla is the direction of the Kaaba in Mecca, Saudi Arabia — the sacred axis that every Muslim faces during the five daily prayers (Salah). In Islamic residential architecture, orienting the prayer room (musalla) or a dedicated prayer niche toward the Qibla is a fundamental design consideration. The angle of the Qibla varies by geographic location: roughly southeast from Western Europe, southwest from Central Asia, and westward from Southeast Asia. Embedding this sacred vector into the home's geometry connects the domestic realm to the global community of believers and the divine centre of Islam.",
    tip: "Do: Calculate the precise Qibla angle for your city using a compass or app and align the prayer room's primary wall perpendicular to it — a subtle recessed niche (mihrab) in that wall visually anchors the direction without requiring a separate room.",
    related: ["mihrab", "musalla", "dar"],
  },
  {
    id: "musalla",
    term: "Musalla",
    arabic: "مُصَلَّى",
    transliteration: "Mu-sal-lá",
    category: "orientation",
    definition:
      "Musalla is the Arabic term for a prayer space or prayer mat — in residential design it refers to any dedicated area within the home set aside for Salah. Unlike a mosque, a musalla in a home need not be architecturally elaborate: a clean, quiet corner of a room, a screened alcove, or a fully enclosed room can all serve this function. The essential requirement is that the space allows the occupant to stand, bow (ruku), and prostrate (sujud) facing the Qibla without obstruction. Ideally the musalla receives no foot traffic during prayer times.",
    tip: "Do: Dimension the musalla at a minimum of 1.2 m × 2.0 m per person — this accommodates the full prostration position; for a family of four praying in rows, allow 1.2 m width per person and 2.0 m depth.",
    related: ["qibla", "mihrab", "salamlik"],
  },
  {
    id: "mihrab",
    term: "Mihrab",
    arabic: "مِحْرَاب",
    transliteration: "Mih-ráb",
    category: "orientation",
    definition:
      "The Mihrab is a semicircular or pointed-arch niche set into the Qibla wall of a mosque to indicate the direction of prayer — the most sacred architectural element in Islamic sacred space. In domestic architecture, a smaller mihrab-inspired niche in the prayer room or musalla fulfils the same orientating function. Beyond its practical role, the mihrab is a focal point of spiritual intention: its concave geometry concentrates acoustic resonance for the voice of the imam and visually draws the worshipper's attention toward Mecca.",
    tip: "Do: Introduce a shallow (150–200 mm deep) pointed-arch niche in the prayer room's Qibla wall, even in a contemporary home — this subtle gesture encodes the sacred axis into the architecture without appearing overtly religious.",
    related: ["qibla", "musalla", "iwan"],
  },
  {
    id: "talar",
    term: "Talar",
    arabic: "تالار",
    transliteration: "Ta-lár",
    category: "orientation",
    definition:
      "The Talar is a columned open-fronted hall or veranda characteristic of Persian residential and palace architecture — essentially a grand porch facing the main courtyard. Typically elevated on a platform, the Talar creates a covered transitional zone between the inner courtyard (hawsh) and the main reception rooms. Its orientation is traditionally set to face north or northeast to capture prevailing winds and avoid the harsh afternoon sun, creating a naturally ventilated gathering space for hot climates. The Talar's columns and proportioned ceiling frame views of the sky and garden, linking interior domestic life to the natural world.",
    tip: "Do: Orient the Talar to face northeast to capture morning light and prevailing summer breezes — raise its floor by 300–450 mm above courtyard level to reinforce the symbolic threshold between courtyard and interior.",
    related: ["iwan", "hawsh", "sahn"],
  },

  // ── SPACES (7) ────────────────────────────────────────────────────────────────
  {
    id: "sahn",
    term: "Sahn",
    arabic: "صَحْن",
    transliteration: "Sahn",
    category: "spaces",
    definition:
      "The Sahn is the central open courtyard of a mosque or traditional Islamic house — the heart of the spatial composition around which all other functions are arranged. In residential design, the Sahn (also called Hawsh or Hosh) provides the home's primary source of natural light, ventilation, and climatic moderation. Its inward-facing orientation ensures that family life remains private from the street while the open sky above creates a sense of spaciousness and spiritual connection to the heavens. Water features, fountains, and planted trees in the Sahn lower ambient temperature through evaporative cooling — a passive technique used throughout the Islamic world from Morocco to Persia to Mughal India.",
    tip: "Do: Size the Sahn at a minimum of 15–20% of the total house footprint — a Sahn that is too small fails to provide adequate light, ventilation, or usable outdoor living space; a ratio of 1:2 (courtyard width to surrounding wall height) ensures adequate sky exposure.",
    related: ["hawsh", "riwaq", "bustan"],
  },
  {
    id: "iwan",
    term: "Iwan",
    arabic: "إِيوَان",
    transliteration: "Í-wan",
    category: "spaces",
    definition:
      "The Iwan is a large vaulted hall open on one side — a deeply recessed arched portal that serves as a covered outdoor room facing the courtyard. Originally a Sassanid Persian spatial type, the Iwan was adopted and refined throughout the Islamic world as both a monumental entrance feature and a climatically ideal semi-outdoor living space. In residential design, the iwan creates a transitional zone of shade and breeze between the direct sun of the courtyard and the enclosed interior rooms, functioning as both a summer living room and a spatial threshold that dignifies arrival. Its barrel vault or muqarnas ceiling amplifies natural ventilation through the chimney effect.",
    tip: "Do: Design the iwan depth at 50–60% of its height for optimal shade in summer without sacrificing winter sun penetration — a minimum depth of 3 m ensures functional usability as an outdoor room.",
    related: ["sahn", "talar", "muqarnas"],
  },
  {
    id: "salamlik",
    term: "Salamlik",
    arabic: "سَلَامْلِك",
    transliteration: "Sa-lám-lik",
    category: "spaces",
    definition:
      "The Salamlik is the public male reception zone of a traditional Islamic house — the area where the master of the house receives male guests who are not family members (non-mahram). It is typically placed near the main entrance, accessible without allowing guests to penetrate into the private haramlik. The Salamlik may include a formal reception room (majlis), a covered entry court, and sometimes a separate toilet for guests. This spatial separation between public reception and private family space is a direct architectural response to Islamic jurisprudence on the sanctity of the private home and the honour of the family.",
    tip: "Do: Position the guest toilet and a complete reception room (majlis) within the salamlik zone, accessible from the entrance without passing through any private spaces — this allows hosting male guests with full hospitality while preserving family privacy.",
    related: ["haramlik", "majlis", "dar"],
  },
  {
    id: "haramlik",
    term: "Haramlik",
    arabic: "حَرَمْلِك",
    transliteration: "Ha-rám-lik",
    category: "spaces",
    definition:
      "The Haramlik (from Arabic 'haram' — sacred/forbidden) is the private, exclusively family zone of a traditional Islamic house — the inner sanctuary where women and family members who are mahram (closely related) live without being seen by unrelated male visitors. It is architecturally separated from the salamlik by changes in level, indirect corridors, screened doorways, or a sequence of transitional spaces. The haramlik typically contains the family bedrooms, women's sitting rooms, family kitchen, and bathroom facilities. This zone is the heart of domestic life and receives the most architectural care and investment in traditional Islamic homes.",
    tip: "Don't: Allow a direct visual or spatial connection between the main entrance and the haramlik — design a minimum of two spatial turns (an L-shaped or U-shaped corridor) between the entrance and any family bedroom, ensuring no sightline penetrates the private zone.",
    related: ["salamlik", "haram", "dar"],
  },
  {
    id: "majlis",
    term: "Majlis",
    arabic: "مَجْلِس",
    transliteration: "Maj-lis",
    category: "spaces",
    definition:
      "The Majlis (literally 'place of sitting') is the formal reception and sitting room of an Islamic household — equivalent in function to the drawing room or parlour of European domestic architecture, but imbued with deep cultural significance as the space of hospitality, counsel, and community. The Majlis is the most elaborately decorated room in a traditional Arab, Persian, or Ottoman home: its walls are lined with banquette seating (diwans), the floor is covered with fine carpets, and the ceiling is often ornate. It is where guests are received, decisions are made, and social bonds are maintained.",
    tip: "Do: Design the Majlis with a minimum ceiling height of 3.2 m and perimeter seating (built-in banquette or diwan along three walls) — this allows flexible seating arrangements for both intimate conversations and larger gatherings without the need for moveable furniture.",
    related: ["salamlik", "bayt", "dar"],
  },
  {
    id: "bayt",
    term: "Bayt",
    arabic: "بَيْت",
    transliteration: "Bayt",
    category: "spaces",
    definition:
      "Bayt (Arabic: بَيْت) is the Arabic word for 'house' or 'home', but in architectural terminology it refers specifically to the basic residential unit or room — the fundamental spatial cell of Islamic domestic architecture. In classical Arabic poetry and the Quran, 'bayt' carries profound connotations of shelter, belonging, and divine protection. Architecturally, the bayt is a room designed for sleeping and private family use, typically entered through a vestibule or transitional space rather than directly from a public corridor. The proportions of the bayt traditionally follow the dimensions of the prayer mat, connecting even the bedroom to the spatial language of Islamic devotion.",
    tip: "Do: Design bedroom (bayt) entry through a small vestibule or alcove rather than directly off a main corridor — this 0.9–1.2 m transitional space provides acoustic separation, a clothes storage zone, and a privacy buffer consistent with Islamic spatial values.",
    related: ["haramlik", "dar", "majlis"],
  },
  {
    id: "dar",
    term: "Dar",
    arabic: "دَار",
    transliteration: "Dar",
    category: "spaces",
    definition:
      "Dar is the Arabic term for a dwelling, home, or household — encompassing the entire complex of spaces that constitute a family's domestic world. In Islamic architecture, the Dar is organised around the central courtyard (sahn/hawsh), with public (salamlik), semi-public (majlis), and private (haramlik) zones arranged to protect the family's privacy. The Dar al-Islam concept extends this spatial hierarchy metaphorically: the home is a microcosm of the Islamic social order, where boundaries of sanctity (haram/halal) are encoded into the architecture itself. The threshold (bab) of the Dar is both a physical door and a symbolic boundary between public and private worlds.",
    tip: "Do: Design the Dar with a clear spatial hierarchy — entry vestibule, salamlik reception, transitional corridor, then haramlik — ensuring each transition involves either a door, a turn, or a level change to encode privacy progressively.",
    related: ["bab", "salamlik", "haramlik"],
  },
  {
    id: "takhtabush",
    term: "Takhtabush",
    arabic: "تَخْتَبُوش",
    transliteration: "Takh-ta-búsh",
    category: "spaces",
    definition:
      "The Takhtabush is a distinctive spatial element of traditional Cairene domestic architecture — a tall, open-sided room or loggia positioned at the intersection of the reception court and the private iwan, with one side open to the courtyard and the opposite side featuring a mashrabiya screen overlooking a lower garden or qa'a. This ambiguous in-between space, neither fully interior nor exterior, modulates climate, light, and privacy simultaneously. Its elevated position (accessed by a short stair) and screened openings allow the family to observe guests in the courtyard below without being seen.",
    tip: "Do: Introduce a takhtabush-inspired elevated screened room or mezzanine level overlooking the central courtyard — positioned 600–900 mm above courtyard level with mashrabiya screens, it creates a naturally ventilated family retreat with visual control over the house's public spaces.",
    related: ["mashrabiya", "iwan", "sahn"],
  },

  // ── PRIVACY (4) ───────────────────────────────────────────────────────────────
  {
    id: "haram",
    term: "Haram (Sanctity of Home)",
    arabic: "حَرَم",
    transliteration: "Ha-ram",
    category: "privacy",
    definition:
      "Haram in the context of residential design refers to the sacred inviolable privacy of the home — the Islamic principle that the private dwelling is a sanctuary into which no one may intrude without permission. This theological concept (rooted in Quran 24:27–28 and hadith traditions) directly drives the spatial design of traditional Islamic homes: high blank walls on the street, indirect entrances, screened windows, and the haramlik/salamlik division are all physical expressions of this spiritual principle. The home's interior is considered a zone of divine protection, its sanctity analogous to that of the Haram Sharif in Mecca.",
    tip: "Do: Design the street-facing facade of an Islamic-inspired home with minimal openings (maximum 15% window-to-wall ratio) and no direct sightlines into private spaces — all views from the street should terminate at a screen, wall, or planted barrier before reaching any inhabited room.",
    related: ["haramlik", "mashrabiya", "jali"],
  },
  {
    id: "andaruni",
    term: "Andaruni",
    arabic: "اَنْدَرُونِي",
    transliteration: "An-da-rú-ni",
    category: "privacy",
    definition:
      "Andaruni (Persian: 'inner') is the private inner quarters of a Persian traditional house — equivalent to the haramlik in Arab homes. It is the exclusively family zone, typically centred on its own garden courtyard, where women and children live without exposure to unrelated male visitors. The Andaruni contains the family's most private rooms, the kitchen, bathrooms, and informal family sitting spaces. Its garden is designed for family use, with fruit trees, a central pool, and planted borders that create a self-contained domestic paradise invisible from the street.",
    tip: "Do: Design the Andaruni around its own separate garden court, accessed only through the Biruni (outer quarters) via a screened corridor — even in compact urban sites, a 3 m × 3 m light well with a fountain and potted plants achieves the spatial and spiritual purpose of the inner garden.",
    related: ["biruni", "haramlik", "hawsh"],
  },
  {
    id: "biruni",
    term: "Biruni",
    arabic: "بِيرُونِي",
    transliteration: "Bi-rú-ni",
    category: "privacy",
    definition:
      "Biruni (Persian: 'outer') is the public outer section of a Persian traditional house — the zone accessible to guests and business visitors that corresponds to the Arab Salamlik. The Biruni typically contains the main reception room, a formal garden, the main entrance vestibule, and guest facilities. It forms the social face of the household without compromising the privacy of the Andaruni. The spatial boundary between Biruni and Andaruni was traditionally marked by a screened doorway, a change in floor level, or a winding passage that prevented sightlines from penetrating the inner quarters.",
    tip: "Do: Separate the Biruni from the Andaruni with at least one 90-degree directional change in the connecting passage and a locked door — this ensures guests can be hosted generously in the outer zone without any risk of inadvertently accessing family spaces.",
    related: ["andaruni", "salamlik", "bab"],
  },
  {
    id: "jali",
    term: "Jali",
    arabic: "جالي",
    transliteration: "Já-li",
    category: "privacy",
    definition:
      "Jali (from Sanskrit 'jala' — net/lattice) is the pierced stone, terracotta, or timber screen used extensively in Indo-Islamic architecture to filter light, air, and views. The Jali achieves the apparently contradictory goals of maximum ventilation and maximum visual privacy: its intricate geometric or floral patterns allow air and dappled light to pass through while preventing direct views into the interior. Famous examples include the Jali screens of the Fatehpur Sikri and Humayun's Tomb complexes. In residential use, Jali is the primary device for screening windows, balconies, and garden walls that face semi-public spaces.",
    tip: "Do: Use Jali screens with an open-to-solid ratio of 40:60 to 50:50 for optimum performance — higher open ratios compromise privacy, while lower ratios restrict ventilation; GRC (glass-reinforced concrete) Jali panels are cost-effective and durable for contemporary residential use.",
    related: ["mashrabiya", "haram", "lattice"],
  },

  // ── LIGHT (3) ─────────────────────────────────────────────────────────────────
  {
    id: "mashrabiya",
    term: "Mashrabiya",
    arabic: "مَشْرَبِيَّة",
    transliteration: "Mash-ra-bíy-ya",
    category: "light",
    definition:
      "The Mashrabiya (also spelled Mashrabiyya) is a type of oriel window enclosed with carved wooden latticework, projecting from the upper floor of traditional Arab urban buildings. Its name derives from 'mashraba' (drinking place) as it was often fitted with a clay pot holder for cooling drinking water in the breeze. The Mashrabiya simultaneously provides privacy (interior not visible from street), ventilation (air passes through the lattice), light modulation (dappled, reduced-glare daylight), and thermal cooling (the clay pots and moist wood lower air temperature). It is one of the most climatically sophisticated passive devices in the history of world architecture.",
    tip: "Do: Specify turned-wood mashrabiya panels with dowel spacing of 30–50 mm for a traditional appearance — project the enclosure 300–600 mm beyond the wall plane to maximise downward view angles while maintaining privacy from below; use in east and north orientations for optimal daylighting.",
    related: ["jali", "lattice", "haram"],
  },
  {
    id: "lattice",
    term: "Lattice Screen",
    arabic: "شَبَكَة",
    transliteration: "Sha-bá-ka",
    category: "light",
    definition:
      "The lattice screen (Shabaka) is the broader category of perforated or woven screen panels used throughout Islamic architecture to filter light and air while maintaining privacy. Unlike the carved wooden Mashrabiya (specific to Arab architecture) or the stone Jali (specific to Indo-Islamic architecture), the lattice screen encompasses metal, glass, GRC, timber, and ceramic variants used in contemporary Islamic-inspired design. In modern residential design, laser-cut metal lattice panels with geometric Islamic patterns are widely used as balcony balustrades, window screens, and entry gates — combining traditional spatial values with contemporary manufacturing.",
    tip: "Do: Commission laser-cut corten steel or aluminium lattice panels with classical Islamic geometric patterns — an 8-pointed star (khatam) or 12-fold geometric repeat provides the most recognisable Islamic visual language while giving privacy protection equivalent to a 40% solid wall.",
    related: ["mashrabiya", "jali", "geometric-pattern"],
  },
  {
    id: "surah-al-nur",
    term: "Surah al-Nur (Divine Light)",
    arabic: "سُورَةُ النُّور",
    transliteration: "Sú-rat un-Núr",
    category: "light",
    definition:
      "Surah al-Nur (Chapter 24 of the Quran, 'The Light') contains the celebrated 'Light Verse' (Ayat al-Nur, 24:35): 'Allah is the Light of the heavens and the earth — His light is like a niche in which is a lamp, the lamp within glass, the glass as if it were a pearlescent star...' This verse has profoundly influenced Islamic architectural theory: the mosque's lantern dome, the mihrab's concave geometry concentrating light, the mashrabiya's dappled interior glow, and the use of stained glass in sacred spaces are all architectural interpretations of divine light as described in this surah. In residential design, it inspires the pursuit of beautiful, modulated natural light as a spiritual dimension of home design.",
    tip: "Do: Design at least one room in an Islamic-inspired home where natural light enters through a perforated screen or coloured glass, creating dappled or tinted light on interior surfaces — this light experience, referencing Surah al-Nur's niche metaphor, transforms an ordinary room into a space of contemplative beauty.",
    related: ["mashrabiya", "jali", "mihrab"],
  },

  // ── WATER (3) ─────────────────────────────────────────────────────────────────
  {
    id: "wudu",
    term: "Wudu",
    arabic: "وُضُوء",
    transliteration: "Wu-dú",
    category: "water",
    definition:
      "Wudu is the Islamic ritual of ablution — the prescribed washing of hands, face, forearms, head, and feet before Salah (prayer). Performed five times daily, Wudu requires a clean water source and a dedicated space for washing. In residential design, providing a purpose-built Wudu area adjacent to or within the prayer room (musalla) streamlines the ritual and maintains the cleanliness of family bathrooms during prayer times. The Wudu space should have a low basin or step-down area for foot washing, a non-slip floor, and a qibla-oriented direction of travel toward the prayer space.",
    tip: "Do: Design a compact Wudu station (minimum 0.9 m × 1.2 m) immediately adjacent to the musalla — include a floor-level basin or removable tray for foot washing, a towel hook, and a bench or fold-down seat for elderly family members who cannot stand while washing.",
    related: ["musalla", "qibla", "hawsh"],
  },
  {
    id: "hawsh",
    term: "Hawsh",
    arabic: "حَوْش",
    transliteration: "Hawsh",
    category: "water",
    definition:
      "Hawsh is the Egyptian Arabic term for the central courtyard of a traditional house — equivalent to the Sahn in classical Arabic or the Andaruni/Biruni courtyard complex in Persian architecture. In traditional Cairene architecture, the Hawsh is the primary source of light and air, surrounded by the house's rooms on all four sides with a loggia (qa'a) on one or two sides. A central fountain or planted garden in the Hawsh provides evaporative cooling, acoustic privacy (the sound of water masks interior conversations from neighbouring buildings), and visual serenity. The Hawsh is typically accessible only from within the house, reinforcing the inward-looking Islamic domestic plan.",
    tip: "Do: Include a central water feature (fountain, channel, or basin) in the Hawsh measuring at least 1% of the courtyard area — even a small 0.6 m diameter circular fountain provides meaningful evaporative cooling and the psychoacoustic benefit of masking urban noise.",
    related: ["sahn", "bustan", "andaruni"],
  },
  {
    id: "hosh",
    term: "Hosh",
    arabic: "هُوش",
    transliteration: "Hosh",
    category: "water",
    definition:
      "Hosh (also Haush) refers specifically to a large open courtyard used for communal gatherings, livestock, or functional outdoor work in traditional Sudanese, Iraqi, and Levantine domestic architecture — distinct from the more intimate Sahn of a mosque. In Iraqi traditional houses, the Hosh is the generous central open space around which all family activities are organised, often planted with fruit trees (pomegranate, citrus, fig) and containing a central pool (howdh) fed by the city's irrigation system (qanat). The Hosh represents the Islamic ideal of the garden as paradise (from Persian 'pairi-daeza') — a place of shade, water, fruit, and beauty within the protective walls of the home.",
    tip: "Do: Plant the Hosh with at least three species of fruit-bearing trees of different heights to create a layered canopy — figs, pomegranates, and date palms are traditional and provide shade, food, and fragrance aligned with Quranic descriptions of paradise.",
    related: ["sahn", "hawsh", "bustan"],
  },

  // ── ORNAMENTATION (4) ─────────────────────────────────────────────────────────
  {
    id: "muqarnas",
    term: "Muqarnas",
    arabic: "مُقَرْنَص",
    transliteration: "Mu-qar-nas",
    category: "ornamentation",
    definition:
      "Muqarnas (also stalactite or honeycomb vaulting) is a distinctive Islamic architectural ornament consisting of a three-dimensional system of niche-like elements arranged in tiers to create a complex, stalactite-like surface on vaults, domes, portals, and niches. Unlike Western ornament, which is typically applied to a structure, muqarnas is structural in its logic — each tier of niches is corbelled outward from the previous, creating a geometric crystalline surface that transforms a square plan into a circular dome through a cascade of prismatic cells. In residential design, muqarnas appears in entrance vaults, fountain canopies, and decorative ceiling panels.",
    tip: "Do: Use cast plaster or GRC (glass-reinforced concrete) muqarnas panels as a canopy over the main entrance vestibule — a 600–900 mm deep muqarnas vault transforms an ordinary door surround into a distinctive Islamic spatial gesture at modest cost.",
    related: ["iwan", "geometric-pattern", "shan-nashin"],
  },
  {
    id: "bustan",
    term: "Bustan",
    arabic: "بُسْتَان",
    transliteration: "Bus-tán",
    category: "ornamentation",
    definition:
      "Bustan (Arabic/Persian: 'garden' or 'orchard') refers to the enclosed garden of an Islamic house or palace — a carefully designed outdoor space planted with fruit trees, fragrant flowers, water channels (juyush), and fountains. The Bustan is the residential expression of the Quranic paradise (Jannah) — described in the Quran as a garden of flowing rivers, fruit trees, and perfect shade — brought into the domestic realm. The four-part garden plan (char-bagh) originating in Persian garden design, divides the garden into quadrants by two crossing water channels, symbolising the four rivers of paradise.",
    tip: "Do: Adopt the char-bagh layout for even a small residential garden by dividing it into four quadrants with a central fountain or water feature at the crossing point — plant each quadrant with different aromatic or fruiting species for sensory variety aligned with Islamic garden traditions.",
    related: ["sahn", "hosh", "hawsh"],
  },
  {
    id: "geometric-pattern",
    term: "Geometric Pattern",
    arabic: "نَقْش هَنْدَسِي",
    transliteration: "Naqsh Han-da-sí",
    category: "ornamentation",
    definition:
      "Islamic geometric pattern (Naqsh Handassi) is the sophisticated system of interlocking polygonal forms — stars, hexagons, octagons, and their derivatives — used to ornament surfaces throughout Islamic architecture. Unlike figurative art (avoided in religious contexts), geometric pattern is considered an expression of divine order: the infinite repeatability of the pattern suggests Allah's boundless creation, while its precise mathematical construction demonstrates the Islamic tradition of combining art and science. Patterns are typically constructed on grids of 4-, 6-, 8-, 10-, or 12-fold symmetry, each carrying different aesthetic and associative qualities.",
    tip: "Do: Use Islamic geometric tile patterns (zellige or encaustic cement tiles) on the floor and lower walls of the Sahn and entry vestibule — the repetitive geometry creates visual richness at low cost while its mathematical precision rewards close attention; limit the palette to 2–3 colours for domestic-scale restraint.",
    related: ["muqarnas", "jali", "mashrabiya"],
  },
  {
    id: "shan-nashin",
    term: "Shan Nashin",
    arabic: "شَانَ نَشِين",
    transliteration: "Shán Na-shin",
    category: "ornamentation",
    definition:
      "Shan Nashin (Persian/Urdu: 'place of dignity' or 'royal sitting') refers to a projected bay window or oriel room that cantilevers from the upper floor of a traditional haveli or Persian townhouse, overlooking the street or courtyard below. The Shan Nashin is typically the most elaborately decorated element of the facade, with carved wooden brackets, turned columns, lattice screens, and a deep projecting canopy that shades the space below. It functions simultaneously as a private vantage point for surveying the street (maintaining purdah while allowing observation), an additional sitting room that captures breeze, and an architectural embellishment that enriches the urban streetscape.",
    tip: "Do: Project the Shan Nashin 600–900 mm beyond the building line on brackets at the upper floor — this projection provides shade to the entrance below, increases the usable area of the upper room, and creates a distinctive architectural identity for the home on the street.",
    related: ["mashrabiya", "jali", "muqarnas"],
  },

  // ── JURISPRUDENCE (3) ─────────────────────────────────────────────────────────
  {
    id: "ziyada",
    term: "Ziyada",
    arabic: "زِيَادَة",
    transliteration: "Zi-yá-da",
    category: "jurisprudence",
    definition:
      "Ziyada (Arabic: 'addition' or 'outer enclosure') refers to the outer precinct or buffer zone surrounding a mosque or sacred compound — a transitional realm between the city's public life and the sacred interior. In Islamic jurisprudence and urban planning, the concept of Ziyada also informed the design of streets adjacent to sacred buildings, ensuring that the sacred precinct was not directly confronted by commercial noise, residential windows overlooking the mosque, or any activity deemed incompatible with the dignity of the sacred space. In residential design, the principle translates to the creation of a transitional buffer zone between the street and the private home.",
    tip: "Do: Design a Ziyada-inspired buffer zone at the street boundary — a planted forecourt, gate house, or walled entry garden 3–5 m deep between the street gate and the main house door creates the transitional calm that Islamic spatial tradition considers essential for dignified domestic life.",
    related: ["bab", "dar", "salamlik"],
  },
  {
    id: "riwaq",
    term: "Riwaq",
    arabic: "رِوَاق",
    transliteration: "Ri-wáq",
    category: "jurisprudence",
    definition:
      "Riwaq is an arcaded or colonnaded gallery surrounding the courtyard of a mosque or madrasa — the covered walkway that defines the perimeter of the sahn and provides shaded circulation connecting the prayer hall with other functions. In residential design, the Riwaq concept informs the design of covered perimeter galleries around the central courtyard: a shaded walkway of 1.5–2.5 m depth that allows movement around the house without exposure to sun or rain, creates visual rhythm through its repetitive arcade, and provides an intermediate zone between the open courtyard and the enclosed rooms. The Riwaq is one of the most climatically effective spatial devices in hot arid and hot humid climates.",
    tip: "Do: Design the residential Riwaq with a minimum depth of 1.8 m and a colonnade or arcade rhythm of 2.4–3.0 m bay width — this creates a usable secondary outdoor living space and dramatically reduces solar gain on the rooms behind it by providing external shading.",
    related: ["sahn", "iwan", "talar"],
  },
  {
    id: "bab",
    term: "Bab",
    arabic: "بَاب",
    transliteration: "Bab",
    category: "jurisprudence",
    definition:
      "Bab (Arabic: 'gate' or 'door') is the primary entrance gate of an Islamic house, mosque, or city — one of the most legally and spiritually significant elements in Islamic architectural tradition. In Islamic jurisprudence (fiqh), the rules governing the Bab are extensive: a visitor must knock and announce themselves before entering (based on Quran 24:27–28 and multiple hadith), the door must not open directly onto a neighbour's private space, and the height and width of the door carry social significance (a taller, wider Bab indicates higher status). The threshold of the Bab is a transitional zone with its own rituals — removing shoes, announcing one's arrival, and requesting permission.",
    tip: "Do: Design the main entrance Bab with an offset or screened vestibule immediately inside — the Islamic tradition of 'istidhan' (seeking permission before entry) is encoded in architecture by ensuring that opening the front door does not immediately expose interior spaces; a 90-degree turn or a screen wall inside the door achieves this.",
    related: ["dar", "ziyada", "salamlik"],
  },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const ISLAMIC_CATEGORIES = [
  "orientation",
  "spaces",
  "privacy",
  "light",
  "water",
  "ornamentation",
  "jurisprudence",
];

export const BELIEF_RULES = {
  islamic: [
    "Orient the prayer room (musalla) with its primary wall perpendicular to the Qibla direction; include a recessed mihrab niche to mark the sacred axis.",
    "Separate all public guest zones (salamlik/biruni) from private family zones (haramlik/andaruni) with at least two spatial turns or a locked screened door and a change of level.",
    "Design the street-facing facade with minimal openings (max 15% window-to-wall ratio); use mashrabiya or jali screens wherever a window faces a street, neighbour, or semi-public space.",
    "Centre the plan on an inward-facing courtyard (sahn/hawsh) with a minimum size of 15% of the total house footprint; include a water feature for evaporative cooling.",
    "Provide a dedicated wudu station adjacent to the musalla with a floor-level basin for foot washing and a non-slip floor surface.",
    "Plant the courtyard garden as a char-bagh (four-quadrant paradise garden) with fragrant and fruit-bearing species, a central fountain, and crossing water channels.",
    "Ensure the main entrance Bab has an offset vestibule inside so that opening the front door does not expose interior spaces to the street.",
    "Use perforated geometric lattice screens (jali/mashrabiya/shabaka) on all windows and balconies facing semi-public spaces; achieve 40–50% open ratio for air flow with privacy.",
    "Include a covered perimeter arcade (riwaq) of minimum 1.8 m depth around the courtyard to provide shaded all-weather circulation and reduce solar gain on room walls.",
    "Apply Islamic geometric pattern (zellige, encaustic tile, or laser-cut metal) to the entry vestibule, courtyard floor, and prayer room walls to express divine order through ornament.",
    "Design all corridors connecting public to private zones to be indirect (L- or U-shaped) with no direct sightlines penetrating from entrance to any bedroom or family space.",
    "Include a projecting bay (shan nashin/mashrabiya bay) on the street facade at upper floor level to provide a private observation point and shade the entrance below.",
  ],
};
