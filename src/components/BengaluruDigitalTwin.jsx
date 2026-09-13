import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Building2, MapPin, Search, Compass, Sun, Moon, Layers,
  Navigation, Eye, X, Check, Droplets, Trees, Train, Car,
  ShieldAlert, ExternalLink, Globe, Sliders, ChevronRight, CornerDownRight, Satellite
} from 'lucide-react'

// Authoritative Landmark Nodes positioned across the 3D aerial cityscape
const LANDMARKS = [
  {
    id: 'ub-city',
    name: 'UB City',
    type: 'Commercial Building',
    kannada: 'ಯುಬಿ ಸಿಟಿ',
    topPct: 48,
    leftPct: 53,
    category: 'buildings',
    image: '/landmark_ub_city.jpg',
    details: {
      height: '152 m',
      floors: '32',
      buildingType: 'Commercial',
      address: '24, Vittal Mallya Road, Bengaluru, Karnataka',
      source: 'OpenStreetMap / Cesium',
      lastUpdated: '2024-01-15',
    },
    nearby: {
      road: '120 m',
      metro: 'MG Road (1.2 km)',
      lake: 'Ulsoor Lake (1.2 km)',
      park: 'Cubbon Park (2.3 km)',
      drain: '850 m',
    },
    coords: '12.9716° N, 77.5946° E',
  },
  {
    id: 'vidhana-soudha',
    name: 'Vidhana Soudha',
    type: 'State Legislative Assembly',
    kannada: 'ವಿಧಾನ ಸೌಧ',
    topPct: 40,
    leftPct: 42,
    category: 'buildings',
    image: '/landmark_vidhana_soudha.jpg',
    details: {
      height: '46 m',
      floors: '4',
      buildingType: 'Government Legislature',
      address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru',
      source: 'Government of Karnataka GIS',
      lastUpdated: '2024-02-10',
    },
    nearby: {
      road: '50 m (Ambedkar Veedhi)',
      metro: 'Vidhana Soudha Metro (150 m)',
      lake: 'Ulsoor Lake (2.4 km)',
      park: 'Cubbon Park (300 m)',
      drain: '620 m',
    },
    coords: '12.9797° N, 77.5907° E',
  },
  {
    id: 'bengaluru-palace',
    name: 'Bengaluru Palace',
    type: 'Heritage Royal Palace',
    kannada: 'ಬೆಂಗಳೂರು ಅರಮನೆ',
    topPct: 63,
    leftPct: 48,
    category: 'buildings',
    image: '/landmark_bengaluru_palace.jpg',
    details: {
      height: '24 m',
      floors: '2',
      buildingType: 'Historical Heritage',
      address: 'Vasanth Nagar, Bengaluru, Karnataka',
      source: 'Archaeological Survey / OSM',
      lastUpdated: '2023-11-20',
    },
    nearby: {
      road: '80 m (Palace Road)',
      metro: 'Cantonment Metro (1.8 km)',
      lake: 'Sankey Tank (1.5 km)',
      park: 'Palace Grounds (100 m)',
      drain: '450 m',
    },
    coords: '12.9982° N, 77.5921° E',
  },
  {
    id: 'ulsoor-lake',
    name: 'Ulsoor Lake',
    type: 'Urban Waterbody & Storm Catchment',
    kannada: 'ಹಲಸೂರು ಕೆರೆ',
    topPct: 55,
    leftPct: 69,
    category: 'lakes',
    image: '/landmark_lalbagh.jpg',
    details: {
      height: 'Water Surface',
      floors: 'Depth 4.8 m',
      buildingType: 'Natural Catchment Lake',
      address: 'Ulsoor / Halasuru, East Bengaluru',
      source: 'BBMP Lakes Monitoring System',
      lastUpdated: '2024-03-01',
    },
    nearby: {
      road: '40 m (Kensington Road)',
      metro: 'Halasuru Metro (600 m)',
      lake: '0 m (Primary Basin)',
      park: 'Kensington Park (80 m)',
      drain: 'K-C Valley Rajakaluve Outfall (0 m)',
    },
    coords: '12.9822° N, 77.6219° E',
  },
  {
    id: 'hebbal-lake',
    name: 'Hebbal Lake',
    type: 'North Bengaluru Lake & Wetland',
    kannada: 'ಹೆಬ್ಬಾಳ ಕೆರೆ',
    topPct: 24,
    leftPct: 45,
    category: 'lakes',
    image: '/bbmp_road_inspection.jpg',
    details: {
      height: 'Water Surface',
      floors: 'Depth 5.2 m',
      buildingType: 'Stormwater Wetland',
      address: 'Bellary Road / Outer Ring Road Junction, Hebbal',
      source: 'Karnataka Forest Dept / BBMP',
      lastUpdated: '2024-02-18',
    },
    nearby: {
      road: '25 m (Hebbal Flyover)',
      metro: 'Hebbal Metro (Phase-2B) (200 m)',
      lake: '0 m (Primary Basin)',
      park: 'Hebbal Lake Eco-Park (0 m)',
      drain: 'Hebbal Valley Trunk Drain (0 m)',
    },
    coords: '13.0456° N, 77.5892° E',
  },
  {
    id: 'cubbon-park',
    name: 'Cubbon Park',
    type: 'Urban Botanical Reserve',
    kannada: 'ಕಬ್ಬನ್ ಪಾರ್ಕ್',
    topPct: 43,
    leftPct: 28,
    category: 'parks',
    image: '/landmark_lalbagh.jpg',
    details: {
      height: 'Canopy 28 m',
      floors: 'Area 300 Acres',
      buildingType: 'Public Green Space',
      address: 'Kasturba Road, Central Bengaluru',
      source: 'Horticulture Department, Karnataka',
      lastUpdated: '2024-01-10',
    },
    nearby: {
      road: '0 m (Kasturba Road)',
      metro: 'Cubbon Park Metro (100 m)',
      lake: 'Sankey Tank (2.8 km)',
      park: '0 m',
      drain: '220 m',
    },
    coords: '12.9763° N, 77.5929° E',
  },
  {
    id: 'lalbagh-glasshouse',
    name: 'Lalbagh Botanical Garden',
    type: 'Historical Heritage Glasshouse & Flora Reserve',
    kannada: 'ಲಾಲ್‌ಬಾಗ್ ಗ್ಲಾಸ್‌ಹೌಸ್',
    topPct: 62,
    leftPct: 34,
    category: 'parks',
    image: '/landmark_lalbagh.jpg',
    details: {
      height: 'Glasshouse 18 m',
      floors: '240 Acres',
      buildingType: 'Heritage Botanical Reserve',
      address: 'Mavalli / Basavanagudi, Bengaluru',
      source: 'Horticulture Department / GBA',
      lastUpdated: '2024-02-05',
    },
    nearby: {
      road: '60 m (Lalbagh Fort Road)',
      metro: 'Lalbagh Metro (250 m)',
      lake: 'Lalbagh Lake (0 m)',
      park: '0 m',
      drain: '410 m',
    },
    coords: '12.9507° N, 77.5848° E',
  },
  {
    id: 'railway-station',
    name: 'Bengaluru City Railway Station',
    type: 'KSR Bengaluru Intercity Terminal',
    kannada: 'ಕ್ರಾಂತಿವೀರ ಸಂಗೊಳ್ಳಿ ರಾಯಣ್ಣ ನಿಲ್ದಾಣ',
    topPct: 72,
    leftPct: 26,
    category: 'metro',
    image: '/bbmp_command_center.jpg',
    details: {
      height: '38 m',
      floors: '10 Platforms',
      buildingType: 'Intermodal Transit Hub',
      address: 'Majestic, Sevashrama, Bengaluru',
      source: 'Indian Railways / BMRCL',
      lastUpdated: '2024-01-22',
    },
    nearby: {
      road: '20 m (Gubbi Thotadappa Road)',
      metro: 'Majestic Metro Interchange (100 m)',
      lake: 'Sankey Tank (3.2 km)',
      park: 'Freedom Park (800 m)',
      drain: 'Vrishabhavathi Basin (200 m)',
    },
    coords: '12.9782° N, 77.5695° E',
  },
  {
    id: 'manyata-tech-park',
    name: 'Manyata Tech Park',
    type: 'IT Tech Campus & SEZ',
    kannada: 'ಮಾನ್ಯತಾ ಟೆಕ್ ಪಾರ್ಕ್',
    topPct: 25,
    leftPct: 81,
    category: 'buildings',
    image: '/landmark_ub_city.jpg',
    details: {
      height: '52 m',
      floors: '14',
      buildingType: 'Commercial Tech Park',
      address: 'Outer Ring Road, Nagavara, Bengaluru',
      source: 'Embassy Office Parks / GBA',
      lastUpdated: '2024-02-14',
    },
    nearby: {
      road: '10 m (Outer Ring Road)',
      metro: 'Nagavara Metro (650 m)',
      lake: 'Nagavara Lake (300 m)',
      park: 'Lumbini Gardens (400 m)',
      drain: 'Hebbal Valley Tributary (120 m)',
    },
    coords: '13.0500° N, 77.6210° E',
  },
  {
    id: 'airport',
    name: 'Kempegowda International Airport',
    type: 'International Aviation Hub (BLR)',
    kannada: 'ಕೆಂಪೇಗೌಡ ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಮಾನ ನಿಲ್ದಾಣ',
    topPct: 12,
    leftPct: 57,
    category: 'roads',
    image: '/bengaluru_digital_twin_view.jpg',
    details: {
      height: 'Control Tower 65 m',
      floors: 'Terminals 1 & 2',
      buildingType: 'International Airport',
      address: 'Devanahalli, Bengaluru Rural',
      source: 'BIAL / AAI',
      lastUpdated: '2024-03-05',
    },
    nearby: {
      road: '0 m (Airport Expressway NH-44)',
      metro: 'Airport Metro (Under Construction)',
      lake: 'Bettakote Lake (1.8 km)',
      park: 'Terminal 2 Garden Canopy (0 m)',
      drain: 'Terminal Storm Runoff Network',
    },
    coords: '13.1986° N, 77.7066° E',
  },
]

// Metro Stations & Corridor Nodes
const METRO_NODES = [
  { name: 'Hebbal', topPct: 29, leftPct: 73 },
  { name: 'Yelahanka', topPct: 20, leftPct: 41 },
]

// City Views
const CITY_VIEWS = [
  { id: 'overview', name: 'City Overview', zoom: 1, panX: 0, panY: 0 },
  { id: 'central', name: 'Central Bengaluru', zoom: 1.35, panX: -5, panY: 8 },
  { id: 'north', name: 'North Bengaluru', zoom: 1.4, panX: -2, panY: 28 },
  { id: 'south', name: 'South Bengaluru', zoom: 1.3, panX: -12, panY: -22 },
  { id: 'east', name: 'East Bengaluru', zoom: 1.35, panX: -20, panY: 5 },
  { id: 'west', name: 'West Bengaluru', zoom: 1.3, panX: 20, panY: 8 },
  { id: 'orr', name: 'ORR', zoom: 1.45, panX: -25, panY: 12 },
  { id: 'whitefield', name: 'Whitefield', zoom: 1.5, panX: -32, panY: 8 },
  { id: 'electronic-city', name: 'Electronic City', zoom: 1.4, panX: -18, panY: -30 },
  { id: 'airport-corridor', name: 'Airport Corridor', zoom: 1.5, panX: -6, panY: 38 },
]

export default function BengaluruDigitalTwin() {
  const [selectedLandmark, setSelectedLandmark] = useState(LANDMARKS[0]) // Default UB City
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [isDaylight, setIsDaylight] = useState(true)

  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    buildings: true,
    terrain: true,
    roads: true,
    metro: true,
    lakes: true,
    parks: true,
    adminBoundary: false,
  })

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  // Handle City View Sector click
  const selectView = (view) => {
    setActiveView(view.id)
    // Find representative landmark for sector to populate inspector
    const landmarkMap = {
      central: 'ub-city',
      north: 'hebbal-lake',
      south: 'lalbagh',
      east: 'ulsoor-lake',
      west: 'railway-station',
      orr: 'manyata-tech-park',
      'airport-corridor': 'airport',
    }
    const targetId = landmarkMap[view.id]
    if (targetId) {
      const found = LANDMARKS.find((l) => l.id === targetId)
      if (found) setSelectedLandmark(found)
    }
  }

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return LANDMARKS.filter(
      (l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.kannada.includes(searchQuery)
    )
  }, [searchQuery])

  const handleSelectSearch = (landmark) => {
    setSelectedLandmark(landmark)
    setSearchQuery('')
    setSearchFocused(false)
  }

  return (
    <div className="relative w-full h-[640px] sm:h-[720px] rounded-2xl overflow-hidden select-none border border-slate-700 bg-slate-950 font-sans shadow-2xl">
      {/* ─── 1. Live Google 3D Earth / Maps Feed Layer ─── */}
      <div className="absolute inset-0 w-full h-full bg-slate-950">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d58170.87027506553!2d77.62251494063115!3d12.912340508147711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1789308296796!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Google 3D Maps Bengaluru Live Infrastructure Layer"
          className="w-full h-full filter contrast-[1.05]"
        />
      </div>

      {/* ─── 2. Top Navigation Bar ─── */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto gap-3">
        {/* Top-Left: Logo & Title */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl shadow-lg interactive-panel">
          <div className="h-9 w-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="font-display text-sm sm:text-base font-extrabold text-white tracking-wide leading-none">
              Bengaluru Urban Infrastructure Matrix &bull; Live 3D Twin
            </h1>
            <p className="font-mono text-[10px] text-slate-400 mt-1">
              BBMP &amp; Greater Bengaluru Authority (GBA) Spatial Matrix
            </p>
          </div>
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown */}
        <div className="relative flex-1 max-w-md hidden md:block interactive-panel">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search Bengaluru (e.g. UB City, Vidhana Soudha, Ulsoor Lake)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelectSearch(result)}
                  className="px-3.5 py-2.5 hover:bg-slate-800/90 cursor-pointer flex items-center justify-between border-b border-slate-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(result.category)}
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {result.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {result.type} &bull; {result.kannada}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top-Right: Location Pill, Live Status, Compass */}
        <div className="flex items-center gap-2.5 interactive-panel">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-mono shadow-lg text-slate-300">
            <MapPin size={14} className="text-cyan-400" />
            <span>Bengaluru, Karnataka, India</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-mono shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 font-bold text-[11px]">
              Live 3D Satellite Stream
            </span>
          </div>

          <button
            onClick={() => {
              // Smoothly reload iframe or focus Bengaluru center
              const iframe = document.querySelector('iframe[title="Google 3D Maps Bengaluru Live Infrastructure Layer"]')
              if (iframe) iframe.src = iframe.src
            }}
            className="h-9 w-9 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-rose-500 hover:text-white cursor-pointer shadow-lg transition"
            title="Reset North Heading & Center Map"
          >
            <Compass size={18} />
          </button>
        </div>
      </div>

      {/* ─── 3. Left Control Panel (Layers & City Views) ─── */}
      <div className="absolute top-20 left-4 z-30 w-56 max-h-[calc(100%-110px)] overflow-y-auto bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 space-y-4 interactive-panel thin-scrollbar text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Layers size={13} className="text-cyan-400" /> Layers
          </div>
          <div className="space-y-1.5">
            <LayerCheckbox
              checked={activeLayers.buildings}
              onChange={() => toggleLayer('buildings')}
              label="Buildings"
              icon={<Building2 size={13} className="text-sky-400" />}
            />
            <LayerCheckbox
              checked={activeLayers.terrain}
              onChange={() => toggleLayer('terrain')}
              label="Terrain"
              icon={<span className="text-xs">🏔️</span>}
            />
            <LayerCheckbox
              checked={activeLayers.roads}
              onChange={() => toggleLayer('roads')}
              label="Roads"
              icon={<Car size={13} className="text-amber-400" />}
            />
            <LayerCheckbox
              checked={activeLayers.metro}
              onChange={() => toggleLayer('metro')}
              label="Metro"
              icon={<Train size={13} className="text-purple-400" />}
            />
            <LayerCheckbox
              checked={activeLayers.lakes}
              onChange={() => toggleLayer('lakes')}
              label="Lakes"
              icon={<Droplets size={13} className="text-blue-400" />}
            />
            <LayerCheckbox
              checked={activeLayers.parks}
              onChange={() => toggleLayer('parks')}
              label="Parks"
              icon={<Trees size={13} className="text-emerald-400" />}
            />
            <LayerCheckbox
              checked={activeLayers.adminBoundary}
              onChange={() => toggleLayer('adminBoundary')}
              label="Administrative Boundary"
              icon={<span className="text-xs">🗺️</span>}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Navigation size={13} className="text-cyan-400" /> City View
          </div>
          <div className="space-y-1">
            {CITY_VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => selectView(view)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition ${
                  activeView === view.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <MapPin size={12} className={activeView === view.id ? 'text-cyan-400' : 'text-slate-500'} />
                <span className="truncate">{view.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. Right Inspector Card (Asset Details & Nearby Infrastructure) ─── */}
      {selectedLandmark && (
        <div className="absolute top-20 right-4 z-30 w-80 sm:w-88 max-h-[calc(100%-110px)] overflow-y-auto bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-4 interactive-panel thin-scrollbar text-xs space-y-3.5 animate-pageIn">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedLandmark.image}
                alt={selectedLandmark.name}
                className="h-14 w-14 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div>
                <h3 className="font-display font-black text-sm text-white leading-tight">
                  {selectedLandmark.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedLandmark.type}
                </p>
                <p className="font-kannada text-[10px] text-amber-400 mt-0.5">
                  {selectedLandmark.kannada}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedLandmark(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Details
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Height</span>
                <span className="text-white font-mono font-semibold">{selectedLandmark.details.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Floors</span>
                <span className="text-white font-mono font-semibold">{selectedLandmark.details.floors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Building Type</span>
                <span className="text-white font-medium">{selectedLandmark.details.buildingType}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px]">Address</span>
                <span className="text-slate-200 text-[11px] leading-snug">{selectedLandmark.details.address}</span>
              </div>
              <div className="flex justify-between pt-1 text-[10px] text-slate-500 font-mono">
                <span>Source: {selectedLandmark.details.source}</span>
                <span>{selectedLandmark.details.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Nearby Infrastructure
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Car size={13} className="text-amber-400" /> Nearest Road
                </span>
                <span className="font-mono text-white font-bold">{selectedLandmark.nearby.road}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Train size={13} className="text-purple-400" /> Nearest Metro Station
                </span>
                <span className="font-mono text-white font-bold">{selectedLandmark.nearby.metro}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Droplets size={13} className="text-blue-400" /> Nearest Lake
                </span>
                <span className="font-mono text-white font-bold">{selectedLandmark.nearby.lake}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Trees size={13} className="text-emerald-400" /> Nearest Park
                </span>
                <span className="font-mono text-white font-bold">{selectedLandmark.nearby.park}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-teal-400" /> Nearest Drain
                </span>
                <span className="font-mono text-white font-bold">{selectedLandmark.nearby.drain}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Coordinates</span>
              <span className="text-cyan-300 font-bold">{selectedLandmark.coords}</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLandmark.name + ' Bengaluru')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-1"
            >
              Open in 3D Earth <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* ─── 5. Bottom Dock & Footer Controls ─── */}
      <div className="absolute bottom-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl text-[11px] font-mono text-slate-400 shadow-lg interactive-panel hidden sm:flex items-center gap-2">
          <span className="font-bold text-slate-300">GIS Data:</span>
          <span>Google 3D Satellite</span>
          <span>&bull;</span>
          <span>BBMP GIS Viewer</span>
          <span>&bull;</span>
          <span>Karnataka KSRSAC</span>
          <span>&bull;</span>
          <span>BMRCL Transit</span>
          <a
            href="https://www.bbmp.gov.in/gisviewer/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline ml-1 font-bold"
          >
            View Portal
          </a>
        </div>

        <div className="bg-slate-900/95 border border-slate-700/80 px-4 py-2 rounded-xl shadow-lg interactive-panel flex items-center gap-3 overflow-x-auto text-[11px] font-mono">
          <StatusBadge icon={<Building2 size={12} className="text-sky-400" />} label="Buildings" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Car size={12} className="text-amber-400" />} label="Roads" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Train size={12} className="text-purple-400" />} label="Metro" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Droplets size={12} className="text-blue-400" />} label="Lakes" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Droplets size={12} className="text-teal-400" />} label="Drains" status="MONITORED" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Trees size={12} className="text-emerald-400" />} label="Parks" status="ONLINE" />
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg interactive-panel flex items-center gap-3 text-xs font-mono text-slate-300">
          <button
            onClick={() => setIsDaylight(!isDaylight)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Toggle Daylight / Satellite Mode"
          >
            {isDaylight ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-cyan-300" />}
          </button>
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2 text-[10px] text-slate-400">
            <span>0</span>
            <div className="h-1 w-12 bg-slate-600 rounded-full" />
            <span>1</span>
            <span>2</span>
            <span>5 km</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LayerCheckbox({ checked, onChange, label, icon }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/80 transition">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-slate-300 text-xs font-medium">{label}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
      />
    </label>
  )
}

function StatusBadge({ icon, label, status, warning = false }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {icon}
      <span className="text-slate-300 font-bold">{label}</span>
      <span
        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
          warning ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {status}
      </span>
    </div>
  )
}

function getCategoryIcon(category) {
  switch (category) {
    case 'buildings':
      return <Building2 size={13} className="text-cyan-400" />
    case 'lakes':
      return <Droplets size={13} className="text-blue-400" />
    case 'parks':
      return <Trees size={13} className="text-emerald-400" />
    case 'metro':
      return <Train size={13} className="text-purple-400" />
    default:
      return <MapPin size={13} className="text-amber-400" />
  }
}
