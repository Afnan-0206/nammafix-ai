/**
 * Bengaluru Urban Infrastructure Matrix · Geospatial Digital-Twin Dataset
 * Calibrated to real WGS84 coordinates across Greater Bengaluru Authority (GBA) jurisdiction.
 * Lat: 12.83°N – 13.08°N | Lng: 77.48°E – 77.75°E
 */

export const BENGALURU_BOUNDS = {
  centerLat: 12.9716,
  centerLng: 77.5946,
  scale: 420, // World-space conversion scalar
}

/**
 * Maps WGS84 (lat, lng) to 3D World (x, z) coordinates centered at Vidhana Soudha / MG Road
 */
export function projectGeo(lat, lng) {
  const dLng = (lng - BENGALURU_BOUNDS.centerLng) * Math.cos((BENGALURU_BOUNDS.centerLat * Math.PI) / 180)
  const dLat = lat - BENGALURU_BOUNDS.centerLat
  // In Three.js: X is East/West, Z is North/South (inverted Z for standard screen mapping)
  const x = dLng * BENGALURU_BOUNDS.scale * 111.32
  const z = -dLat * BENGALURU_BOUNDS.scale * 110.57
  return { x, z }
}

/**
 * Haversine formula to calculate real ground distance in Kilometers
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/* ─── Layer 01: Waterbodies & Lakes ─── */
export const LAKES_DATA = [
  {
    id: 'LAKE_BELLANDUR',
    name: 'Bellandur Lake',
    kannada: 'ಬೆಳ್ಳಂದೂರು ಕೆರೆ',
    lat: 12.9352,
    lng: 77.6698,
    areaHa: 361,
    waterVolumeMl: 4200,
    catchmentValley: 'K-C Valley (Koramangala-Challaghatta)',
    siltationIndex: 78,
    floodRiskScore: 84,
    boundary: [
      [12.942, 77.652], [12.946, 77.665], [12.938, 77.682],
      [12.928, 77.678], [12.924, 77.662], [12.932, 77.653]
    ],
  },
  {
    id: 'LAKE_VARTHUR',
    name: 'Varthur Lake',
    kannada: 'ವರ್ತೂರು ಕೆರೆ',
    lat: 12.9412,
    lng: 77.7321,
    areaHa: 180,
    waterVolumeMl: 2100,
    catchmentValley: 'K-C Valley Downstream Basin',
    siltationIndex: 72,
    floodRiskScore: 79,
    boundary: [
      [12.948, 77.721], [12.949, 77.742], [12.935, 77.745],
      [12.932, 77.730], [12.939, 77.718]
    ],
  },
  {
    id: 'LAKE_ULSOOR',
    name: 'Ulsoor Lake',
    kannada: 'ಹಲಸೂರು ಕೆರೆ',
    lat: 12.9822,
    lng: 77.6219,
    areaHa: 50,
    waterVolumeMl: 950,
    catchmentValley: 'Central-East Storm Basin',
    siltationIndex: 26,
    floodRiskScore: 32,
    boundary: [
      [12.987, 77.618], [12.986, 77.628], [12.977, 77.625], [12.978, 77.616]
    ],
  },
  {
    id: 'LAKE_AGARA',
    name: 'Agara Lake',
    kannada: 'ಅಗರ ಕೆರೆ',
    lat: 12.9231,
    lng: 77.6447,
    areaHa: 38,
    waterVolumeMl: 820,
    catchmentValley: 'Koramangala Intermediate Valley',
    siltationIndex: 22,
    floodRiskScore: 48,
    boundary: [
      [12.928, 77.641], [12.927, 77.649], [12.918, 77.648], [12.919, 77.640]
    ],
  },
  {
    id: 'LAKE_SANKEY',
    name: 'Sankey Tank',
    kannada: 'ಸ್ಯಾಂಕಿ ಕೆರೆ',
    lat: 13.0076,
    lng: 77.5739,
    areaHa: 15,
    waterVolumeMl: 340,
    catchmentValley: 'Hebbal West Upper Basin',
    siltationIndex: 14,
    floodRiskScore: 21,
    boundary: [
      [13.011, 77.571], [13.010, 77.577], [13.004, 77.576], [13.005, 77.570]
    ],
  },
  {
    id: 'LAKE_HEBBAL',
    name: 'Hebbal Lake',
    kannada: 'ಹೆಬ್ಬಾಳ ಕೆರೆ',
    lat: 13.0456,
    lng: 77.5892,
    areaHa: 75,
    waterVolumeMl: 1450,
    catchmentValley: 'Hebbal North Valley Trunk',
    siltationIndex: 38,
    floodRiskScore: 42,
    boundary: [
      [13.052, 77.584], [13.050, 77.596], [13.040, 77.593], [13.042, 77.582]
    ],
  },
  {
    id: 'LAKE_MADIVALA',
    name: 'Madivala Lake',
    kannada: 'ಮಡಿವಾಳ ಕೆರೆ',
    lat: 12.9095,
    lng: 77.6186,
    areaHa: 114,
    waterVolumeMl: 1800,
    catchmentValley: 'South Valley Storm Catchment',
    siltationIndex: 44,
    floodRiskScore: 56,
    boundary: [
      [12.916, 77.612], [12.915, 77.625], [12.903, 77.623], [12.905, 77.611]
    ],
  },
]

/* ─── Layer 02: Stormwater Drains (Rajakaluve Network) ─── */
export const DRAINS_DATA = [
  {
    id: 'DRAIN_KC_VALLEY_MAIN',
    name: 'Koramangala-Challaghatta (K-C) Valley Trunk Rajakaluve',
    kannada: 'ಕೆ-ಸಿ ಕಣಿವೆ ರಾಜಕಾಲುವೆ',
    type: 'Primary Arterial SWD (Box Culvert & Natural Drain)',
    widthMeters: 14,
    flowRateM3s: 180,
    siltLevelPct: 68,
    connectingNodes: ['Ulsoor Lake', 'Agara Lake', 'Bellandur Lake', 'Varthur Lake'],
    path: [
      [12.977, 77.625], // Ulsoor Outfall
      [12.955, 77.632], // Domlur / EGL Canal
      [12.938, 77.638], // Ejipura Inner Ring
      [12.924, 77.644], // Agara Inlet
      [12.927, 77.658], // Ibblur Junction
      [12.934, 77.668], // Bellandur West Outfall
      [12.939, 77.702], // Marathahalli-Varthur Channel
      [12.942, 77.732], // Varthur Inflow
    ],
  },
  {
    id: 'DRAIN_HEBBAL_VALLEY',
    name: 'Hebbal Valley Primary Storm Trunk',
    kannada: 'ಹೆಬ್ಬಾಳ ಕಣಿವೆ ರಾಜಕಾಲುವೆ',
    type: 'Primary Open Channel Drain',
    widthMeters: 11,
    flowRateM3s: 120,
    siltLevelPct: 42,
    connectingNodes: ['Sankey Tank', 'Hebbal Lake', 'Nagavara Lake'],
    path: [
      [13.004, 77.575], // Sankey
      [13.022, 77.581], // Ganganagar
      [13.042, 77.586], // Hebbal South Inlet
      [13.050, 77.608], // Nagavara Link
    ],
  },
  {
    id: 'DRAIN_VRISHABHAVATHI',
    name: 'Vrishabhavathi Valley Trunk Drain',
    kannada: 'ವೃಷಭಾವತಿ ಕಣಿವೆ ಚಾನಲ್',
    type: 'Primary Stormwater Basin Channel',
    widthMeters: 16,
    flowRateM3s: 210,
    siltLevelPct: 54,
    connectingNodes: ['Majestic Catchment', 'Nayandahalli Lake', 'Mysore Road Basin'],
    path: [
      [12.975, 77.570], // Majestic Basin
      [12.958, 77.552], // RPC Layout
      [12.945, 77.534], // Nayandahalli
      [12.928, 77.512], // Kengeri Valley
    ],
  },
]

/* ─── Layer 03: Namma Metro Corridors & Stations ─── */
export const METRO_LINES = [
  {
    id: 'METRO_PURPLE',
    name: 'Purple Line (Challaghatta ↔ Whitefield)',
    kannada: 'ನೇರಳೆ ಮಾರ್ಗ (ಚಲ್ಲಘಟ್ಟ ↔ ವೈಟ್‌ಫೀಲ್ಡ್)',
    color: '#9333ea', // Royal Purple
    lengthKm: 43.49,
    activeRidershipDaily: 480000,
    stations: [
      { name: 'Challaghatta', lat: 12.9095, lng: 77.4764 },
      { name: 'Kengeri', lat: 12.9152, lng: 77.4883 },
      { name: 'Mysore Road', lat: 12.9468, lng: 77.5303 },
      { name: 'Magadi Road', lat: 12.9754, lng: 77.5542 },
      { name: 'Nadaprabhu Kempegowda Majestic (Interchange)', lat: 12.9772, lng: 77.5713 },
      { name: 'Vidhana Soudha', lat: 12.9797, lng: 77.5907 },
      { name: 'MG Road (Interchange)', lat: 12.9756, lng: 77.6066 },
      { name: 'Indiranagar', lat: 12.9783, lng: 77.6385 },
      { name: 'Baiyappanahalli', lat: 12.9912, lng: 77.6524 },
      { name: 'KR Puram (Interchange)', lat: 12.9982, lng: 77.6883 },
      { name: 'Garudacharpalya', lat: 12.9934, lng: 77.7082 },
      { name: 'Hoodi', lat: 12.9911, lng: 77.7178 },
      { name: 'Whitefield (Kadugodi)', lat: 12.9863, lng: 77.7554 },
    ],
  },
  {
    id: 'METRO_GREEN',
    name: 'Green Line (Nagasandra ↔ Silk Institute)',
    kannada: 'ಹಸಿರು ಮಾರ್ಗ (ನಾಗಸಂದ್ರ ↔ ಸಿಲ್ಕ್ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್)',
    color: '#16a34a', // Emerald Green
    lengthKm: 33.46,
    activeRidershipDaily: 390000,
    stations: [
      { name: 'Nagasandra', lat: 13.0482, lng: 77.5005 },
      { name: 'Yeshwanthpur', lat: 13.0232, lng: 77.5498 },
      { name: 'Rajajinagar', lat: 12.9984, lng: 77.5552 },
      { name: 'Nadaprabhu Kempegowda Majestic (Interchange)', lat: 12.9772, lng: 77.5713 },
      { name: 'Chickpete', lat: 12.9682, lng: 77.5742 },
      { name: 'KR Market', lat: 12.9612, lng: 77.5748 },
      { name: 'Lalbagh', lat: 12.9462, lng: 77.5802 },
      { name: 'South End Circle', lat: 12.9372, lng: 77.5806 },
      { name: 'Jayanagar', lat: 12.9298, lng: 77.5802 },
      { name: 'Banashankari', lat: 12.9152, lng: 77.5736 },
      { name: 'Silk Institute', lat: 12.8624, lng: 77.5312 },
    ],
  },
  {
    id: 'METRO_BLUE',
    name: 'Blue Line · ORR & Airport Corridor (Under Ph-2B Construction)',
    kannada: 'ನೀಲಿ ಮಾರ್ಗ (ರಿಂಗ್ ರೋಡ್ & ವಿಮಾನ ನಿಲ್ದಾಣ)',
    color: '#0284c7', // Sky Blue
    lengthKm: 58.19,
    activeRidershipDaily: 0,
    stations: [
      { name: 'Central Silk Board', lat: 12.9174, lng: 77.6234 },
      { name: 'HSR Layout', lat: 12.9198, lng: 77.6392 },
      { name: 'Bellandur (Ecospace)', lat: 12.9282, lng: 77.6821 },
      { name: 'Marathahalli', lat: 12.9562, lng: 77.7011 },
      { name: 'KR Puram', lat: 12.9982, lng: 77.6883 },
      { name: 'Kasturinagar', lat: 13.0072, lng: 77.6621 },
      { name: 'Hebbal', lat: 13.0456, lng: 77.5921 },
      { name: 'Yelahanka', lat: 13.1008, lng: 77.5962 },
      { name: 'Kempegowda International Airport (KIAL)', lat: 13.1986, lng: 77.7066 },
    ],
  },
]

/* ─── Layer 04: Major Arterial Roads & Expressways ─── */
export const ARTERIAL_ROADS = [
  {
    id: 'RD_ORR_EAST',
    name: 'Outer Ring Road (Silk Board ↔ Hebbal Corridor)',
    kannada: 'ಹೊರ ವರ್ತುಲ ರಸ್ತೆ (ಸಿಲ್ಕ್ ಬೋರ್ಡ್ - ಹೆಬ್ಬಾಳ)',
    classification: 'Major Tech Arterial Expressway',
    lanes: 8,
    lengthKm: 28.5,
    trafficIndex: 86, // 0-100
    floodRiskScore: 78,
    surfaceQuality: 'Fair (Monsoon Bitumen Wear)',
    division: 'BBMP Major Roads & Infrastructure',
    path: [
      [12.9174, 77.6234], // Silk Board
      [12.9231, 77.6447], // Agara
      [12.9282, 77.6821], // Bellandur Ecospace
      [12.9462, 77.6982], // Kadubeesanahalli
      [12.9562, 77.7011], // Marathahalli Bridge
      [12.9982, 77.6883], // KR Puram Hanging Bridge
      [13.0182, 77.6521], // Banaswadi
      [13.0456, 77.5921], // Hebbal Flyover
    ],
  },
  {
    id: 'RD_HOSUR_ELEVATED',
    name: 'Hosur Road & Electronic City Elevated Expressway',
    kannada: 'ಹೊಸೂರು ರಸ್ತೆ ಎಲಿವೇಟೆಡ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ',
    classification: 'National Highway NH-44',
    lanes: 6,
    lengthKm: 18.2,
    trafficIndex: 72,
    floodRiskScore: 35,
    surfaceQuality: 'Good (Asphalt Overlaid)',
    division: 'NHAI / BBMP South Wing',
    path: [
      [12.9342, 77.6182], // Madiwala
      [12.9174, 77.6234], // Silk Board
      [12.8982, 77.6382], // Bommanahalli
      [12.8762, 77.6512], // Kudlu Gate
      [12.8452, 77.6602], // Electronic City Phase 1
    ],
  },
  {
    id: 'RD_OLD_AIRPORT',
    name: 'Old Airport Road (Trinity ↔ Varthur)',
    kannada: 'ಹಳೆ ವಿಮಾನ ನಿಲ್ದಾಣ ರಸ್ತೆ',
    classification: 'Arterial Mobility Corridor',
    lanes: 4,
    lengthKm: 14.8,
    trafficIndex: 82,
    floodRiskScore: 64,
    surfaceQuality: 'Pothole Patching Underway',
    division: 'BBMP East Engineering Wing',
    path: [
      [12.9712, 77.6182], // Trinity
      [12.9612, 77.6421], // Domlur
      [12.9582, 77.6621], // HAL Airport
      [12.9562, 77.7011], // Marathahalli
      [12.9412, 77.7321], // Varthur
    ],
  },
  {
    id: 'RD_MG_CUBBON',
    name: 'Mahatma Gandhi (MG) Road & Vidhana Soudha Axis',
    kannada: 'ಎಂ.ಜಿ. ರಸ್ತೆ & ವಿಧಾನ ಸೌಧ ಮಾರ್ಗ',
    classification: 'Central Heritage Corridor',
    lanes: 4,
    lengthKm: 4.6,
    trafficIndex: 68,
    floodRiskScore: 18,
    surfaceQuality: 'Excellent (Tender SURE Grade)',
    division: 'BBMP Central Corporation',
    path: [
      [12.9772, 77.5713], // Majestic
      [12.9797, 77.5907], // Vidhana Soudha
      [12.9756, 77.6066], // MG Road Metro
      [12.9712, 77.6182], // Trinity Circle
    ],
  },
  {
    id: 'RD_BELLARY_AIRPORT',
    name: 'Bellary Road (NH-44 Airport Corridor)',
    kannada: 'ಬಳ್ಳಾರಿ ರಸ್ತೆ (ವಿಮಾನ ನಿಲ್ದಾಣ ಹೆದ್ದಾರಿ)',
    classification: 'National Expressway Corridor',
    lanes: 8,
    lengthKm: 26.0,
    trafficIndex: 58,
    floodRiskScore: 28,
    surfaceQuality: 'Good',
    division: 'NHAI / BBMP North Division',
    path: [
      [12.9862, 77.5902], // Windsor Manor
      [13.0182, 77.5882], // Mekhri Circle
      [13.0456, 77.5921], // Hebbal Flyover
      [13.1008, 77.5962], // Yelahanka Bypass
    ],
  },
]

/* ─── Layer 05: 3D Landmark Civic & Commercial Fabric ─── */
export const LANDMARK_BUILDINGS = [
  {
    id: 'BLDG_VIDHANA_SOUDHA',
    name: 'Vidhana Soudha (Karnataka State Legislature)',
    kannada: 'ವಿಧಾನ ಸೌಧ',
    type: 'State Legislative Seat',
    lat: 12.9797,
    lng: 77.5907,
    height: 46,
    footprintWidth: 14,
    footprintDepth: 14,
    color: 0x0a2540, // Gov Navy
    accentColor: 0xd97706, // Amber Dome
    hasDome: true,
    riskScore: 8,
    ward: 'Ward 111 (Shanthinagar/Sampangiramanagar)',
    corporation: 'Central Bengaluru Corporation',
  },
  {
    id: 'BLDG_HIGH_COURT',
    name: 'High Court of Karnataka (Attara Kacheri)',
    kannada: 'ಕರ್ನಾಟಕ ಉಚ್ಚ ನ್ಯಾಯಾಲಯ',
    type: 'State Judiciary Seat',
    lat: 12.9785,
    lng: 77.5925,
    height: 28,
    footprintWidth: 12,
    footprintDepth: 8,
    color: 0xdc2626, // Crimson Heritage Brick
    hasDome: false,
    riskScore: 12,
    ward: 'Ward 111 (Shanthinagar)',
    corporation: 'Central Bengaluru Corporation',
  },
  {
    id: 'BLDG_BBMP_HQ',
    name: 'BBMP Municipal Headquarters (NR Square)',
    kannada: 'ಬಿಬಿಎಂಪಿ ಕೇಂದ್ರ ಕಚೇರಿ (ಹಡ್ಸನ್ ಸರ್ಕಲ್)',
    type: 'Municipal Command Center',
    lat: 12.9678,
    lng: 77.5878,
    height: 36,
    footprintWidth: 10,
    footprintDepth: 10,
    color: 0x1e3a8a,
    riskScore: 18,
    ward: 'Ward 119 (Dharmaraya Swamy Temple)',
    corporation: 'Central Bengaluru Corporation',
  },
  {
    id: 'BLDG_UB_CITY',
    name: 'UB City Towers',
    kannada: 'ಯುಬಿ ಸಿಟಿ ಗೋಪುರ',
    type: 'Commercial High-Rise',
    lat: 12.9719,
    lng: 77.5958,
    height: 128,
    footprintWidth: 9,
    footprintDepth: 9,
    color: 0x334155,
    riskScore: 24,
    ward: 'Ward 111 (Shanthinagar)',
    corporation: 'Central Bengaluru Corporation',
  },
  {
    id: 'BLDG_MAJESTIC_HUB',
    name: 'Kempegowda Majestic Intermodal Transit Hub',
    kannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಸಾರಿಗೆ ಕೇಂದ್ರ',
    type: 'Multi-Modal Transit Terminal',
    lat: 12.9772,
    lng: 77.5713,
    height: 38,
    footprintWidth: 16,
    footprintDepth: 12,
    color: 0x475569,
    riskScore: 48,
    ward: 'Ward 96 (Gandhinagar)',
    corporation: 'Central Bengaluru Corporation',
  },
  {
    id: 'BLDG_WTC_BLR',
    name: 'World Trade Center Bangalore (Brigade Gateway)',
    kannada: 'ವರ್ಲ್ಡ್ ಟ್ರೇಡ್ ಸೆಂಟರ್',
    type: 'Commercial Tech Hub',
    lat: 13.0125,
    lng: 77.5552,
    height: 128,
    footprintWidth: 10,
    footprintDepth: 10,
    color: 0x0284c7,
    riskScore: 22,
    ward: 'Ward 98 (Prakashnagar / Rajajinagar)',
    corporation: 'West Corporation',
  },
  {
    id: 'BLDG_ITPB',
    name: 'International Tech Park Bangalore (ITPB Whitefield)',
    kannada: 'ಐಟಿಪಿಬಿ ವೈಟ್‌ಫೀಲ್ಡ್',
    type: 'IT Tech Park Hub',
    lat: 12.9863,
    lng: 77.7289,
    height: 64,
    footprintWidth: 14,
    footprintDepth: 14,
    color: 0x0f766e,
    riskScore: 54,
    ward: 'Ward 84 (Hagadur / Whitefield)',
    corporation: 'East Corporation',
  },
  {
    id: 'BLDG_MANYATA',
    name: 'Manyata Embassy Business Park',
    kannada: 'ಮಾನ್ಯತಾ ಟೆಕ್ ಪಾರ್ಕ್',
    type: 'Special Economic Zone',
    lat: 13.0500,
    lng: 77.6210,
    height: 52,
    footprintWidth: 15,
    footprintDepth: 12,
    color: 0x1d4ed8,
    riskScore: 62,
    ward: 'Ward 6 (Thanisandra / Byatarayanapura)',
    corporation: 'North Corporation',
  },
  {
    id: 'BLDG_ECOSPACE',
    name: 'Bellandur Ecospace Tech Cluster',
    kannada: 'ಬೆಳ್ಳಂದೂರು ಇಕೋಸ್ಪೇಸ್',
    type: 'ORR Commercial Cluster',
    lat: 12.9282,
    lng: 77.6821,
    height: 58,
    footprintWidth: 14,
    footprintDepth: 14,
    color: 0x1e293b,
    riskScore: 82, // High flood vulnerability zone near Bellandur lake
    ward: 'Ward 150 (Bellandur)',
    corporation: 'East Corporation',
  },
]

/* ─── Layer 06: Greater Bengaluru Authority (GBA) 5 City Corporations ─── */
export const GBA_CORPORATIONS = [
  {
    id: 'GBA_CENTRAL',
    name: 'Central Bengaluru Corporation',
    kannada: 'ಕೇಂದ್ರ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
    headquarters: 'Hudson Circle, NR Square',
    commissioner: 'Sri. Tushar Girinath, IAS',
    wardsCount: 42,
    populationMillions: 2.8,
    coverageAreaKm2: 124,
    activeIncidents: 38,
    color: '#1D4ED8',
  },
  {
    id: 'GBA_EAST',
    name: 'East Bengaluru Corporation',
    kannada: 'ಪೂರ್ವ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
    headquarters: 'Mahadevapura Zonal Office, Hoodi',
    commissioner: 'Sri. K. Ramesh, KAS',
    wardsCount: 48,
    populationMillions: 3.4,
    coverageAreaKm2: 245,
    activeIncidents: 64, // Tech corridor, high drainage focus
    color: '#D97706',
  },
  {
    id: 'GBA_WEST',
    name: 'West Bengaluru Corporation',
    kannada: 'ಪಶ್ಚಿಮ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
    headquarters: 'Rajajinagar 1st Block',
    commissioner: 'Smt. Priya Mohan, KAS',
    wardsCount: 38,
    populationMillions: 2.6,
    coverageAreaKm2: 118,
    activeIncidents: 29,
    color: '#047857',
  },
  {
    id: 'GBA_NORTH',
    name: 'North Bengaluru Corporation',
    kannada: 'ಉತ್ತರ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
    headquarters: 'Yelahanka Satellite Town',
    commissioner: 'Sri. V. Anand, KAS',
    wardsCount: 36,
    populationMillions: 2.2,
    coverageAreaKm2: 186,
    activeIncidents: 31,
    color: '#7C3AED',
  },
  {
    id: 'GBA_SOUTH',
    name: 'South Bengaluru Corporation',
    kannada: 'ದಕ್ಷಿಣ ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ',
    headquarters: 'Jayanagar 4th Block Complex',
    commissioner: 'Sri. S. Manjunath, KAS',
    wardsCount: 44,
    populationMillions: 3.1,
    coverageAreaKm2: 168,
    activeIncidents: 34,
    color: '#0F766E',
  },
]

/* ─── Relational Spatial Intelligence Engine ─── */
/**
 * For any given GPS coordinate (lat, lng), calculates the nearest spatial infrastructure node relationships
 */
export function analyzeSpatialRelationships(lat, lng) {
  // 1. Nearest Stormwater Drain
  let minDrainDist = Infinity
  let nearestDrain = null
  DRAINS_DATA.forEach((drain) => {
    drain.path.forEach(([dLat, dLng]) => {
      const dist = haversineKm(lat, lng, dLat, dLng)
      if (dist < minDrainDist) {
        minDrainDist = dist
        nearestDrain = drain
      }
    })
  })

  // 2. Nearest Lake
  let minLakeDist = Infinity
  let nearestLake = null
  LAKES_DATA.forEach((lake) => {
    const dist = haversineKm(lat, lng, lake.lat, lake.lng)
    if (dist < minLakeDist) {
      minLakeDist = dist
      nearestLake = lake
    }
  })

  // 3. Nearest Metro Station
  let minMetroDist = Infinity
  let nearestMetroStation = null
  let nearestMetroLine = null
  METRO_LINES.forEach((line) => {
    line.stations.forEach((stn) => {
      const dist = haversineKm(lat, lng, stn.lat, stn.lng)
      if (dist < minMetroDist) {
        minMetroDist = dist
        nearestMetroStation = stn
        nearestMetroLine = line
      }
    })
  })

  // 4. Nearest Arterial Road
  let minRoadDist = Infinity
  let nearestRoad = null
  ARTERIAL_ROADS.forEach((road) => {
    road.path.forEach(([rLat, rLng]) => {
      const dist = haversineKm(lat, lng, rLat, rLng)
      if (dist < minRoadDist) {
        minRoadDist = dist
        nearestRoad = road
      }
    })
  })

  // 5. Dynamic Flood Vulnerability Score (0-100)
  // High if close to low-lying lake/drain and drain siltation is high
  let floodScore = 20
  if (minLakeDist < 1.5) floodScore += 35
  else if (minLakeDist < 3.0) floodScore += 20

  if (minDrainDist < 0.5) {
    floodScore += nearestDrain ? nearestDrain.siltLevelPct * 0.45 : 20
  }

  // Cap at 98
  floodScore = Math.min(98, Math.round(floodScore))

  return {
    nearestDrain: {
      name: nearestDrain ? nearestDrain.name : 'Local Stormwater Culvert',
      distanceMeters: Math.round(minDrainDist * 1000),
      siltLevel: nearestDrain ? `${nearestDrain.siltLevelPct}%` : 'Unknown',
    },
    nearestLake: {
      name: nearestLake ? nearestLake.name : 'Local Waterbody',
      distanceMeters: Math.round(minLakeDist * 1000),
      areaHa: nearestLake ? `${nearestLake.areaHa} Ha` : 'N/A',
      floodRisk: nearestLake ? nearestLake.floodRiskScore : 50,
    },
    nearestMetro: {
      station: nearestMetroStation ? nearestMetroStation.name : 'N/A',
      line: nearestMetroLine ? nearestMetroLine.name : 'N/A',
      distanceMeters: Math.round(minMetroDist * 1000),
    },
    nearestRoad: {
      name: nearestRoad ? nearestRoad.name : 'Local Connecting Ward Street',
      distanceMeters: Math.round(minRoadDist * 1000),
      trafficIndex: nearestRoad ? nearestRoad.trafficIndex : 50,
      classification: nearestRoad ? nearestRoad.classification : 'Ward Road',
    },
    computedFloodRisk: floodScore,
  }
}
