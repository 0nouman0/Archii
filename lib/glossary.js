// ─── Vastu AI — Glossary of Terms ────────────────────────────────────────────
// 32 Vastu Shastra and architectural terms with definitions, tips, and
// cross-references. Displayed in the in-app Glossary panel.
//
// Categories: 'zones' | 'directions' | 'rooms' | 'rituals' | 'regulatory' | 'concepts'

export const GLOSSARY_TERMS = [
  // ── ZONES (6) ──────────────────────────────────────────────────────────────
  {
    id: "brahmasthan",
    term: "Brahmasthan",
    devanagari: "ब्रह्मस्थान",
    pronunciation: "brah-ma-STHAN",
    category: "zones",
    definition:
      "The Brahmasthan is the energetic centre of a Vastu plot or building — the zone governed by Brahma, the creator. In the 9×9 Vastu Purusha Mandala, it occupies the central pada (grid square) and is considered the source from which all spatial energy radiates outward to the eight directions. Keeping this zone free of heavy columns, walls, toilets, or stairwells is the single most important Vastu rule, as obstruction here is believed to block the free flow of prana throughout the home.",
    tip: "Do: Leave the Brahmasthan as an open courtyard, skylit atrium, or at minimum a clear floor area with no furniture — even a potted plant should not be permanently fixed here.",
    related: ["vastu-purusha", "mandala", "marma-points"],
  },
  {
    id: "agni-zone",
    term: "Agni Zone (SE)",
    devanagari: "अग्नि कोण",
    pronunciation: "AG-ni KOH-na",
    category: "zones",
    definition:
      "The Southeast corner of a plot is governed by Agni (fire) and its presiding deity Agneya. This zone carries intense thermal and transformative energy, making it the prescribed location for kitchens, electrical panels, generators, and any fire-related function in the home. Placing water bodies or bathrooms in this corner is considered highly inauspicious, as water extinguishes fire energy and creates elemental conflict.",
    tip: "Do: Place the kitchen, electrical meter box, or inverter/generator in the SE corner — this is one zone where fire appliances actively strengthen the Vastu balance.",
    related: ["panchabhutas", "jal-zone", "agneya"],
  },
  {
    id: "vayu-zone",
    term: "Vayu Zone (NW)",
    devanagari: "वायु कोण",
    pronunciation: "VAH-yu KOH-na",
    category: "zones",
    definition:
      "The Northwest corner is governed by Vayu (air/wind) and its lord Vayavya. This zone is associated with movement, change, and impermanence, which is why Vastu prescribes it for guest rooms, storage, garages, and utility spaces — functions that have a transient or secondary nature. The NW also governs social relationships and financial transactions, making it a suitable placement for a home office used for business dealings.",
    tip: "Do: Use the NW zone for guest bedrooms, grain/pantry storage, and the washing area — avoid placing the master bedroom here as its restless energy disrupts deep sleep.",
    related: ["panchabhutas", "vayavya", "prithvi-zone"],
  },
  {
    id: "jal-zone",
    term: "Jal Zone (NE)",
    devanagari: "जल कोण",
    pronunciation: "JUL KOH-na",
    category: "zones",
    definition:
      "The Northeast corner is governed by Jal (water) and is the holiest quadrant in Vastu Shastra, presided over by Ishana (Lord Shiva). It is associated with wisdom, spirituality, and clarity of mind. Underground sumps, water bodies, wells, and overhead tank inlet pipes should all connect to this zone. The Puja room and study are ideally placed here to harness the zone's meditative, knowledge-enhancing energy.",
    tip: "Do: Keep the NE corner of both the plot and each room light, low, and open — avoid heavy wardrobes, stone platforms, or tall trees in the NE as they suppress this zone's positive energy.",
    related: ["panchabhutas", "ishanya", "brahmasthan"],
  },
  {
    id: "prithvi-zone",
    term: "Prithvi Zone (SW)",
    devanagari: "पृथ्वी कोण",
    pronunciation: "PRITH-vee KOH-na",
    category: "zones",
    definition:
      "The Southwest corner is governed by Prithvi (earth) and its lord Nairutya (a form of Nirrti). This is the heaviest, most stable zone of a property — Vastu prescribes maximum built mass here: the master bedroom, overhead water tank, strong-room, and the thickest compound wall. A weak or open SW is considered the primary cause of financial instability and health issues for the head of the household.",
    tip: "Don't: Leave the SW corner open or place a window, well, or water body here — it weakens the earth anchor of the home and is one of the most consequential Vastu errors.",
    related: ["panchabhutas", "nairutya", "vastu-purusha"],
  },
  {
    id: "akash-zone",
    term: "Akash Zone (Centre-Top)",
    devanagari: "आकाश तत्व",
    pronunciation: "AH-kash TAT-va",
    category: "zones",
    definition:
      "Akash (ether/space) is the fifth and most subtle of the Panchabhutas, associated not with a cardinal direction but with vertical space — specifically the sky above the Brahmasthan. In traditional Indian homes with central courtyards, the open sky above the Nadumuttam or chowk represents the Akash zone that links the domestic realm with the cosmos. In modern closed buildings, a skylight, dome, or double-height void above the central plan serves the same purpose of introducing Akash energy.",
    tip: "Do: If your plan includes a central atrium or void, ensure it is topped with translucent glass or a skylight — this activates the Akash element and prevents energy stagnation in the building's core.",
    related: ["panchabhutas", "brahmasthan", "nadumuttam"],
  },

  // ── DIRECTIONS (8) ─────────────────────────────────────────────────────────
  {
    id: "uttara",
    term: "Uttara (North)",
    devanagari: "उत्तर",
    pronunciation: "UT-ta-ra",
    category: "directions",
    definition:
      "Uttara (North) is governed by Kubera, the lord of wealth, and by the magnetic north pole which exerts a beneficial pull on the human body and mind when one faces or sleeps toward it. In Vastu, the northern side of a plot should remain open and lower than the south to allow positive magnetic energy and the wealth principle to flow freely into the home. A north-facing house is therefore considered highly auspicious for business owners and those seeking financial prosperity.",
    tip: "Do: Keep the northern boundary wall lower and the northern garden open — never block the north side with tall trees, generators, or septic tanks.",
    related: ["vayavya", "ishanya", "jal-zone"],
  },
  {
    id: "dakshina",
    term: "Dakshina (South)",
    devanagari: "दक्षिण",
    pronunciation: "DAKH-shi-na",
    category: "directions",
    definition:
      "Dakshina (South) is governed by Yama, the lord of death and dharma, and is associated with endings, ancestors, and the element of earth. A south-facing main entrance is generally considered inauspicious in Vastu as it aligns the home's threshold with Yama's direction. However, this is not absolute — south-facing plots can be remedied, and the south side of the home is the prescribed location for the master bedroom, making it the most restful and grounding sleeping zone.",
    tip: "Don't: Place the main entrance exactly at the centre of the south wall — if south-facing is unavoidable, offset the door to the SE quadrant and build a taller compound wall on the south.",
    related: ["nairutya", "agneya", "prithvi-zone"],
  },
  {
    id: "purva",
    term: "Purva (East)",
    devanagari: "पूर्व",
    pronunciation: "POOR-va",
    category: "directions",
    definition:
      "Purva (East) is governed by Indra, king of the gods, and by Surya (the Sun). As the direction of sunrise, the East is considered the most auspicious for a main entrance, as it ensures the first light of day enters the home and activates positive solar energy throughout the interior. East-facing plots receive the gentle morning sun (ideal for living and study rooms) while avoiding the harsh western afternoon radiation.",
    tip: "Do: Position the main entrance door in the East and ensure at least one large east-facing window in the living room — morning sunlight for 2–3 hours purifies the interior atmosphere daily.",
    related: ["ishanya", "agneya", "agni-zone"],
  },
  {
    id: "pashchima",
    term: "Pashchima (West)",
    devanagari: "पश्चिम",
    pronunciation: "PASH-chi-ma",
    category: "directions",
    definition:
      "Pashchima (West) is governed by Varuna, the deity of water and cosmic order. The western side is associated with the setting sun — the completion of daily cycles, social life, and children's creative energy. Children's bedrooms and the dining room are well-placed on the western side. A west-facing plot requires careful management of afternoon solar heat gain; thick walls, trees, or a covered verandah on the western boundary are standard Vastu and passive-cooling remedies.",
    tip: "Do: Plant large shade trees or install a pergola along the west boundary to block afternoon solar gain — this is both sound Vastu practice and effective passive architecture.",
    related: ["vayavya", "nairutya", "vayu-zone"],
  },
  {
    id: "ishanya",
    term: "Ishanya (NE)",
    devanagari: "ईशान्य",
    pronunciation: "ee-SHAHN-ya",
    category: "directions",
    definition:
      "Ishanya is the Northeast direction, presided over by Ishana (Lord Shiva) — the most spiritually charged of the eight directions. It is the confluence of the beneficial North (Kubera/wealth) and East (Surya/health) energies, making it the ideal zone for prayer rooms, meditation spaces, and underground water storage. Vastu texts unanimously prescribe the NE as the corner to keep lightest, lowest, and most open on any plot.",
    tip: "Don't: Build a toilet, kitchen, septic tank, or store heavy items in the NE corner — this is the most consequential Vastu error and is believed to affect the family's spiritual wellbeing and prosperity.",
    related: ["jal-zone", "uttara", "purva"],
  },
  {
    id: "agneya",
    term: "Agneya (SE)",
    devanagari: "आग्नेय",
    pronunciation: "AAG-neya",
    category: "directions",
    definition:
      "Agneya is the Southeast direction, governed by Agni (fire) — the transformative element that digests, purifies, and energises. The kitchen is Vastu-prescribed in the SE because the cook faces East while working, receiving solar and Agneya energy simultaneously. Electrical equipment, the main fuse box, and the inverter are also correctly placed here. A toilet or bedroom in the SE is considered a fire-water elemental conflict causing health and relationship stress.",
    tip: "Do: Place the kitchen, electrical panel, or generator specifically in the SE corner — this one placement alone contributes significantly to overall Vastu score.",
    related: ["agni-zone", "purva", "dakshina"],
  },
  {
    id: "nairutya",
    term: "Nairutya (SW)",
    devanagari: "नैऋत्य",
    pronunciation: "nai-RIT-ya",
    category: "directions",
    definition:
      "Nairutya is the Southwest direction, presided over by Nirrti (a form of Kali) — the deity of dissolution and endings. This makes the SW the most weighty and stable energy zone, requiring maximum physical mass to contain its intense energy. The master bedroom placed in the SW is believed to give the head of the household strength, stability, and authority. An open or poorly-built SW is considered the most common cause of financial loss and power struggles in a home.",
    tip: "Don't: Open a gate, large window, or entrance in the SW corner — Vastu strongly prohibits a SW opening as it releases the stabilising earth energy of the home.",
    related: ["prithvi-zone", "dakshina", "pashchima"],
  },
  {
    id: "vayavya",
    term: "Vayavya (NW)",
    devanagari: "वायव्य",
    pronunciation: "VAH-yav-ya",
    category: "directions",
    definition:
      "Vayavya is the Northwest direction, governed by Vayu (wind). The NW is associated with movement, social connections, and transience, making it suitable for guests, storage, and secondary functions. In climate terms, the northwest receives prevailing breezes in most of the Indian subcontinent, making NW verandahs and windows valuable for cross-ventilation. The NW is also considered the zone governing a family's social standing and relationships with the broader community.",
    tip: "Do: Place the guest bedroom or storage room in the NW — guests will naturally leave on time (impermanence of the Vayu direction), and stored goods will circulate rather than stagnate.",
    related: ["vayu-zone", "uttara", "pashchima"],
  },

  // ── ROOMS / SPACES (6) ─────────────────────────────────────────────────────
  {
    id: "puja-ghar",
    term: "Puja Ghar",
    devanagari: "पूजा घर",
    pronunciation: "POO-jaa GHAR",
    category: "rooms",
    definition:
      "Puja Ghar (prayer room) is the dedicated devotional space within a home — the domestic equivalent of a temple's sanctum sanctorum. Vastu prescribes its placement in the Northeast corner (Ishanya) of the home, where it receives the morning sun's first light directly on the deity's idol. The room should be clean, simple, and free of clutter, with the devotee facing East or North while praying. It should never share a wall with or be directly above a toilet.",
    tip: "Do: Face East or North while praying in the Puja Ghar — the idol should be placed on the west wall so it faces East, not vice versa, ensuring the devotee faces the auspicious East direction.",
    related: ["ishanya", "jal-zone", "garbhagriha"],
  },
  {
    id: "garbhagriha",
    term: "Garbhagriha",
    devanagari: "गर्भगृह",
    pronunciation: "GAR-bha-gri-ha",
    category: "rooms",
    definition:
      "Garbhagriha (literally 'womb chamber') is the innermost sanctum of a Hindu temple — the dark, intimate room that houses the primary deity. In domestic Vastu, this term is sometimes applied to the master bedroom or the most private inner room of the home, emphasising the idea that the deepest interior space carries the most concentrated and protected energy. The concept also informs why the master bedroom in SW is accessed only after passing through public and semi-private zones.",
    tip: "Do: Design the master bedroom as a genuinely private space with no direct visual connection from the main entrance — multiple spatial layers of transition between public entrance and private bedroom enhance both security and Vastu energy.",
    related: ["puja-ghar", "brahmasthan", "nairutya"],
  },
  {
    id: "dwara",
    term: "Dwara",
    devanagari: "द्वार",
    pronunciation: "DWAH-ra",
    category: "rooms",
    definition:
      "Dwara means 'doorway' or 'entrance gate' and in Vastu Shastra refers specifically to the main entrance of a home — the most critically analysed element of any residential plan. The Dwara's direction, width, height, and threshold material are all subject to Vastu rules. An auspicious Dwara should be the largest door in the home, open inward, have a threshold (step/doorstep), and be adorned with Vastu symbols such as Swastika, Om, or Toran (floral garland) to welcome positive energy.",
    tip: "Do: Ensure the main door opens inward and is taller than it is wide — a door that opens outward pushes positive energy out of the home, a key Vastu concern for entrance design.",
    related: ["uttara", "purva", "pada-vinyasa"],
  },
  {
    id: "nadumuttam",
    term: "Nadumuttam",
    devanagari: "നടുമുറ്റം",
    pronunciation: "nah-du-MUT-tam",
    category: "rooms",
    definition:
      "Nadumuttam is the Malayalam term for the central open courtyard of a Kerala Nalukettu house — the sky-open heart of the home around which all four wings are arranged. It serves simultaneously as the Brahmasthan (energetic centre), the primary source of natural light and ventilation, the space for daily rituals including morning prayer and grain-drying, and the social hub for family gatherings. Rainwater collected in the Nadumuttam feeds an internal sump, placing the Jal (water) element at the cosmic centre of the home.",
    tip: "Do: Keep the Nadumuttam free of permanent structures — a Tulasi plant (sacred basil) in a small platform at the centre is the only Vastu-approved fixture in this courtyard space.",
    related: ["brahmasthan", "akash-zone", "jal-zone"],
  },
  {
    id: "varandah",
    term: "Varandah (Verandah)",
    devanagari: "बरामदा",
    pronunciation: "ba-RAAM-da",
    category: "rooms",
    definition:
      "The Varandah (from Portuguese 'varanda') is the covered semi-outdoor transitional space between the public street and the private interior of an Indian home — equivalent to the Thinnai in Tamil, the Jagati in Sanskrit, and the Otla in Marathi. In Vastu terms, the verandah on the North or East side acts as a buffer that filters public energy before it enters the private domestic realm, and provides passive solar shading to the interior. It is one of the most climatically intelligent and Vastu-correct spatial devices in Indian architecture.",
    tip: "Do: Prioritise a verandah on the North or East side of the house even if the plot is small — a 4–5 ft deep covered transition space dramatically improves both thermal comfort and Vastu spatial sequencing.",
    related: ["dwara", "uttara", "purva"],
  },
  {
    id: "brahmasthana-kha",
    term: "Brahmasthana Kha (Central Court)",
    devanagari: "ब्रह्मस्थान खं",
    pronunciation: "BRAH-ma-sthan-a KHA",
    category: "rooms",
    definition:
      "Brahmasthana Kha refers specifically to the open-to-sky expression of the Brahmasthan — the central courtyard that connects the cosmic centre of the home to the sky (Kha = sky/ether/space). While Brahmasthan describes the energy zone, Brahmasthana Kha describes its physical manifestation as an unroofed opening. This concept underpins all courtyard-based Indian house typologies — the Nalukettu, Haveli chowk, Bengali thakurbarir, and Chettinad mansion — where the sky connection at the centre is considered non-negotiable for spiritual and physical wellbeing.",
    tip: "Do: If a full open courtyard is not feasible, introduce a polycarbonate or glass skylight above the central space — even filtered sky connection activates the Kha (space) element at the Brahmasthan.",
    related: ["brahmasthan", "nadumuttam", "akash-zone"],
  },

  // ── CONCEPTS (6) ───────────────────────────────────────────────────────────
  {
    id: "vastu-purusha",
    term: "Vastu Purusha",
    devanagari: "वास्तु पुरुष",
    pronunciation: "VAAS-tu PU-ru-sha",
    category: "concepts",
    definition:
      "The Vastu Purusha is the cosmic being whose body is said to be laid face-down across every plot of land, with his head in the Northeast and feet in the Southwest. Every architectural decision — room placement, door position, pillar location — is evaluated against the body of this cosmic figure: one must not place heavy loads on his head (NE), must not obstruct his navel (Brahmasthan), and must anchor his feet (SW) with the heaviest structure. This personalisation of the plot as a living organism is the philosophical foundation of all Vastu Shastra.",
    tip: "Do: When planning any room layout, visualise the Vastu Purusha's body overlaid on your plot — placing heavy structures in SW (feet), medium in SE/NW (shoulders), and keeping NE (head) open is the simplest rule to remember.",
    related: ["mandala", "brahmasthan", "pada-vinyasa"],
  },
  {
    id: "mandala",
    term: "Mandala (Vastu Grid)",
    devanagari: "मण्डल",
    pronunciation: "MAN-da-la",
    category: "concepts",
    definition:
      "In Vastu Shastra, a Mandala is the sacred geometric grid used to divide a plot into zones of energy — typically an 8×8 (64-pada) grid for residential buildings or a 9×9 (81-pada) grid for temples. The grid maps the Vastu Purusha's body onto the plot and assigns each zone to a specific deity, planet, and function. The entire science of room placement — which room goes where, how doors should align, where columns can stand — is derived from this grid's sacred geometry.",
    tip: "Do: When evaluating a floor plan, mentally overlay a 3×3 grid on the plot (9 equal squares) as a quick Vastu check — NE square = Jal/prayer, SE square = Agni/kitchen, SW square = Prithvi/master bed, centre = Brahmasthan/open.",
    related: ["vastu-purusha", "pada-vinyasa", "brahmasthan"],
  },
  {
    id: "pada-vinyasa",
    term: "Pada Vinyasa",
    devanagari: "पद विन्यास",
    pronunciation: "PA-da vin-YAA-sa",
    category: "concepts",
    definition:
      "Pada Vinyasa is the science of grid-based spatial composition in Vastu — the method by which a plot is divided into equal padas (grid units) and each pada assigned to a presiding deity. The number and size of padas determine the proportion and character of every room, doorway, and structural element. A 32-pada plan (Manduka) suits smaller homes while a 64-pada plan (Paramasaayika) is used for larger residences, ensuring that every architectural decision is grounded in a cosmologically sanctioned proportional system.",
    tip: "Do: When sizing rooms, aim for dimensions that are multiples of the basic pada unit of your plot — this creates a harmonious proportional system throughout the house rather than arbitrary room sizes.",
    related: ["mandala", "vastu-purusha", "marma-points"],
  },
  {
    id: "marma-points",
    term: "Marma Points",
    devanagari: "मर्म बिन्दु",
    pronunciation: "MAR-ma BIN-du",
    category: "concepts",
    definition:
      "Marma Points in Vastu Shastra are the sensitive junctions within the Vastu grid — analogous to acupressure points on the human body — where the energy channels of the Mandala intersect. Placing structural columns, heavy load-bearing walls, or doorways on Marma Points is considered highly inauspicious and is believed to create stress in the corresponding occupants' lives. Vastu texts list 12 primary Marma Points in an 81-pada grid; structural engineers working on traditional Indian buildings were expected to know and avoid these nodes.",
    tip: "Don't: Place a load-bearing column at the exact centre of a room or at any grid intersection that your Vastu consultant identifies as a Marma — even a small offset of 6–12 inches resolves the energetic stress.",
    related: ["pada-vinyasa", "mandala", "brahmasthan"],
  },
  {
    id: "veedhi-shoola",
    term: "Veedhi Shoola",
    devanagari: "वीथि शूल",
    pronunciation: "VEE-thi SHOO-la",
    category: "concepts",
    definition:
      "Veedhi Shoola ('road arrow') refers to any straight road, lane, or path that terminates directly at the main entrance of a building — a T-junction, dead-end street, or railway line pointing at the property. Vastu considers this a significant inauspicious feature as it channels an unbroken column of rushing energy (negative prana, equivalent to the Chinese concept of sha chi) directly into the home. The severity depends on the direction: a road arrow from the SW or South is considered most serious, while one from the North or East is milder and more manageable.",
    tip: "Don't: Position the main entrance gate or front door in direct alignment with the incoming road — offset the gate, plant dense screening vegetation, or erect a Vastu vedhi (screen wall) to deflect the energy flow.",
    related: ["dwara", "uttara", "mandala"],
  },
  {
    id: "panchabhutas",
    term: "Panchabhutas",
    devanagari: "पञ्चभूत",
    pronunciation: "PAN-cha-BHOO-ta",
    category: "concepts",
    definition:
      "Panchabhutas are the five primal elements that, according to Vedic cosmology, constitute all matter and energy in the universe: Prithvi (Earth), Jal (Water), Agni (Fire), Vayu (Air), and Akash (Ether/Space). Vastu Shastra's fundamental goal is to achieve a perfect balance of these five elements within the built environment — each element is associated with a specific direction, zone, material, colour, and building function. An imbalance of any element is believed to manifest as physical, mental, or financial disruption for the occupants.",
    tip: "Do: Use the five-element framework as a design checklist — Earth in SW (stone/heavy materials), Water in NE (underground sump/water feature), Fire in SE (kitchen/electrical), Air in NW (windows/cross-ventilation), Space at centre (open courtyard or skylight).",
    related: ["agni-zone", "jal-zone", "vayu-zone"],
  },

  // ── RITUALS (3) ────────────────────────────────────────────────────────────
  {
    id: "bhoomi-puja",
    term: "Bhoomi Puja",
    devanagari: "भूमि पूजा",
    pronunciation: "BHOO-mi POO-jaa",
    category: "rituals",
    definition:
      "Bhoomi Puja ('earth worship') is the Vedic ground-breaking ceremony performed before any construction begins on a new plot. A priest chants mantras from the Grihya Sutras and Vastu Shastra texts while the owner ritually breaks the earth with a gold or copper instrument at the auspicious NE corner of the plot. Offerings of turmeric, coconut, flowers, and grains are made to Bhoomi Devi (Earth Goddess) and the Vastu Purusha to seek permission and blessings for building on the land. This ceremony neutralises any negative energy in the soil and sanctifies the construction space.",
    tip: "Do: Perform Bhoomi Puja on a shukla paksha (waxing moon) day under an auspicious nakshatra — consult a Jyotish (Vedic astrologer) for the precise muhurta (auspicious timing) aligned with the owner's birth chart.",
    related: ["griha-pravesh", "nakshatra", "vastu-purusha"],
  },
  {
    id: "griha-pravesh",
    term: "Griha Pravesh",
    devanagari: "गृह प्रवेश",
    pronunciation: "GRI-ha PRA-vesh",
    category: "rituals",
    definition:
      "Griha Pravesh ('house entry') is the sacred housewarming ceremony marking the family's first official entry into a newly built or purchased home. Preceded by a Vastu Puja to propitiate the Vastu Purusha and all eight directional deities, the ceremony involves the wife entering first carrying a vessel of milk (symbolising abundance), followed by the husband carrying the sacred fire. The ceremony is always timed to an auspicious muhurta determined by Jyotish, and is typically performed before sunrise or in the early morning hours. Until Griha Pravesh is performed, the home is considered energetically unsettled.",
    tip: "Do: Ensure the Griha Pravesh is performed before a full night is spent in the new home — spending a night in an un-purified home before the ceremony is considered inauspicious in Vastu tradition.",
    related: ["bhoomi-puja", "nakshatra", "dwara"],
  },
  {
    id: "nakshatra",
    term: "Nakshatra (Auspicious Star Timing)",
    devanagari: "नक्षत्र",
    pronunciation: "NAK-sha-tra",
    category: "rituals",
    definition:
      "Nakshatra refers to one of the 27 lunar mansions of Vedic astrology — the specific star cluster in which the Moon is positioned on any given day. In Vastu and Jyotish practice, certain nakshatras are considered auspicious (shubha) for beginning construction, performing Bhoomi Puja, signing property documents, or conducting Griha Pravesh. Rohini, Hasta, Pushya, Anuradha, and Uttara Phalguni are among the most favoured for property-related ceremonies. The Nakshatra of the plot owner's birth (Janma Nakshatra) is also considered to ensure planetary harmony between the owner and the property.",
    tip: "Do: Avoid starting construction under the nakshatras Moola, Aashlesha, Jyeshtha, or Bharani — these are traditionally considered inauspicious for new beginnings and property-related ceremonies.",
    related: ["bhoomi-puja", "griha-pravesh", "vastu-purusha"],
  },

  // ── REGULATORY (3) ─────────────────────────────────────────────────────────
  {
    id: "far-fsi",
    term: "FAR / FSI",
    devanagari: "फ्लोर एरिया रेशो",
    pronunciation: "F-A-R / F-S-I",
    category: "regulatory",
    definition:
      "Floor Area Ratio (FAR) or Floor Space Index (FSI) is the ratio of total built-up area across all floors to the total plot area — the single most important regulatory control on building density in Indian cities. Each municipal authority sets its own FAR limit: BBMP Bengaluru allows 2.5, MCD Delhi allows up to 3.5, while BMC Mumbai restricts to 1.33 in many zones. Exceeding FAR results in an illegal structure that cannot receive an Occupancy Certificate and may face demolition orders.",
    tip: "Don't: Plan the number of floors based only on budget or Vastu — always calculate FAR first (total built-up ÷ plot area) and verify it is within your city's limit before finalising a design.",
    related: ["setback", "built-up-carpet"],
  },
  {
    id: "setback",
    term: "Setback",
    devanagari: "सेटबैक",
    pronunciation: "SET-back",
    category: "regulatory",
    definition:
      "Setbacks are the mandatory open spaces that must be maintained between a building and the plot boundary on all sides — front, rear, and sides — as prescribed by each city's building bylaws. They serve fire-safety, ventilation, natural light, and urban aesthetics purposes. Vastu Shastra naturally aligns with setback requirements in many cases: the open NE corner prescribed by Vastu corresponds exactly to maintaining clear front and side setbacks on the north and east boundaries.",
    tip: "Do: Treat mandatory setbacks as Vastu allies rather than wasted space — the NE setback legally mandated by bylaws doubles as the Vastu-correct open zone; plant a garden or place a water feature there to maximise both regulatory and Vastu benefit.",
    related: ["far-fsi", "built-up-carpet"],
  },
  {
    id: "built-up-carpet",
    term: "Built-up Area vs Carpet Area",
    devanagari: "निर्मित क्षेत्र बनाम कालीन क्षेत्र",
    pronunciation: "NIR-mit KSHE-tra vs KAA-leen KSHE-tra",
    category: "regulatory",
    definition:
      "Built-up Area is the total area covered by walls, including the thickness of external walls, common areas, and balconies — this is the figure used to calculate FAR. Carpet Area is the net usable floor area within the walls of an apartment or room — the area you can actually 'carpet'. In India, RERA (Real Estate Regulation Act) mandates that builders quote apartment prices on carpet area, which is typically 70–80% of built-up area. For standalone houses, the distinction is important for FAR calculation and for comparing the actual liveability of different plot sizes.",
    tip: "Do: When evaluating a house design, request both figures — a plan that quotes 2000 sqft built-up area may offer only 1400–1600 sqft of usable carpet area once walls, staircase, and utility shafts are deducted.",
    related: ["far-fsi", "setback"],
  },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
export const GLOSSARY_CATEGORIES = [
  "zones",
  "directions",
  "rooms",
  "rituals",
  "regulatory",
  "concepts",
];
