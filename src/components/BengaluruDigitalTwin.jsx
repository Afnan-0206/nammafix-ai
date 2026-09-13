import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Layers, MapPin, Navigation, ShieldCheck, AlertTriangle, Droplets, Train,
  Car, Building2, Sliders, Eye, RotateCcw, CloudRain, Info, X, Compass, CheckCircle2, ChevronRight
} from 'lucide-react'
import {
  projectGeo, LAKES_DATA, DRAINS_DATA, METRO_LINES, ARTERIAL_ROADS,
  LANDMARK_BUILDINGS, GBA_CORPORATIONS, analyzeSpatialRelationships, haversineKm
} from '../data/bengaluruGeoTwin'

export default function BengaluruDigitalTwin({ issues = [], onSelectIssue }) {
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [spatialAnalysis, setSpatialAnalysis] = useState(null)

  // Layer Toggles
  const [layers, setLayers] = useState({
    buildings: true,
    roads: true,
    metro: true,
    lakes: true,
    drains: true,
    incidents: true,
    floodSimulation: false,
  })

  // Monsoon Rainfall Slider (0 - 120 mm/hr)
  const [rainfallMm, setRainfallMm] = useState(25)
  const [cameraPreset, setCameraPreset] = useState('overview')

  // Refs for WebGL scene objects
  const sceneStateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    targetCamPos: new THREE.Vector3(0, 65, 85),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    interactiveObjects: [],
    trainMeshes: [],
    lakeMeshes: [],
    floodOverlayMesh: null,
    drainLines: [],
    layerGroups: {
      buildings: new THREE.Group(),
      roads: new THREE.Group(),
      metro: new THREE.Group(),
      lakes: new THREE.Group(),
      drains: new THREE.Group(),
      incidents: new THREE.Group(),
    },
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 560

    // 1. Scene & Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9) // Crisp daylight sky
    sceneStateRef.current.scene = scene

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 1200)
    camera.position.set(0, 65, 85)
    camera.lookAt(0, 0, 0)
    sceneStateRef.current.camera = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    sceneStateRef.current.renderer = renderer

    // 2. Daytime Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3)
    sunLight.position.set(50, 90, 45)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    sunLight.shadow.camera.near = 10
    sunLight.shadow.camera.far = 220
    sunLight.shadow.camera.left = -65
    sunLight.shadow.camera.right = 65
    sunLight.shadow.camera.top = 65
    sunLight.shadow.camera.bottom = -65
    sunLight.shadow.bias = -0.0004
    scene.add(sunLight)

    // 3. Terrain Base Plane (Bengaluru Deccan Plateau at ~920m Elevation)
    const terrainGeo = new THREE.PlaneGeometry(120, 120, 32, 32)
    const terrainMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    terrain.rotation.x = -Math.PI / 2
    terrain.receiveShadow = true
    scene.add(terrain)

    // Add Layer Groups
    const { buildings, roads, metro, lakes, drains, incidents } = sceneStateRef.current.layerGroups
    scene.add(buildings)
    scene.add(roads)
    scene.add(metro)
    scene.add(lakes)
    scene.add(drains)
    scene.add(incidents)

    const interactives = []

    // ─── BUILD LAYER: Lakes & Waterbodies ───
    LAKES_DATA.forEach((lake) => {
      const lakeGroup = new THREE.Group()
      const pts = lake.boundary.map(([lat, lng]) => {
        const { x, z } = projectGeo(lat, lng)
        return new THREE.Vector2(x, -z)
      })
      const shape = new THREE.Shape(pts)
      const lakeGeo = new THREE.ShapeGeometry(shape)
      const lakeMat = new THREE.MeshLambertMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
      })
      const lakeMesh = new THREE.Mesh(lakeGeo, lakeMat)
      lakeMesh.rotation.x = Math.PI / 2
      lakeMesh.position.y = 0.05
      lakeMesh.receiveShadow = true
      lakeGroup.add(lakeMesh)

      // Center Marker for Raycasting
      const center = projectGeo(lake.lat, lake.lng)
      const markerGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16)
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8 })
      const marker = new THREE.Mesh(markerGeo, markerMat)
      marker.position.set(center.x, 0.1, center.z)
      marker.userData = { type: 'lake', data: lake }
      lakeGroup.add(marker)
      interactives.push(marker)

      lakes.add(lakeGroup)
      sceneStateRef.current.lakeMeshes.push({ mesh: lakeMesh, baseScale: 1.0, lake })
    })

    // ─── BUILD LAYER: Rajakaluve Stormwater Drains ───
    DRAINS_DATA.forEach((drain) => {
      const points = drain.path.map(([lat, lng]) => {
        const { x, z } = projectGeo(lat, lng)
        return new THREE.Vector3(x, 0.08, z)
      })
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.35, 8, false)
      const tubeMat = new THREE.MeshLambertMaterial({ color: 0x0f766e })
      const tube = new THREE.Mesh(tubeGeo, tubeMat)
      tube.userData = { type: 'drain', data: drain }
      drains.add(tube)
      interactives.push(tube)
      sceneStateRef.current.drainLines.push(tube)
    })

    // ─── BUILD LAYER: Arterial Roads & Traffic ───
    ARTERIAL_ROADS.forEach((road) => {
      const points = road.path.map(([lat, lng]) => {
        const { x, z } = projectGeo(lat, lng)
        return new THREE.Vector3(x, 0.06, z)
      })
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.5, 8, false)

      // Color code by traffic congestion index (Green -> Amber -> Red)
      const trafficColor =
        road.trafficIndex >= 80 ? 0xdc2626 : road.trafficIndex >= 65 ? 0xd97706 : 0x16a34a
      const roadMat = new THREE.MeshLambertMaterial({ color: trafficColor })
      const roadMesh = new THREE.Mesh(tubeGeo, roadMat)
      roadMesh.userData = { type: 'road', data: road }
      roads.add(roadMesh)
      interactives.push(roadMesh)
    })

    // ─── BUILD LAYER: Namma Metro Lines & Stations ───
    METRO_LINES.forEach((line) => {
      const points = line.stations.map((stn) => {
        const { x, z } = projectGeo(stn.lat, stn.lng)
        return new THREE.Vector3(x, 0.8, z) // Elevated track viaduct
      })
      const curve = new THREE.CatmullRomCurve3(points)
      const trackGeo = new THREE.TubeGeometry(curve, 64, 0.22, 8, false)
      const trackMat = new THREE.MeshLambertMaterial({ color: parseInt(line.color.replace('#', '0x')) })
      const trackMesh = new THREE.Mesh(trackGeo, trackMat)
      trackMesh.userData = { type: 'metroLine', data: line }
      metro.add(trackMesh)
      interactives.push(trackMesh)

      // Stations Pods
      line.stations.forEach((stn) => {
        const { x, z } = projectGeo(stn.lat, stn.lng)
        const stnGeo = new THREE.BoxGeometry(1.2, 0.6, 1.2)
        const stnMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
        const stnMesh = new THREE.Mesh(stnGeo, stnMat)
        stnMesh.position.set(x, 0.8, z)
        stnMesh.castShadow = true
        stnMesh.userData = { type: 'metroStation', data: { ...stn, lineName: line.name } }
        metro.add(stnMesh)
        interactives.push(stnMesh)
      })

      // Animated Metro Train
      const trainGeo = new THREE.BoxGeometry(1.8, 0.4, 0.6)
      const trainMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const train = new THREE.Mesh(trainGeo, trainMat)
      metro.add(train)
      sceneStateRef.current.trainMeshes.push({ mesh: train, curve, progress: Math.random() })
    })

    // ─── BUILD LAYER: 3D Landmark Civic Buildings ───
    LANDMARK_BUILDINGS.forEach((bldg) => {
      const { x, z } = projectGeo(bldg.lat, bldg.lng)
      const bldgGroup = new THREE.Group()

      // Height scaled for isometric visualization
      const scaledH = Math.max(3, bldg.height * 0.16)
      const bGeo = new THREE.BoxGeometry(bldg.footprintWidth * 0.35, scaledH, bldg.footprintDepth * 0.35)
      const bMat = new THREE.MeshLambertMaterial({ color: bldg.color })
      const bMesh = new THREE.Mesh(bGeo, bMat)
      bMesh.position.set(0, scaledH / 2, 0)
      bMesh.castShadow = true
      bMesh.receiveShadow = true
      bldgGroup.add(bMesh)

      // Vidhana Soudha Dome
      if (bldg.hasDome) {
        const domeGeo = new THREE.CylinderGeometry(0, 2.5, 3.2, 16)
        const domeMat = new THREE.MeshLambertMaterial({ color: bldg.accentColor || 0xd97706 })
        const dome = new THREE.Mesh(domeGeo, domeMat)
        dome.position.set(0, scaledH + 1.6, 0)
        bldgGroup.add(dome)
      }

      bldgGroup.position.set(x, 0, z)
      bldgGroup.userData = { type: 'building', data: bldg }
      buildings.add(bldgGroup)

      // Register bounding mesh for raycasting
      bMesh.userData = { type: 'building', data: bldg }
      interactives.push(bMesh)
    })

    // ─── BUILD LAYER: Active Grievance Incidents Pins ───
    const defaultCoords = [
      { id: 'BBMP-GRV-2026-8819', lat: 12.9863, lng: 77.7289, title: 'Road Hazard · Whitefield Main Rd' },
      { id: 'BBMP-GRV-2026-8820', lat: 12.9282, lng: 77.6821, title: 'Drainage Overflow · Bellandur' },
      { id: 'BBMP-GRV-2026-8821', lat: 12.9783, lng: 77.6385, title: 'Stormwater Slab Damaged · Indiranagar' },
      { id: 'BBMP-GRV-2026-8822', lat: 12.9198, lng: 77.6392, title: 'Streetlight Transformer · HSR' },
      { id: 'BBMP-GRV-2026-8823', lat: 12.9412, lng: 77.7321, title: 'Culvert Repair Work · Varthur' },
    ]

    const incidentItems = issues.length > 0 ? issues.slice(0, 10) : defaultCoords
    const pinMeshes = []

    incidentItems.forEach((item) => {
      // If issue doesn't have exact lat/lng, estimate around Whitefield / Central
      const lat = item.lat || 12.9400 + Math.random() * 0.05
      const lng = item.lng || 77.6500 + Math.random() * 0.08
      const { x, z } = projectGeo(lat, lng)

      const pinGroup = new THREE.Group()

      // Shaft
      const shaftGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.5, 8)
      const shaftMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 })
      const shaft = new THREE.Mesh(shaftGeo, shaftMat)
      shaft.position.y = 2.25
      pinGroup.add(shaft)

      // Head
      const headGeo = new THREE.SphereGeometry(1.0, 16, 16)
      const headMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 })
      const head = new THREE.Mesh(headGeo, headMat)
      head.position.y = 4.8
      head.castShadow = true
      pinGroup.add(head)

      pinGroup.position.set(x, 0, z)
      pinGroup.userData = { type: 'incident', data: item, lat, lng }
      incidents.add(pinGroup)

      head.userData = { type: 'incident', data: item, lat, lng }
      interactives.push(head)
      pinMeshes.push(pinGroup)
    })

    sceneStateRef.current.interactiveObjects = interactives

    // ─── Raycaster Interaction ───
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onClick = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1
      mouse.y = -(((e.clientY - rect.top) / height) * 2 - 1)

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(sceneStateRef.current.interactiveObjects, true)

      if (intersects.length > 0) {
        let hit = intersects[0].object
        while (hit && !hit.userData?.type && hit.parent) {
          hit = hit.parent
        }

        if (hit && hit.userData?.type) {
          const { type, data } = hit.userData
          setSelectedNode({ type, data })

          // Calculate real spatial relationships
          const lat = data.lat || 12.9716
          const lng = data.lng || 77.5946
          const analysis = analyzeSpatialRelationships(lat, lng)
          setSpatialAnalysis(analysis)

          // Smooth camera glide to the asset
          const { x, z } = projectGeo(lat, lng)
          sceneStateRef.current.targetCamPos.set(x + 18, 24, z + 22)
          sceneStateRef.current.targetLookAt.set(x, 1, z)
        }
      }
    }
    container.addEventListener('click', onClick)

    // ─── Animation Loop ───
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Smooth camera interpolation
      camera.position.x += (sceneStateRef.current.targetCamPos.x - camera.position.x) * 0.05
      camera.position.y += (sceneStateRef.current.targetCamPos.y - camera.position.y) * 0.05
      camera.position.z += (sceneStateRef.current.targetCamPos.z - camera.position.z) * 0.05

      sceneStateRef.current.currentLookAt.x += (sceneStateRef.current.targetLookAt.x - sceneStateRef.current.currentLookAt.x) * 0.05
      sceneStateRef.current.currentLookAt.y += (sceneStateRef.current.targetLookAt.y - sceneStateRef.current.currentLookAt.y) * 0.05
      sceneStateRef.current.currentLookAt.z += (sceneStateRef.current.targetLookAt.z - sceneStateRef.current.currentLookAt.z) * 0.05
      camera.lookAt(sceneStateRef.current.currentLookAt)

      // Move Namma Metro Trains along routes
      sceneStateRef.current.trainMeshes.forEach((t) => {
        t.progress = (t.progress + delta * 0.05) % 1
        const pt = t.curve.getPointAt(t.progress)
        t.mesh.position.copy(pt)
        const tangent = t.curve.getTangentAt(t.progress)
        t.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent)
      })

      // Bob incident pins
      pinMeshes.forEach((pin, idx) => {
        pin.position.y = Math.sin(elapsed * 3 + idx * 1.5) * 0.35
      })

      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 560
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('click', onClick)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [issues])

  // Toggle Layer Visibility
  useEffect(() => {
    const { buildings, roads, metro, lakes, drains, incidents } = sceneStateRef.current.layerGroups
    if (buildings) buildings.visible = layers.buildings
    if (roads) roads.visible = layers.roads
    if (metro) metro.visible = layers.metro
    if (lakes) lakes.visible = layers.lakes
    if (drains) drains.visible = layers.drains
    if (incidents) incidents.visible = layers.incidents
  }, [layers])

  // Rainfall Flood Simulation Effect
  useEffect(() => {
    const lakeMeshes = sceneStateRef.current.lakeMeshes
    const rainFactor = rainfallMm / 120 // 0 to 1

    lakeMeshes.forEach(({ mesh, baseScale, lake }) => {
      // Bellandur and Varthur swell during heavy rain
      if (lake.id === 'LAKE_BELLANDUR' || lake.id === 'LAKE_VARTHUR') {
        const swell = 1 + rainFactor * 0.35
        mesh.scale.set(swell, swell, 1)
        mesh.material.color.set(rainFactor > 0.6 ? 0x0369a1 : 0x0284c7)
      }
    })
  }, [rainfallMm])

  // Camera Presets
  const applyPreset = (preset) => {
    setCameraPreset(preset)
    if (preset === 'overview') {
      sceneStateRef.current.targetCamPos.set(0, 75, 95)
      sceneStateRef.current.targetLookAt.set(0, 0, 0)
    } else if (preset === 'soudha') {
      const { x, z } = projectGeo(12.9797, 77.5907)
      sceneStateRef.current.targetCamPos.set(x + 14, 18, z + 20)
      sceneStateRef.current.targetLookAt.set(x, 2, z)
    } else if (preset === 'orr') {
      const { x, z } = projectGeo(12.9282, 77.6821) // Bellandur ORR
      sceneStateRef.current.targetCamPos.set(x + 16, 20, z + 22)
      sceneStateRef.current.targetLookAt.set(x, 1, z)
    } else if (preset === 'basin') {
      const { x, z } = projectGeo(12.9352, 77.6698) // Bellandur Lake Basin
      sceneStateRef.current.targetCamPos.set(x + 20, 26, z + 26)
      sceneStateRef.current.targetLookAt.set(x, 0, z)
    } else if (preset === 'majestic') {
      const { x, z } = projectGeo(12.9772, 77.5713) // Majestic
      sceneStateRef.current.targetCamPos.set(x + 14, 18, z + 18)
      sceneStateRef.current.targetLookAt.set(x, 1, z)
    }
  }

  // City-wide Health Metrics Computed Live
  const cityHealth = 84 - Math.round((rainfallMm / 120) * 16)
  const floodRiskIndex = Math.min(96, Math.round(28 + (rainfallMm / 120) * 65))
  const trafficLoadIndex = Math.min(95, Math.round(68 + (rainfallMm / 120) * 22))

  return (
    <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
      {/* Official Geospatial Banner Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              Greater Bengaluru Authority (GBA) &bull; Geospatial Digital Twin
            </span>
            <span className="text-[10px] font-mono font-bold bg-govblue text-white px-2 py-0.5 rounded">
              WGS84 PROJECTION
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-slate-900 mt-1">
            Bengaluru Urban Infrastructure Matrix &bull; Live Telemetry
          </h3>
          <p className="font-kannada text-xs font-semibold text-slate-700">
            ಬೆಂಗಳೂರು ಮಹಾನಗರ ಮೂಲಸೌಕರ್ಯ ಡಿಜಿಟಲ್ ಟ್ವಿನ್ - ನೈಜ ಭೌಗೋಳಿಕ ದತ್ತಾಂಶ
          </p>
        </div>

        {/* Camera View Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 font-bold mr-1">Views:</span>
          <button
            onClick={() => applyPreset('overview')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              cameraPreset === 'overview' ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Metropolitan Overview
          </button>
          <button
            onClick={() => applyPreset('soudha')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              cameraPreset === 'soudha' ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Vidhana Soudha
          </button>
          <button
            onClick={() => applyPreset('orr')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              cameraPreset === 'orr' ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            ORR Tech Belt
          </button>
          <button
            onClick={() => applyPreset('basin')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              cameraPreset === 'basin' ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Bellandur Basin
          </button>
          <button
            onClick={() => applyPreset('majestic')}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              cameraPreset === 'majestic' ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Majestic Hub
          </button>
        </div>
      </div>

      {/* Main 3D Digital Twin Viewport */}
      <div className="relative h-[480px] sm:h-[580px] bg-slate-100 overflow-hidden">
        {/* WebGL Canvas */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Left: Layer Stack Controls */}
        <div className="absolute top-4 left-4 z-10 bg-white border border-slate-300 rounded-xl p-3 shadow-md max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-xs font-bold text-slate-900 font-mono">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-govblue" /> GIS LAYER STACK
            </span>
            <span className="text-[10px] text-slate-500">7 ACTIVE</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.buildings}
                onChange={(e) => setLayers((p) => ({ ...p, buildings: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span>3D Buildings &amp; Landmarks</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.roads}
                onChange={(e) => setLayers((p) => ({ ...p, roads: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Car size={12} className="text-amber-600" /> Arterial Road Traffic Index
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.metro}
                onChange={(e) => setLayers((p) => ({ ...p, metro: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Train size={12} className="text-purple-600" /> Namma Metro Corridors (Purple/Green)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.lakes}
                onChange={(e) => setLayers((p) => ({ ...p, lakes: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Droplets size={12} className="text-blue-600" /> Lakes (Bellandur, Varthur, Ulsoor)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.drains}
                onChange={(e) => setLayers((p) => ({ ...p, drains: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-teal-700" /> Rajakaluve Stormwater Drains
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
              <input
                type="checkbox"
                checked={layers.incidents}
                onChange={(e) => setLayers((p) => ({ ...p, incidents: e.target.checked }))}
                className="rounded text-govblue focus:ring-0"
              />
              <span className="flex items-center gap-1 text-rose-700 font-bold">
                <MapPin size={12} /> Active Grievance Dockets
              </span>
            </label>
          </div>
        </div>

        {/* Top Right: Monsoon Cloudburst & Flood Simulator Slider */}
        <div className="absolute top-4 right-4 z-10 bg-white border border-slate-300 rounded-xl p-3 shadow-md w-72 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs font-mono font-bold text-slate-900">
            <span className="flex items-center gap-1.5 text-govblue">
              <CloudRain size={15} /> MONSOON FLOOD SIMULATOR
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${rainfallMm > 70 ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'}`}>
              {rainfallMm > 70 ? 'HIGH INUNDATION' : 'ROUTINE RAIN'}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
              <span>Rainfall Intensity</span>
              <strong className="text-slate-900">{rainfallMm} mm/hr</strong>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full accent-govblue cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
              <span>0 (Dry)</span>
              <span>60 (Heavy)</span>
              <span>120 (Cloudburst)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[9px]">Bellandur Swell</span>
              <strong className="text-slate-900">+{Math.round((rainfallMm / 120) * 35)}% Vol</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block text-[9px]">Catchment Risk</span>
              <strong className={floodRiskIndex > 70 ? 'text-rose-700' : 'text-amber-700'}>
                {floodRiskIndex} / 100
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Left: Relational Urban Infrastructure Node Inspector Drawer */}
        {selectedNode && spatialAnalysis && (
          <div className="absolute bottom-4 left-4 z-20 bg-white border-2 border-govblue rounded-xl p-4 shadow-xl max-w-sm sm:max-w-md animate-pageIn">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                  {selectedNode.type.toUpperCase()} NODE INSPECTED
                </span>
                <h4 className="font-display font-black text-base text-slate-900 mt-1 leading-snug">
                  {selectedNode.data.name || selectedNode.data.title || selectedNode.data.id}
                </h4>
                {selectedNode.data.kannada && (
                  <p className="font-kannada text-xs font-semibold text-amber-700">
                    {selectedNode.data.kannada}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Relational Cross-Layer Matrix Connectivity */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="font-mono text-[10px] font-bold uppercase text-govblue tracking-wider">
                Cross-Layer Topology Matrix Relationships:
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Nearest Drain */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[9px] uppercase block">Nearest Rajakaluve Drain</span>
                  <strong className="text-slate-900 block truncate">{spatialAnalysis.nearestDrain.name}</strong>
                  <span className="font-mono text-slate-600 text-[10px] font-bold">
                    Dist: {spatialAnalysis.nearestDrain.distanceMeters}m
                  </span>
                </div>

                {/* Nearest Lake */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[9px] uppercase block">Nearest Lake Catchment</span>
                  <strong className="text-slate-900 block truncate">{spatialAnalysis.nearestLake.name}</strong>
                  <span className="font-mono text-slate-600 text-[10px] font-bold">
                    Dist: {spatialAnalysis.nearestLake.distanceMeters}m
                  </span>
                </div>

                {/* Nearest Metro */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[9px] uppercase block">Nearest Namma Metro</span>
                  <strong className="text-slate-900 block truncate">{spatialAnalysis.nearestMetro.station}</strong>
                  <span className="font-mono text-slate-600 text-[10px] font-bold">
                    Dist: {spatialAnalysis.nearestMetro.distanceMeters}m
                  </span>
                </div>

                {/* Nearest Road */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-mono text-[9px] uppercase block">Nearest Arterial Road</span>
                  <strong className="text-slate-900 block truncate">{spatialAnalysis.nearestRoad.name}</strong>
                  <span className="font-mono text-slate-600 text-[10px] font-bold">
                    Dist: {spatialAnalysis.nearestRoad.distanceMeters}m
                  </span>
                </div>
              </div>

              {/* Dynamic Risk Matrix */}
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-950 block">Spatial Inundation Vulnerability</span>
                  <span className="text-[10px] text-amber-800">Based on elevation, lake proximity &amp; drain silt</span>
                </div>
                <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-amber-200 text-amber-950">
                  {spatialAnalysis.computedFloodRisk} / 100
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-500">Jurisdiction: {selectedNode.data.corporation || 'Greater Bengaluru'}</span>
              <button
                onClick={() => applyPreset('overview')}
                className="text-govblue font-bold hover:underline"
              >
                Reset Camera &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Bottom Right: Live Infrastructure State Telemetry */}
        <div className="absolute bottom-4 right-4 z-10 bg-white border border-slate-300 rounded-xl p-3 shadow-md text-xs font-mono space-y-2 hidden md:block">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-4">
            <span>CITY INFRASTRUCTURE STATE</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded border border-emerald-200">
              LIVE MATRIX
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 block">Health Index</span>
              <strong className="text-sm font-black text-slate-900">{cityHealth}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Traffic Load</span>
              <strong className="text-sm font-black text-amber-600">{trafficLoadIndex}%</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Flood Vulnerability</span>
              <strong className="text-sm font-black text-rose-600">{floodRiskIndex}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* GBA 5 City Corporations Quick Overview Ribbon */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {GBA_CORPORATIONS.map((corp) => (
          <div key={corp.id} className="p-2.5 rounded-lg border border-slate-200 bg-white">
            <span className="font-display font-bold text-slate-900 block truncate">{corp.name.replace(' Bengaluru Corporation', '')}</span>
            <span className="text-[10px] font-kannada text-slate-500 block truncate">{corp.kannada.split(' ')[0]}</span>
            <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-slate-600">
              <span>{corp.wardsCount} Wards</span>
              <span className="text-amber-700 font-bold">{corp.activeIncidents} Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
