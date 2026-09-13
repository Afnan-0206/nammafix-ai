import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Building2, MapPin, Search, Compass, Sun, Moon, Layers,
  Navigation, Eye, X, Check, Droplets, Trees, Train, Car,
  ShieldAlert, ExternalLink, Globe, Sliders, ChevronRight, CornerDownRight
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
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
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
      drain: '780 m',
    },
    coords: '12.9763° N, 77.5929° E',
  },
  {
    id: 'lalbagh',
    name: 'Lalbagh Botanical Garden',
    type: 'Botanical Garden & Lake',
    kannada: 'ಲಾಲ್‌ಬಾಗ್ ಸಸ್ಯತೋಟ',
    topPct: 82,
    leftPct: 72,
    category: 'parks',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
    details: {
      height: 'Glasshouse Heritage',
      floors: 'Area 240 Acres',
      buildingType: 'Botanical Sanctuary',
      address: 'Mavalli, South Bengaluru',
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
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
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
    image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80',
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
  const [selectedLandmark, setSelectedLandmark] = useState(LANDMARKS[0]) // Default UB City as in screenshot
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [isDaylight, setIsDaylight] = useState(true)

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

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

  // Handle City View Preset click
  const selectView = (view) => {
    setActiveView(view.id)
    setZoom(view.zoom)
    setPan({ x: view.panX, y: view.panY })
  }

  // Mouse pan handlers
  const onMouseDown = (e) => {
    if (e.target.closest('button, input, a, .interactive-panel')) return
    isDraggingRef.current = true
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }

  const onMouseUp = () => {
    isDraggingRef.current = false
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
    // Pan to landmark
    setPan({
      x: (50 - landmark.leftPct) * 4,
      y: (50 - landmark.topPct) * 3,
    })
    setZoom(1.3)
  }

  return (
    <div
      className="relative w-full h-[640px] sm:h-[720px] rounded-2xl overflow-hidden select-none border border-slate-700 bg-slate-950 font-sans shadow-2xl"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* ─── 1. Aerial 3D Canvas / Viewport Layer ─── */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing origin-center"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        <img
          src="/bengaluru_digital_twin_view.jpg"
          alt="Bengaluru 3D Photorealistic Digital Twin Base"
          className="w-full h-full object-cover object-center pointer-events-none filter brightness-[0.98] contrast-[1.04]"
        />

        {/* Airport Flight Path Vector Animation */}
        {activeLayers.roads && (
          <div className="absolute top-[12%] left-[53%] flex items-center gap-2 pointer-events-none">
            <span className="text-white text-xs font-bold font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ✈ Kempegowda International Airport
            </span>
          </div>
        )}

        {/* Metro Track Corridors */}
        {activeLayers.metro && (
          <>
            {METRO_NODES.map((stn) => (
              <div
                key={stn.name}
                style={{ top: `${stn.topPct}%`, left: `${stn.leftPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none"
              >
                <div className="h-6 w-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white font-mono text-[10px] font-black shadow-lg">
                  M
                </div>
                <span className="text-[11px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 mt-0.5 shadow-md">
                  {stn.name}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Clickable 3D Hotspot Markers */}
        {LANDMARKS.map((item) => {
          // Visibility based on layer filter
          if (!activeLayers[item.category]) return null

          const isSelected = selectedNodeOrActive(selectedLandmark, item)

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedLandmark(item)
              }}
              style={{ top: `${item.topPct}%`, left: `${item.leftPct}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              {/* Active Selection Glow Ring */}
              {isSelected && (
                <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping pointer-events-none opacity-60" />
              )}

              {/* Pin Badge with Icon & Label */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-white shadow-cyan-500/50 scale-105'
                    : 'bg-slate-900/90 text-white border-slate-600/80 hover:bg-slate-800 hover:border-cyan-400'
                }`}
              >
                {getCategoryIcon(item.category)}
                <span className="whitespace-nowrap font-display text-[11px]">
                  {item.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── 2. Top Navigation Bar ─── */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto gap-3">
        {/* Top-Left: Logo & Title Card */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-lg interactive-panel backdrop-blur-md">
          <div className="h-9 w-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="font-display text-sm sm:text-base font-extrabold text-white tracking-wide leading-none">
              Bengaluru Urban Infrastructure Matrix
            </h1>
            <p className="font-mono text-[10px] text-slate-400 mt-1">
              Real 3D City &bull; Real Infrastructure &bull; Smarter Cities
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

          {/* Autocomplete Dropdown */}
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
            <span className="text-emerald-400 font-bold text-[11px]">3D City Online</span>
          </div>

          {/* Compass Rose */}
          <div
            onClick={() => setPan({ x: 0, y: 0 })}
            className="h-9 w-9 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-rose-500 hover:text-white cursor-pointer shadow-lg transition"
            title="Reset North Heading"
          >
            <Compass size={18} className="animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* ─── 3. Left Control Panel (Layers & City Views) ─── */}
      <div className="absolute top-20 left-4 z-30 w-56 max-h-[calc(100%-110px)] overflow-y-auto bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 space-y-4 interactive-panel thin-scrollbar text-xs">
        {/* Layer Toggles Section */}
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

        {/* City View Presets Section */}
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
          {/* Card Header with Image Thumbnail */}
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

          {/* Details Section */}
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

          {/* Nearby Infrastructure (Relational Matrix) */}
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

          {/* Coordinates & Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Coordinates</span>
              <span className="text-cyan-300 font-bold">{selectedLandmark.coords}</span>
            </div>
            <button
              onClick={() => {
                setPan({
                  x: (50 - selectedLandmark.leftPct) * 4,
                  y: (50 - selectedLandmark.topPct) * 3,
                })
                setZoom(1.4)
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
            >
              View in Map
            </button>
          </div>
        </div>
      )}

      {/* ─── 5. Bottom Dock & Footer Controls ─── */}
      <div className="absolute bottom-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Bottom-Left: Data Sources & Attribution */}
        <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 rounded-xl text-[11px] font-mono text-slate-400 shadow-lg interactive-panel hidden sm:flex items-center gap-2">
          <span className="font-bold text-slate-300">Data Sources:</span>
          <span>Cesium</span>
          <span>&bull;</span>
          <span>OpenStreetMap</span>
          <span>&bull;</span>
          <span>Government of Karnataka</span>
          <a
            href="https://www.bbmp.gov.in/gisviewer/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline ml-1 font-bold"
          >
            View Details
          </a>
        </div>

        {/* Bottom-Center: Live Layer Status Ticker */}
        <div className="bg-slate-900/95 border border-slate-700/80 px-4 py-2 rounded-xl shadow-lg interactive-panel flex items-center gap-3 overflow-x-auto text-[11px] font-mono">
          <StatusBadge icon={<Building2 size={12} className="text-sky-400" />} label="Buildings" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Car size={12} className="text-amber-400" />} label="Roads" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Train size={12} className="text-purple-400" />} label="Metro" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Droplets size={12} className="text-blue-400" />} label="Lakes" status="ONLINE" />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<span className="h-1.5 w-1.5 rounded-full bg-rose-500" />} label="Drains" status="DATA REQUIRED" warning />
          <span className="text-slate-700">|</span>
          <StatusBadge icon={<Trees size={12} className="text-emerald-400" />} label="Parks" status="ONLINE" />
        </div>

        {/* Bottom-Right: Day/Night Mode & Scale Bar */}
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

function selectedNodeOrActive(selected, item) {
  return selected && selected.id === item.id
}
