// ─── Vastu AI — Christian Architectural Design Terms ──────────────────────────
// 28 Christian residential and sacred architecture glossary terms with Latin,
// definitions, and practical residential design tips.
//
// Categories: 'orientation' | 'sacred-geometry' | 'spaces' | 'light'
//             'symbolism' | 'liturgical' | 'garden'

export const CHRISTIAN_TERMS = [
  // ── ORIENTATION (3) ──────────────────────────────────────────────────────────
  {
    id: "orientatio",
    term: "Orientatio",
    latin: "Orientatio",
    category: "orientation",
    definition:
      "Orientatio is the Latin term for the ancient Christian practice of orienting churches so that the altar end (apse) faces east — toward Jerusalem, the rising sun, and the anticipated direction of Christ's Second Coming. The word 'orientation' in modern English derives directly from this architectural tradition. Early Christian basilicas, Romanesque churches, and Gothic cathedrals were almost universally east-facing, creating a building whose long axis served as a cosmological arrow aligned with the sun's daily path. In residential Christian design, orientatio inspires the placement of the home chapel, morning room, or primary devotional space on the east side to receive the first light of day — a daily architectural act of theological renewal.",
    tip: "Do: Position the home prayer room, morning room, or breakfast area on the east side of the house — an east-facing window that receives sunrise light creates a daily experience of orientatio, connecting domestic morning routine to Christian spiritual tradition.",
    related: ["lux-divina", "apse", "pilgrimage-axis"],
  },
  {
    id: "pilgrimage-axis",
    term: "Pilgrimage Axis",
    latin: "Via Sacra",
    category: "orientation",
    definition:
      "The Pilgrimage Axis (Via Sacra — Sacred Way) is the primary processional route that leads from the secular exterior world through transitional spaces (narthex, nave) to the sacred interior of a church or basilica. In urban contexts it extends outward through colonnaded streets, atria, and forecourts. This spatial sequence is not merely functional but spiritually transformative: each threshold crossed represents a degree of intensified holiness and a step inward from the world toward the divine. In residential design, the pilgrimage axis translates to a considered sequence of entry spaces that prepare and transition the occupant from the public street to the private interior.",
    tip: "Do: Design the entry sequence of the home as a Via Sacra — a gated forecourt, a covered porch (portico), an entry hall, then the main living spaces — using materials, light levels, and ceiling heights that progressively shift character from public to intimate as one moves inward.",
    related: ["orientatio", "narthex", "atrium"],
  },
  {
    id: "calvary",
    term: "Calvary",
    latin: "Calvarium",
    category: "orientation",
    definition:
      "Calvary (from Latin Calvarium — 'place of the skull') refers to the hill on which the crucifixion of Christ occurred, and in architectural terms, to the outdoor Stations of the Cross path — a processional route of 14 stopping points that re-enacts the journey of Christ to Golgotha. Calvary gardens and outdoor Stations of the Cross paths are found in monastery gardens, parish grounds, and occasionally in the gardens of devout Christian households. The path typically follows a circular, spiral, or linear route through a garden with stone or bronze relief panels at each station, creating a meditative ambulatory that combines prayer, movement, and nature.",
    tip: "Do: Design a Calvary path in the residential garden as a gravel or stone-paved walkway of 40–60 m total length, with 14 stopping points marked by carved stone relief plaques or simple wooden crosses — plant fragrant species (rosemary, lavender, rose) at each station to engage the senses during meditative walking.",
    related: ["paradise-garden", "labyrinth", "ambulatory"],
  },

  // ── SACRED GEOMETRY (4) ───────────────────────────────────────────────────────
  {
    id: "sacred-geometry",
    term: "Sacred Geometry",
    latin: "Geometria Sacra",
    category: "sacred-geometry",
    definition:
      "Sacred Geometry (Geometria Sacra) is the application of geometric principles believed to embody divine order to the design of churches, monasteries, and sacred buildings. Medieval Christian architects and master builders (magistri comacini) used specific proportional relationships — the Golden Ratio, the Vesica Piscis, root-2 and root-3 rectangles — to establish the dimensions of cathedrals, believing that these ratios reflected the mathematical harmony with which God created the universe (referencing Wisdom 11:20: 'Thou hast ordered all things in measure and number and weight'). In residential design, sacred geometry offers a principled, non-arbitrary system for establishing room proportions, window sizes, and spatial relationships.",
    tip: "Do: Apply the root-2 rectangle (1:√2 = 1:1.414) to your principal room dimensions — a room 4 m × 5.66 m embodies this proportion, which appears throughout Gothic cathedral design and is considered the most harmonious rectangle in Christian sacred geometry.",
    related: ["golden-ratio", "vesica-piscis", "proportio"],
  },
  {
    id: "golden-ratio",
    term: "Golden Ratio",
    latin: "Sectio Aurea",
    category: "sacred-geometry",
    definition:
      "The Golden Ratio (Sectio Aurea — φ ≈ 1.618) is the mathematical proportion in which the ratio of the whole to the larger part equals the ratio of the larger part to the smaller. Known since classical antiquity and given its most famous expression by Luca Pacioli in 'De Divina Proportione' (1509) — illustrated by Leonardo da Vinci — the Golden Ratio was considered by Christian architects and philosophers to embody divine perfection in mathematical form. It appears in the proportions of the Parthenon, the Gothic cathedral's nave, and Michelangelo's Sistine Chapel. In residential design, golden-ratio room proportions (e.g., 3 m × 4.85 m, or 4 m × 6.47 m) are believed to create spaces that feel inherently balanced and harmonious.",
    tip: "Do: Use the golden ratio to set the proportional relationship between the main living room's length and width — for a 4 m wide room, design a length of 6.47 m (4 × 1.618); this proportion recurs in windows, door heights, and ceiling heights to create systemic harmony throughout the home.",
    related: ["sacred-geometry", "proportio", "vesica-piscis"],
  },
  {
    id: "vesica-piscis",
    term: "Vesica Piscis",
    latin: "Vesica Piscis",
    category: "sacred-geometry",
    definition:
      "The Vesica Piscis (Latin: 'bladder of the fish') is the geometric shape formed by the intersection of two circles of equal radius, each passing through the other's centre. The resulting almond-shaped mandorla (aureola) was used extensively in early Christian and medieval art to frame depictions of Christ, the Virgin Mary, and saints in glory — its pointed-oval form suggesting the divine light surrounding holy figures. In architecture, the Vesica Piscis generated the pointed arch of Gothic cathedral windows, doorways, and vaults, and its proportions (height:width = √3:1 ≈ 1.732:1) determined the shape of many Gothic facades.",
    tip: "Do: Use the Vesica Piscis proportion (height:width of 1.73:1) for tall window openings in the home chapel or prayer room — this pointed-arch proportion creates the distinctively Gothic and spiritually resonant window shape that links domestic sacred space to the cathedral tradition.",
    related: ["sacred-geometry", "golden-ratio", "clerestory"],
  },
  {
    id: "proportio",
    term: "Proportio",
    latin: "Proportio",
    category: "sacred-geometry",
    definition:
      "Proportio is the Latin term for proportion — the principled mathematical relationship between parts of a building that creates visual harmony and structural elegance. In Christian architectural theory, proportion was understood not as arbitrary convention but as participation in divine order: Vitruvius's three principles of architecture (firmitas, utilitas, venustas — strength, utility, beauty) were reinterpreted by Christian architects as reflections of divine attributes. The 'harmonic proportions' derived from musical intervals (1:2 octave, 2:3 fifth, 3:4 fourth) were used by medieval architects to set the ratios between bay widths, aisle heights, and nave heights — creating buildings whose visual harmony was experienced as a resonance with cosmic order.",
    tip: "Do: Establish a proportional module for the home — for example, set the door height as the base module M (2.1 m) and derive all other dimensions from it: room height = 1.5M (3.15 m), main room width = 2M (4.2 m), ceiling coving = 0.1M (0.21 m) — this systemic approach to proportion creates a coherent spatial character throughout.",
    related: ["sacred-geometry", "golden-ratio", "fenestration"],
  },

  // ── SPACES (6) ────────────────────────────────────────────────────────────────
  {
    id: "nave",
    term: "Nave",
    latin: "Navis",
    category: "spaces",
    definition:
      "The Nave (from Latin 'navis' — ship) is the central hall of a Christian church — the primary congregational space running from the narthex (entrance vestibule) to the chancel or apse. The ship metaphor (navis Ecclesia — the ship of the Church) positions the nave as the vessel that carries the faithful through earthly life toward divine salvation. In residential design, the nave's spatial qualities — a long, directional hall with high ceilings, clerestory light, and a clear processional axis — inform the design of galleries, double-height hallways, and great rooms that create a sense of spatial dignity and purposeful movement.",
    tip: "Do: Apply the nave principle to the home's principal corridor or gallery — a ceiling height of 1.5× the width, with a skylight or clerestory window at the far end drawing the eye forward, creates a sense of directional spatial drama derived from basilica design.",
    related: ["narthex", "apse", "clerestory"],
  },
  {
    id: "narthex",
    term: "Narthex",
    latin: "Narthex",
    category: "spaces",
    definition:
      "The Narthex is the entrance vestibule or porch of a Christian church — the transitional space between the secular exterior and the sacred nave. In early Christian basilicas, the narthex was the zone reserved for catechumens (those not yet baptised) who could hear the liturgy but not fully participate. Architecturally, the narthex is a compression zone — lower in ceiling height than the nave, dimmer, and narrower — that makes the subsequent expansion into the nave feel all the more dramatic and spiritually significant. In residential design, the narthex principle inspires the design of entry halls that compress and transition the visitor before opening into the expansive living spaces beyond.",
    tip: "Do: Design the entry hall as a deliberate compression zone — lower ceiling height (2.2–2.4 m) with minimal natural light — that opens suddenly into the main living space with a higher ceiling (2.7–3.2 m) and generous windows; this spatial contrast dramatically enhances the sense of arrival in the home.",
    related: ["nave", "atrium", "portico"],
  },
  {
    id: "apse",
    term: "Apse",
    latin: "Apsis",
    category: "spaces",
    definition:
      "The Apse (from Latin 'apsis' — arch/vault) is the semicircular or polygonal recess at the east end of a basilica or church, housing the altar, bishop's throne, and the most sacred focus of the liturgical space. Its semicircular geometry concentrates acoustic energy toward the altar (amplifying liturgical chant), reflects diffuse light from a window above, and creates a spatial focal point that draws the eye and body of the congregation forward. The apse is the architectural climax of the pilgrimage axis — the point toward which all movement and attention in the church is directed. In residential design, apse-inspired semicircular bays or alcoves create powerful focal points in dining rooms, libraries, and prayer spaces.",
    tip: "Do: Use an apse-shaped bay (semicircular or three-sided polygonal) at the focal end of the main dining room or library — sized at 2.4–3.0 m diameter, with a vaulted ceiling and a central window, this feature creates a spatial focus that dignifies the room and draws occupants toward its centre.",
    related: ["nave", "orientatio", "ambulatory"],
  },
  {
    id: "cloister",
    term: "Cloister",
    latin: "Claustrum",
    category: "spaces",
    definition:
      "The Cloister (from Latin 'claustrum' — enclosure) is the covered arcaded walkway surrounding a square courtyard in a monastery — the spatial heart of monastic life, used for meditation, reading, and quiet movement. The cloister is one of Western architecture's most enduring spatial inventions: its combination of an open central garden (garth), a covered perimeter arcade, regular proportions, and enclosed quiet creates an environment of sustained tranquillity. It is the Christian West's equivalent of the Islamic sahn with riwaq — an inward-looking, arcaded courtyard that mediates between architecture and nature. In residential design, cloister-inspired covered arcades around a garden courtyard create the most serene domestic environments.",
    tip: "Do: Design a residential cloister by surrounding a square or rectangular garden (minimum 6 m × 6 m) with a covered arcade of 1.5–2.0 m depth on at least three sides — use consistent bay proportions (width:height of 1:2) and planting that changes with the seasons to create a meditative courtyard garden.",
    related: ["ambulatory", "paradise-garden", "atrium"],
  },
  {
    id: "ambulatory",
    term: "Ambulatory",
    latin: "Ambulatorium",
    category: "spaces",
    definition:
      "The Ambulatory (from Latin 'ambulare' — to walk) is the curved passage that wraps around the apse of a Romanesque or Gothic church, allowing pilgrims to circulate around the high altar and access the radiating chapels behind it without disturbing the main liturgy. The ambulatory is a spatial solution to the tension between accessibility and sanctity: it allows movement and approach without intrusion. In residential design, the ambulatory principle informs the design of circulation paths that wrap around private spaces — a corridor that rings the master suite, a gallery that circles the library — creating access without confrontation.",
    tip: "Do: Design the residential ambulatory as a gallery or corridor that wraps around the perimeter of a central private room (study, library, or master bedroom) — this creates multiple points of access, promotes spatial continuity, and allows the central room to be experienced as the home's still point.",
    related: ["cloister", "calvary", "nave"],
  },
  {
    id: "sacristy",
    term: "Sacristy",
    latin: "Sacristia",
    category: "spaces",
    definition:
      "The Sacristy (from Latin 'sacristia' — sacred repository) is the room in a church adjoining the sanctuary where the priest prepares for the liturgy and sacred vessels, vestments, and books are stored. It is the backstage of sacred architecture — a service room that is spatially and spiritually adjacent to the altar without being visible to the congregation. In residential design, the sacristy principle informs the design of dedicated preparation rooms adjacent to the prayer space: a small room for liturgical books, candles, incense, devotional objects, and ritual supplies that keeps the prayer space itself clean and focused.",
    tip: "Do: Provide a small sacristy room (minimum 1.5 m × 2.0 m) adjacent to the home chapel or prayer room — used for storing religious objects, a Bible stand, candles, incense, and seasonal decorations, it keeps the main prayer space free of clutter and maintains a clear distinction between preparation and worship.",
    related: ["sanctuary", "nave", "iconostasis"],
  },
  {
    id: "sanctuary",
    term: "Sanctuary",
    latin: "Sanctuarium",
    category: "spaces",
    definition:
      "The Sanctuary (from Latin 'sanctuarium' — holy place) is the most sacred zone of a Christian church — the area around the altar, separated from the nave by steps, a screen (iconostasis or rood screen), or a change in floor material. The word has entered common English with the meaning of any protected, inviolable place of refuge — 'sanctuary' denotes a space where ordinary rules are suspended and safety, peace, or holiness are guaranteed. In residential design, the sanctuary principle is the inspiration for the most private and sacred room of the home: a dedicated prayer room, meditation space, or personal chapel that functions as the household's holy of holies.",
    tip: "Do: Raise the floor of the home sanctuary by one or two steps above the adjacent corridor level — this simple threshold change between the profane floor level and the sacred space mimics the sanctuary step of the church and creates a physical act of transition every time the space is entered.",
    related: ["sacristy", "iconostasis", "nave"],
  },

  // ── LIGHT (3) ─────────────────────────────────────────────────────────────────
  {
    id: "clerestory",
    term: "Clerestory",
    latin: "Fenestrae Clarae",
    category: "light",
    definition:
      "The Clerestory (from Medieval English 'clere storey' — clear storey; Latin 'fenestrae clarae' — clear windows) is the upper zone of a church's nave walls, above the triforium arcade and below the vaulted ceiling, pierced with large windows that flood the interior with direct overhead light. In Gothic architecture the clerestory was progressively enlarged until the wall almost entirely disappeared into stained glass — Abbot Suger's Saint-Denis (1140) pioneered this dematerialisation of walls through light. The theological premise was that divine light entering from above represented the Holy Spirit illuminating the earthly congregation. In residential design, clerestory windows are the most effective way to introduce high-level directional light without compromising wall space.",
    tip: "Do: Install clerestory windows on the south-facing wall of any double-height room at a height of 2.4–3.0 m above finished floor level — this brings winter sun deep into the room without glare at occupant eye level and provides cross-ventilation when openable; match window dimensions to golden-ratio or Vesica Piscis proportions.",
    related: ["lux-divina", "fenestration", "nave"],
  },
  {
    id: "fenestration",
    term: "Fenestration",
    latin: "Fenestratio",
    category: "light",
    definition:
      "Fenestration (from Latin 'fenestra' — window) refers to the arrangement, proportion, and design of windows in a building — a discipline that in Christian sacred architecture was elevated to theological significance. The window is the primary means by which divine light (lux divina) enters the built environment: its shape, orientation, glazing, and relationship to the wall are all charged with meaning. Romanesque fenestration used small, round-headed windows to create strong light-shadow contrasts suggesting divine transcendence within massive walls. Gothic fenestration pushed windows to their structural maximum to maximise the entry of lux divina. In residential design, fenestration is the most powerful tool for creating spiritually resonant interior light.",
    tip: "Do: Design window compositions on the basis of proportional ratios rather than arbitrary dimensions — set window height as φ (golden ratio) times its width for tall windows, or √2 times its width for shorter windows; group windows in symmetrical compositions that reflect medieval bay-window rhythm.",
    related: ["clerestory", "lux-divina", "sacred-geometry"],
  },
  {
    id: "lux-divina",
    term: "Lux Divina",
    latin: "Lux Divina",
    category: "light",
    definition:
      "Lux Divina (Latin: 'Divine Light') is the theological concept central to Christian sacred architecture from Abbot Suger's Gothic revolution onward — the identification of physical light with divine grace, the presence of God, and the illumination of the soul. John 1:4–5 ('In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it') and John 8:12 ('I am the light of the world') established light as a primary theological attribute of Christ in Christian theology. Gothic architects translated this theology directly into architectural innovation: thin stone piers replaced thick walls, stained glass replaced solid stone, and the interior was transformed into a luminous vessel of coloured divine light.",
    tip: "Do: Introduce at least one room in the home where natural light enters through coloured or textured glass — even a small panel of amber, gold, or pale blue glass in a strategically placed window transforms ordinary sunlight into Lux Divina, creating moments of transcendent beauty that change throughout the day.",
    related: ["clerestory", "fenestration", "orientatio"],
  },

  // ── SYMBOLISM (4) ─────────────────────────────────────────────────────────────
  {
    id: "cruciform",
    term: "Cruciform",
    latin: "Forma Crucis",
    category: "symbolism",
    definition:
      "Cruciform (Latin: 'forma crucis' — form of the cross) describes the Latin cross plan of a Christian church — consisting of a long nave crossed by a transept, forming the shape of the cross of the Crucifixion when viewed from above. The cruciform plan is the dominant typology of Western Christian church architecture from the Carolingian period onward, encoding the central symbol of Christian faith into the building's very footprint. In residential Christian design, the cruciform principle can be expressed in a house plan where a central crossing hall intersects two perpendicular wings, creating a spatial organisation whose geometry references Christian theology without explicit religious iconography.",
    tip: "Do: Consider a cruciform house plan where a central vestibule or great hall lies at the intersection of two perpendicular axes — even if the overall form is irregular, establishing two primary axes crossing at right angles at the home's heart encodes a structural cross into the domestic plan.",
    related: ["transept", "nave", "sacred-geometry"],
  },
  {
    id: "transept",
    term: "Transept",
    latin: "Transeptum",
    category: "symbolism",
    definition:
      "The Transept (from Latin 'transeptum' — divided enclosure) is the lateral arm of a cruciform church plan, crossing the nave at right angles to form the arms of the cross. The intersection of nave and transept is called the crossing, typically marked by a dome, tower (campanile above the crossing), or lantern that floods this sacred junction with light from above. The transept adds usable chapels, processional space, and visual complexity to the interior while serving as the literal embodiment of the cross-form in plan. In residential design, the transept principle informs the design of lateral wings that cross the main axis, creating L-shaped, T-shaped, or cruciform house plans with a central generous crossing space.",
    tip: "Do: Mark the intersection of the home's two principal axes (the 'crossing') with a double-height ceiling, a skylight, or a dome — this spatial celebration of the crossing point echoes the lantern tower of the medieval transept and creates the home's most luminous and memorable space.",
    related: ["cruciform", "nave", "campanile"],
  },
  {
    id: "baldachin",
    term: "Baldachin",
    latin: "Baldachinum",
    category: "symbolism",
    definition:
      "The Baldachin (or Baldachino; from Latin 'baldachinum', from Baldacco — Baghdad, where the fabric originated) is the architectural canopy or ciborium placed over an altar, throne, or tomb to mark it as a sacred object of veneration. Bernini's bronze Baldachin in St Peter's Basilica (1623–34) is the most famous example — a 29-metre bronze canopy on twisted columns that marks the tomb of St Peter and the high altar below Michelangelo's dome. The baldachin is a vertical architectural accent that creates a sacred precinct within a larger space, marking the most sacred point through height, material richness, and distinctive silhouette.",
    tip: "Do: Use a baldachin-inspired canopy above a dining table, home altar, or reading throne — a simple four-posted wooden canopy of 2.1–2.4 m height marks the seat of honour, creates a room-within-a-room, and introduces a vertical accent that is both architecturally significant and symbolically resonant.",
    related: ["sanctuary", "sacristy", "iconostasis"],
  },
  {
    id: "iconostasis",
    term: "Iconostasis",
    latin: "Iconostasis",
    category: "symbolism",
    definition:
      "The Iconostasis (from Greek 'eikon' — image + 'stasis' — standing) is the screen of icons and religious paintings that separates the nave from the sanctuary in Eastern Orthodox and Eastern Catholic churches. It is not a solid wall but a structured lattice of sacred imagery through which the divine mystery of the Eucharist is glimpsed — at key moments during the liturgy, the Royal Doors at the iconostasis's centre are opened to allow a visual connection between congregation and altar. The iconostasis represents the veil between the earthly and heavenly realms, permeable at appointed times. In residential Eastern Christian design, a dedicated icon corner (Krasny Ugol — 'beautiful corner') functions as a domestic iconostasis.",
    tip: "Do: Designate a high corner of the main living room as the Krasny Ugol (beautiful corner) — install a small shelf or projecting bracket at eye level for icons, with a small oil lamp (kandili) below; this traditional Eastern Christian domestic shrine requires only 0.4–0.6 m of wall space but establishes a powerful devotional focal point.",
    related: ["sanctuary", "sacristy", "baldachin"],
  },

  // ── LITURGICAL (4) ───────────────────────────────────────────────────────────
  {
    id: "baptistry",
    term: "Baptistry",
    latin: "Baptisterium",
    category: "liturgical",
    definition:
      "The Baptistry (Latin: 'baptisterium') is a dedicated building or chamber housing the baptismal font — the first and most foundational sacrament of entry into the Christian community. Early Christian baptisteries were separate buildings, often octagonal (the number eight symbolising resurrection and new creation — the 'eighth day' of a new creation beyond the seven-day week of the old). The baptistry marks the threshold between the world and the Church, functioning architecturally as a transitional space of spiritual rebirth. In residential design, the baptistry principle inspires the design of dedicated water features, threshold fountains, or entry water walls that mark spiritual and spatial transitions.",
    tip: "Do: Install a water feature (wall fountain or floor basin) in the entry vestibule of a Christian home — the sight and sound of water at the threshold echoes the baptismal significance of water in Christian theology and provides a sensory transition between the exterior world and the interior home.",
    related: ["narthex", "threshold", "atrium"],
  },
  {
    id: "threshold",
    term: "Threshold",
    latin: "Limen",
    category: "liturgical",
    definition:
      "The Threshold (Latin: 'limen' — boundary, limit) is the physical and spiritual boundary between two realms — most commonly the doorstep between exterior and interior, profane and sacred, public and private. In Christian theology, the threshold is charged with sacramental significance: Christ describes himself as 'the door' (John 10:9 — 'I am the gate; whoever enters through me will be saved'), and thresholds in sacred buildings are marked with inscriptions, holy water stoups, steps, and changes in material to make the transition visible and intentional. The threshold is both an architectural fact and a spiritual act — crossing it transforms the crosser.",
    tip: "Do: Mark the home's primary threshold with a change in floor material (from exterior paving to interior stone or timber), a step up (minimum 75 mm), and an inscription or decorative element above the door lintel — this multisensory threshold experience makes the act of entry a daily moment of conscious transition.",
    related: ["narthex", "baptistry", "pilgrimage-axis"],
  },
  {
    id: "campanile",
    term: "Campanile",
    latin: "Campanile",
    category: "liturgical",
    definition:
      "The Campanile (Italian, from 'campana' — bell) is the bell tower of a church — a vertical element that marks the sacred building's presence in the urban landscape, calls the faithful to worship, and structures time through the liturgical hours (canonical hours: Lauds, Prime, Terce, Sext, None, Vespers, Compline). The campanile, whether attached to or freestanding from the church, is a vertical exclamation mark in the horizontal urban fabric — its height makes the sacred visible from a distance and its bells make it audible throughout the city. In residential design, the campanile inspires the use of vertical tower elements that give the home a distinctive identity and create elevated lookout or contemplation rooms.",
    tip: "Do: Incorporate a tower element into the home design — even a stairwell tower with a lantern light at the top and a small room at the summit creates a campanile-inspired vertical accent that gives the home a distinctive silhouette and provides a privileged viewpoint for contemplation.",
    related: ["transept", "cruciform", "orientatio"],
  },
  {
    id: "portico",
    term: "Portico",
    latin: "Porticus",
    category: "liturgical",
    definition:
      "The Portico (from Latin 'porticus' — covered walkway) is the colonnaded porch or covered entrance structure of a temple, church, or civic building — the transitional outdoor room that prepares the visitor for entry into the sacred interior. Roman basilicas, Early Christian churches, and Italian Renaissance palaces all used the portico as the threshold device that announced the building's importance, provided shelter for gathering before entry, and established a spatial rhythm of columns that set the proportional scale for the interior. The portico is simultaneously a practical shelter, a social gathering space, and an architectural manifesto — its columns declaring the building's classical heritage and aspirations.",
    tip: "Do: Design the main entrance of a Christian-inspired home with a colonnaded portico of at least two columns, 2.4 m clear height, and 1.5–2.0 m depth — even two timber posts supporting a projecting roof creates the spatial character of a portico and provides covered shelter for gathering at the entrance.",
    related: ["narthex", "threshold", "pilgrimage-axis"],
  },

  // ── GARDEN (4) ────────────────────────────────────────────────────────────────
  {
    id: "paradise-garden",
    term: "Paradise Garden",
    latin: "Hortus Conclusus",
    category: "garden",
    definition:
      "The Paradise Garden (Hortus Conclusus — Latin: 'enclosed garden') is the walled garden of medieval Christian tradition, derived from the Hebrew 'pardes' (paradise — an enclosed garden park) and described in the Song of Songs 4:12 ('A garden enclosed is my sister, my spouse'). In medieval iconography, the Hortus Conclusus represents the virginity of Mary and the pure, protected realm of divine grace — a garden enclosed by high walls, planted with roses (symbol of Mary), lilies (purity), and fruit trees, centred on a fountain (the fountain of life). In residential design, the hortus conclusus tradition inspires walled kitchen gardens, contemplative courtyard gardens, and enclosed therapeutic garden spaces.",
    tip: "Do: Create a Hortus Conclusus by enclosing a garden with walls or hedging at a height of 1.8–2.4 m, planting with herbs, roses, and fruit trees in formal beds, and centring on a stone basin or sundial — even a 6 m × 6 m enclosed garden achieves the spatial character of contemplative enclosure that is central to this tradition.",
    related: ["cloister", "labyrinth", "calvary"],
  },
  {
    id: "labyrinth",
    term: "Labyrinth",
    latin: "Labyrinthus",
    category: "garden",
    definition:
      "The Labyrinth (Latin: 'labyrinthus') in Christian tradition is a unicursal (single-path) walking meditation pattern — distinct from a maze (which has dead ends and choices) — that winds inward to a central point and outward again. The most famous Christian labyrinth is the 13th-century floor labyrinth at Chartres Cathedral, 12.5 m in diameter, designed for pilgrims who could walk it as a symbolic journey to Jerusalem when physical pilgrimage was impossible. The path of the labyrinth is a metaphor for the Christian spiritual journey: winding, sometimes backtracking, but always moving toward and returning from the divine centre. Garden labyrinths of grass, stone, or hedging are a powerful contemplative feature in Christian residential gardens.",
    tip: "Do: Lay out a residential garden labyrinth using the 7-circuit classical pattern in a circular area of 4–5 m diameter — use flat stones, brick, or clipped grass edges; the path need be no wider than 450 mm for a solo walker; position it so the centre can be seen from a key window of the house.",
    related: ["paradise-garden", "calvary", "ambulatory"],
  },
  {
    id: "atrium",
    term: "Atrium",
    latin: "Atrium",
    category: "garden",
    definition:
      "The Atrium is the large open forecourt of an early Christian basilica — an open-to-sky colonnaded courtyard positioned between the urban street and the narthex of the church, functioning as a gathering space, a place of purification (with a central fountain called a cantharus or labrum), and a transitional zone that separated the liturgical assembly from the city. It is the Christian architectural descendant of the Roman domestic atrium (the central courtyard of the Roman domus) and the Greek temenos (sacred precinct). In residential design, the atrium returns to its domestic Roman origins: a sky-open or glazed central courtyard that provides light, air, and a natural gathering point at the heart of the home.",
    tip: "Do: Design the residential atrium as a glazed-roof central courtyard — a minimum 3 m × 3 m central void with a glass or polycarbonate roof brings natural light to all surrounding rooms, creates a natural ventilation stack, and provides a year-round indoor-outdoor garden at the heart of the house.",
    related: ["narthex", "cloister", "paradise-garden"],
  },
  {
    id: "campanile-garden",
    term: "Campanile (Garden Tower)",
    latin: "Turris Hortensis",
    category: "garden",
    definition:
      "The garden tower or turris hortensis (Latin: 'garden tower') is a lookout tower or elevated garden feature found in medieval monastery gardens and English country house estates — a vertical structure in the garden from which the wider landscape could be surveyed, prayer could be offered, or bells could be rung for the hours. Garden towers appear in medieval illuminated manuscripts and monastic plans as elevated platforms for beekeeping, astronomical observation, and contemplation. In residential garden design, a garden tower or elevated platform provides a dramatic vertical accent, a belvedere (beautiful view point), and a space for solitary prayer or reflection above the ground level of daily domestic life.",
    tip: "Do: Build a simple garden tower of 4–5 m height using timber post-and-beam construction — a 2 m × 2 m platform at the top with a simple balustrade provides an elevated garden room, a children's lookout, and a contemplative space that transforms the residential garden into a landscape of vertical as well as horizontal experience.",
    related: ["paradise-garden", "calvary", "campanile"],
  },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const CHRISTIAN_CATEGORIES = [
  "orientation",
  "sacred-geometry",
  "spaces",
  "light",
  "symbolism",
  "liturgical",
  "garden",
];

export const BELIEF_RULES = {
  christian: [
    "Orient the home's primary devotional space (prayer room or chapel) to face east (orientatio), ensuring the east-facing wall or window receives the first light of the morning sun.",
    "Design the entry sequence as a Via Sacra: a forecourt or garden gate, covered portico, entry hall (narthex), then the main living spaces — using ceiling height, material, and light changes at each threshold.",
    "Apply the golden ratio (φ = 1.618) or root-2 rectangle (1:√2) to principal room dimensions, window proportions, and doorway heights to create spaces governed by sacred geometry.",
    "Introduce a cruciform or biaxial plan organization with a central crossing space marked by a double-height ceiling, skylight, or dome that floods the home's heart with natural light.",
    "Mark all primary thresholds with a change in floor material, a step up (minimum 75 mm), and an inscribed or decorated lintel that makes the act of crossing a conscious spatial and spiritual transition.",
    "Design at least one room with clerestory windows (placed at 2.4–3.0 m height) that introduce overhead directional light without compromising wall space or occupant privacy.",
    "Create a Hortus Conclusus (enclosed garden) enclosed with walls or hedging at 1.8–2.4 m height, planted with herbs, roses, and fruit trees in formal beds, centred on a stone fountain or basin.",
    "Provide a dedicated sanctuary room (home chapel) with floor raised one to two steps above the adjacent corridor, and an apse-shaped or flat east-facing wall with a window or niche as the devotional focal point.",
    "Use the cloister principle for any courtyard garden: surround it with a covered arcade of minimum 1.5 m depth on at least three sides using consistent bay proportions.",
    "Include a labyrinth (7-circuit classical pattern, 4–5 m diameter) in the residential garden as a meditative walking feature, visible from at least one principal window of the house.",
    "Proportion all window openings using consistent ratios derived from sacred geometry — Vesica Piscis (1.73:1 height-to-width) for tall chapel windows, golden ratio (1.618:1) for standard rooms.",
    "Designate a Krasny Ugol (icon corner) or devotional focal point in the main living room — a shelf or bracket for sacred images at eye level, with a small oil lamp or candle, occupying a 0.4–0.6 m wall section.",
  ],
};
