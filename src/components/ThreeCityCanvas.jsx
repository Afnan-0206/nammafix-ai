import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { MapPin, Navigation, ShieldCheck, Sun, Sunset, CloudSun, Eye, Compass, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function ThreeCityCanvas({ onSelectWard, activeWard = 'Whitefield' }) {
  const containerRef = useRef(null)
  const [hoveredInfo, setHoveredInfo] = useState(null)
  const [timeOfDay, setTimeOfDay] = useState('day') // 'day' | 'golden' | 'monsoon'
  const [cameraPreset, setCameraPreset] = useState('iso') // 'iso' | 'gov' | 'corridor' | 'hazard'
  const stateRef = useRef({
    targetCamPos: new THREE.Vector3(42, 38, 50),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    dirLight: null,
    ambientLight: null,
    scene: null,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 460

    // Scene
    const scene = new THREE.Scene()
    stateRef.current.scene = scene
    scene.background = new THREE.Color(0xf1f5f9)

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000)
    camera.position.set(42, 38, 50)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    stateRef.current.ambientLight = ambientLight

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.3)
    dirLight.position.set(40, 65, 30)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.near = 10
    dirLight.shadow.camera.far = 160
    dirLight.shadow.camera.left = -40
    dirLight.shadow.camera.right = 40
    dirLight.shadow.camera.top = 40
    dirLight.shadow.camera.bottom = -40
    dirLight.shadow.bias = -0.0005
    scene.add(dirLight)
    stateRef.current.dirLight = dirLight

    // Ground Plane (Daylight Civic Pavement)
    const groundGeo = new THREE.PlaneGeometry(70, 70)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Road Grid Materials
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }) // Crisp dark asphalt
    const roadMarkingMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x15803d }) // Cubbon Park Garden City

    // Main Avenue (East-West)
    const mainRoadGeo = new THREE.PlaneGeometry(70, 4.5)
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat)
    mainRoad.rotation.x = -Math.PI / 2
    mainRoad.position.y = 0.02
    mainRoad.receiveShadow = true
    scene.add(mainRoad)

    // Cross Boulevard (North-South)
    const crossRoadGeo = new THREE.PlaneGeometry(4.5, 70)
    const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat)
    crossRoad.rotation.x = -Math.PI / 2
    crossRoad.position.y = 0.02
    crossRoad.receiveShadow = true
    scene.add(crossRoad)

    // Road Dashes
    for (let x = -32; x <= 32; x += 4) {
      if (Math.abs(x) < 3) continue
      const dashGeo = new THREE.PlaneGeometry(2, 0.2)
      const dash = new THREE.Mesh(dashGeo, roadMarkingMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(x, 0.03, 0)
      scene.add(dash)
    }
    for (let z = -32; z <= 32; z += 4) {
      if (Math.abs(z) < 3) continue
      const dashGeo = new THREE.PlaneGeometry(0.2, 2)
      const dash = new THREE.Mesh(dashGeo, roadMarkingMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(0, 0.03, z)
      scene.add(dash)
    }

    // Cubbon Park green zones
    const park1Geo = new THREE.PlaneGeometry(18, 18)
    const park1 = new THREE.Mesh(park1Geo, greenMat)
    park1.rotation.x = -Math.PI / 2
    park1.position.set(-16, 0.03, -16)
    park1.receiveShadow = true
    scene.add(park1)

    // Procedural 3D Trees in Park
    const treeTrunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 6)
    const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f })
    const treeFoliageGeo = new THREE.ConeGeometry(1, 2.2, 6)
    const treeFoliageMat = new THREE.MeshLambertMaterial({ color: 0x166534 })

    const treeCoords = [
      [-12, -12], [-14, -18], [-18, -13], [-20, -20], [-10, -22], [-22, -11]
    ]
    treeCoords.forEach(([tx, tz]) => {
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat)
      trunk.position.y = 0.6
      trunk.castShadow = true
      tree.add(trunk)

      const foliage = new THREE.Mesh(treeFoliageGeo, treeFoliageMat)
      foliage.position.y = 2.0
      foliage.castShadow = true
      tree.add(foliage)

      tree.position.set(tx, 0, tz)
      scene.add(tree)
    })

    // City Buildings Group
    const cityGroup = new THREE.Group()
    scene.add(cityGroup)

    const buildingColors = [0xffffff, 0xf8fafc, 0x0a2540, 0x1e3a8a, 0xe2e8f0, 0x334155]

    for (let x = -26; x <= 26; x += 7) {
      for (let z = -26; z <= 26; z += 7) {
        if (Math.abs(x) < 4 || Math.abs(z) < 4) continue
        if (x < -6 && z < -6) continue // Reserved for Vidhana Soudha & Park

        const h = 4 + Math.random() * 14
        const bGeo = new THREE.BoxGeometry(4.8, h, 4.8)
        const bMat = new THREE.MeshLambertMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        })
        const bMesh = new THREE.Mesh(bGeo, bMat)
        bMesh.position.set(x, h / 2, z)
        bMesh.castShadow = true
        bMesh.receiveShadow = true
        cityGroup.add(bMesh)

        // Architectural Roof Ledge
        const roofGeo = new THREE.BoxGeometry(5.1, 0.4, 5.1)
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x475569 })
        const roof = new THREE.Mesh(roofGeo, roofMat)
        roof.position.set(x, h + 0.2, z)
        roof.castShadow = true
        cityGroup.add(roof)
      }
    }

    // Central Iconic Building (Vidhana Soudha civic architectural tribute)
    const vsGroup = new THREE.Group()
    const vsBaseGeo = new THREE.BoxGeometry(10, 7, 10)
    const vsBaseMat = new THREE.MeshLambertMaterial({ color: 0x0a2540 }) // Deep Gov Navy
    const vsBase = new THREE.Mesh(vsBaseGeo, vsBaseMat)
    vsBase.position.set(-16, 3.5, -16)
    vsBase.castShadow = true
    vsBase.receiveShadow = true
    vsGroup.add(vsBase)

    // Vidhana Soudha Tier 2
    const vsTier2Geo = new THREE.BoxGeometry(7, 3, 7)
    const vsTier2Mat = new THREE.MeshLambertMaterial({ color: 0x1e293b })
    const vsTier2 = new THREE.Mesh(vsTier2Geo, vsTier2Mat)
    vsTier2.position.set(-16, 8.5, -16)
    vsTier2.castShadow = true
    vsGroup.add(vsTier2)

    // Vidhana Soudha Dome
    const domeGeo = new THREE.CylinderGeometry(0, 4, 4.5, 20)
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }) // Karnataka Amber Gold
    const dome = new THREE.Mesh(domeGeo, domeMat)
    dome.position.set(-16, 12, -16)
    dome.castShadow = true
    vsGroup.add(dome)

    // Golden Finial
    const finialGeo = new THREE.SphereGeometry(0.8, 12, 12)
    const finialMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b })
    const finial = new THREE.Mesh(finialGeo, finialMat)
    finial.position.set(-16, 14.8, -16)
    vsGroup.add(finial)
    scene.add(vsGroup)

    // ─── Animated 3D Municipal Maintenance Vehicles ───
    const vehicles = []
    function createCivicTruck(color, isEmergency = false) {
      const truck = new THREE.Group()

      // Chassis
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.0, 1.2)
      const bodyMat = new THREE.MeshLambertMaterial({ color })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.y = 0.6
      body.castShadow = true
      truck.add(body)

      // Cab
      const cabGeo = new THREE.BoxGeometry(0.9, 0.8, 1.1)
      const cabMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const cab = new THREE.Mesh(cabGeo, cabMat)
      cab.position.set(0.6, 1.2, 0)
      cab.castShadow = true
      truck.add(cab)

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 12)
      const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })
      const wheelPositions = [
        [-0.7, 0.3, 0.65], [-0.7, 0.3, -0.65],
        [0.7, 0.3, 0.65], [0.7, 0.3, -0.65]
      ]
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat)
        wheel.rotation.x = Math.PI / 2
        wheel.position.set(wx, wy, wz)
        truck.add(wheel)
      })

      // Roof Beacon Light
      const beaconGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8)
      const beaconMat = new THREE.MeshBasicMaterial({ color: isEmergency ? 0xdc2626 : 0xd97706 })
      const beacon = new THREE.Mesh(beaconGeo, beaconMat)
      beacon.position.set(0.6, 1.7, 0)
      truck.add(beacon)

      return truck
    }

    // Vehicle 1: BBMP Rapid Road Patcher (Main East-West Road)
    const truck1 = createCivicTruck(0x047857, false) // BBMP Green
    truck1.position.set(-25, 0, 1.1)
    scene.add(truck1)
    vehicles.push({ mesh: truck1, axis: 'x', dir: 1, min: -32, max: 32, speed: 0.12, laneZ: 1.1 })

    // Vehicle 2: Municipal Asphalt Utility Van (Opposite lane)
    const truck2 = createCivicTruck(0xd97706, false) // Amber fleet
    truck2.rotation.y = Math.PI
    truck2.position.set(28, 0, -1.1)
    scene.add(truck2)
    vehicles.push({ mesh: truck2, axis: 'x', dir: -1, min: -32, max: 32, speed: 0.14, laneZ: -1.1 })

    // Vehicle 3: BESCOM Emergency Repair Van (Cross Boulevard)
    const truck3 = createCivicTruck(0x1d4ed8, true) // Royal Blue BESCOM
    truck3.rotation.y = Math.PI / 2
    truck3.position.set(1.1, 0, -28)
    scene.add(truck3)
    vehicles.push({ mesh: truck3, axis: 'z', dir: 1, min: -32, max: 32, speed: 0.15, laneX: 1.1 })

    // ─── Animated 3D BBMP Survey Drone ───
    const drone = new THREE.Group()
    const droneCoreGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7)
    const droneCoreMat = new THREE.MeshLambertMaterial({ color: 0x0a2540 })
    const droneCore = new THREE.Mesh(droneCoreGeo, droneCoreMat)
    drone.add(droneCore)

    // 4 Rotors
    const rotorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 8)
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    const rotors = []
    const rotorOffsets = [[0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]]
    rotorOffsets.forEach(([rx, rz]) => {
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6)
      const armMat = new THREE.MeshLambertMaterial({ color: 0x475569 })
      const arm = new THREE.Mesh(armGeo, armMat)
      arm.rotation.z = Math.PI / 2
      arm.position.set(rx * 0.5, 0.05, rz * 0.5)
      drone.add(arm)

      const rotor = new THREE.Mesh(rotorGeo, rotorMat)
      rotor.position.set(rx, 0.15, rz)
      drone.add(rotor)
      rotors.push(rotor)
    })

    // Downward Scan Cone
    const coneGeo = new THREE.ConeGeometry(2.4, 4.5, 16, 1, true)
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const scanCone = new THREE.Mesh(coneGeo, coneMat)
    scanCone.position.y = -2.25
    drone.add(scanCone)

    drone.position.set(12, 10, 12) // Hovering above Whitefield hazard pin
    scene.add(drone)

    // ─── 3D Hazard Pins ───
    const pinData = [
      { name: 'Whitefield', category: 'Road Hazard · Pothole Defect', urgency: '88/100', officer: 'Er. R. Ramesh, AEE Road Infrastructure', x: 12, z: 12, color: 0xdc2626, status: 'Active Crew Dispatched' },
      { name: 'Bellandur', category: 'Drainage Culvert Overflow', urgency: '74/100', officer: 'Er. S. Manjunath, AEE Stormwater Drains', x: 16, z: -8, color: 0xd97706, status: 'Desilting In Progress' },
      { name: 'Indiranagar', category: 'Hot-Mix Bitumen Resurfacing', urgency: 'Resolved', officer: 'Er. Priya Rao, Executive Engineer', x: -8, z: 14, color: 0x047857, status: 'Public Audit Certified' },
      { name: 'HSR Layout', category: 'Junction Streetlight Failure', urgency: '62/100', officer: 'Er. K. Suresh, BESCOM Section Officer', x: 7, z: -18, color: 0xd97706, status: 'Under Inspection' },
      { name: 'Varthur', category: 'Bridge Approach Grading', urgency: '79/100', officer: 'Er. V. Anand, BBMP Major Infrastructure', x: -18, z: 8, color: 0x1d4ed8, status: 'Contractor Work Order Issued' },
    ]

    const pinMeshes = []
    pinData.forEach((item) => {
      const pinGroup = new THREE.Group()

      // Vertical marker pin shaft
      const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8)
      const shaftMat = new THREE.MeshBasicMaterial({ color: item.color })
      const shaft = new THREE.Mesh(shaftGeo, shaftMat)
      shaft.position.y = 2.5
      pinGroup.add(shaft)

      // Top Sphere
      const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16)
      const sphereMat = new THREE.MeshLambertMaterial({ color: item.color })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.y = 5.2
      sphere.castShadow = true
      pinGroup.add(sphere)

      // Target Elevation Ring
      const ringGeo = new THREE.RingGeometry(1.4, 2.0, 24)
      const ringMat = new THREE.MeshBasicMaterial({ color: item.color, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.06
      pinGroup.add(ring)

      pinGroup.position.set(item.x, 0, item.z)
      pinGroup.userData = item
      scene.add(pinGroup)
      pinMeshes.push(pinGroup)
    })

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    let targetTiltX = 0
    let targetTiltY = 0

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / height) * 2 - 1)
    }
    container.addEventListener('mousemove', onMouseMove)

    // Raycaster for Pin Clicks
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onClick = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1
      mouse.y = -(((e.clientY - rect.top) / height) * 2 - 1)

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(pinMeshes, true)
      if (intersects.length > 0) {
        let root = intersects[0].object
        while (root.parent && root.parent !== scene) {
          root = root.parent
        }
        if (root.userData && root.userData.name) {
          setHoveredInfo(root.userData)
          // Smooth focus camera towards this ward
          stateRef.current.targetCamPos.set(root.userData.x + 20, 22, root.userData.z + 24)
          stateRef.current.targetLookAt.set(root.userData.x, 2, root.userData.z)
          if (onSelectWard) onSelectWard(root.userData.name)
        }
      }
    }
    container.addEventListener('click', onClick)

    // Animation Loop
    let animId
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Smooth camera tilt & position interpolation
      targetTiltX += (mouseX * 8 - targetTiltX) * 0.05
      targetTiltY += (mouseY * 5 - targetTiltY) * 0.05

      camera.position.x += (stateRef.current.targetCamPos.x + targetTiltX - camera.position.x) * 0.04
      camera.position.y += (stateRef.current.targetCamPos.y + targetTiltY - camera.position.y) * 0.04
      camera.position.z += (stateRef.current.targetCamPos.z - camera.position.z) * 0.04

      stateRef.current.currentLookAt.x += (stateRef.current.targetLookAt.x - stateRef.current.currentLookAt.x) * 0.05
      stateRef.current.currentLookAt.y += (stateRef.current.targetLookAt.y - stateRef.current.currentLookAt.y) * 0.05
      stateRef.current.currentLookAt.z += (stateRef.current.targetLookAt.z - stateRef.current.currentLookAt.z) * 0.05
      camera.lookAt(stateRef.current.currentLookAt)

      // Animate Vehicles
      vehicles.forEach((v) => {
        if (v.axis === 'x') {
          v.mesh.position.x += v.dir * v.speed
          if (v.dir > 0 && v.mesh.position.x > v.max) v.mesh.position.x = v.min
          if (v.dir < 0 && v.mesh.position.x < v.min) v.mesh.position.x = v.max
        } else if (v.axis === 'z') {
          v.mesh.position.z += v.dir * v.speed
          if (v.dir > 0 && v.mesh.position.z > v.max) v.mesh.position.z = v.min
          if (v.dir < 0 && v.mesh.position.z < v.min) v.mesh.position.z = v.max
        }
      })

      // Animate Drones & Rotors
      rotors.forEach((r) => {
        r.rotation.y += 0.4
      })
      drone.position.y = 9.5 + Math.sin(elapsed * 2.5) * 0.6
      scanCone.rotation.y = elapsed * 1.5

      // Pin Bobbing Animation
      pinMeshes.forEach((pin, i) => {
        pin.position.y = Math.sin(elapsed * 3 + i * 1.2) * 0.4
      })

      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 460
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('click', onClick)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [onSelectWard])

  // Preset Handlers
  const applyPreset = (preset) => {
    setCameraPreset(preset)
    if (preset === 'iso') {
      stateRef.current.targetCamPos.set(42, 38, 50)
      stateRef.current.targetLookAt.set(0, 0, 0)
    } else if (preset === 'gov') {
      stateRef.current.targetCamPos.set(-2, 22, -2)
      stateRef.current.targetLookAt.set(-16, 5, -16)
    } else if (preset === 'corridor') {
      stateRef.current.targetCamPos.set(0, 16, 36)
      stateRef.current.targetLookAt.set(0, 0, 0)
    } else if (preset === 'hazard') {
      stateRef.current.targetCamPos.set(28, 20, 28)
      stateRef.current.targetLookAt.set(12, 2, 12)
    }
  }

  // Daylight / Time Handlers
  const applyLighting = (mode) => {
    setTimeOfDay(mode)
    const { scene, dirLight, ambientLight } = stateRef.current
    if (!scene || !dirLight || !ambientLight) return

    if (mode === 'day') {
      scene.background.set(0xf1f5f9)
      dirLight.color.set(0xfff7ed)
      dirLight.intensity = 1.3
      dirLight.position.set(40, 65, 30)
      ambientLight.color.set(0xffffff)
      ambientLight.intensity = 0.8
    } else if (mode === 'golden') {
      scene.background.set(0xfef3c7)
      dirLight.color.set(0xf59e0b)
      dirLight.intensity = 1.6
      dirLight.position.set(55, 35, 15)
      ambientLight.color.set(0xfef08a)
      ambientLight.intensity = 0.6
    } else if (mode === 'monsoon') {
      scene.background.set(0xe2e8f0)
      dirLight.color.set(0x94a3b8)
      dirLight.intensity = 0.9
      dirLight.position.set(20, 70, 20)
      ambientLight.color.set(0xcbd5e1)
      ambientLight.intensity = 0.9
    }
  }

  return (
    <div className="relative w-full h-[440px] sm:h-[500px] rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Official Government 3D Top Header Strip */}
      <div className="absolute top-4 left-4 z-10 bg-white border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm max-w-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-900 tracking-wide uppercase">
            BBMP 3D Ward Topography · Live Matrix
          </span>
        </div>
        <p className="font-sans text-[11px] text-slate-600 mt-1 leading-snug">
          Real-time WebGL municipal matrix. Moving vehicles indicate active BBMP roadwork squads. Click pins to zoom &amp; inspect ward dockets.
        </p>
      </div>

      {/* Camera & Preset Controls HUD (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Camera Angles */}
        <div className="bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm flex items-center gap-1">
          <button
            onClick={() => applyPreset('iso')}
            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition ${
              cameraPreset === 'iso' ? 'bg-civic text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Overview Isometric Perspective"
          >
            Overview
          </button>
          <button
            onClick={() => applyPreset('gov')}
            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition ${
              cameraPreset === 'gov' ? 'bg-civic text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Focus Vidhana Soudha Head Office"
          >
            Vidhana Soudha
          </button>
          <button
            onClick={() => applyPreset('corridor')}
            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition ${
              cameraPreset === 'corridor' ? 'bg-civic text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Main Arterial Traffic Corridor"
          >
            Corridor
          </button>
          <button
            onClick={() => applyPreset('hazard')}
            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition ${
              cameraPreset === 'hazard' ? 'bg-civic text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Focus Drone & Hazard Cluster"
          >
            Drone Sector
          </button>
        </div>

        {/* Lighting Cycle Controls */}
        <div className="bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm flex items-center justify-end gap-1">
          <span className="text-[10px] font-mono text-slate-500 font-bold px-1.5">Lighting:</span>
          <button
            onClick={() => applyLighting('day')}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              timeOfDay === 'day' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Daylight 11:00 AM Clear"
          >
            <Sun size={13} />
          </button>
          <button
            onClick={() => applyLighting('golden')}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              timeOfDay === 'golden' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Karnataka Sunset Amber Hour"
          >
            <Sunset size={13} />
          </button>
          <button
            onClick={() => applyLighting('monsoon')}
            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              timeOfDay === 'monsoon' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Monsoon Overcast Civic Filter"
          >
            <CloudSun size={13} />
          </button>
        </div>
      </div>

      {/* Active Pin Detailed Brief Dossier */}
      {hoveredInfo && (
        <div className="absolute bottom-4 left-4 z-10 bg-white border border-slate-300 rounded-xl p-4 shadow-lg max-w-sm animate-pageIn">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin size={15} className="text-govblue" /> {hoveredInfo.name} Ward Docket
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              hoveredInfo.urgency === 'Resolved'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}>
              {hoveredInfo.urgency}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-800 mt-2">{hoveredInfo.category}</p>
          <p className="text-[11px] text-slate-600 mt-1 font-mono">{hoveredInfo.officer}</p>

          <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-700 font-bold">{hoveredInfo.status}</span>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-200 text-xs font-mono">
            <button
              onClick={() => applyPreset('iso')}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <RotateCcw size={11} /> Reset Cam
            </button>
            <button
              onClick={() => onSelectWard && onSelectWard(hoveredInfo.name)}
              className="text-govblue font-bold hover:underline flex items-center gap-1"
            >
              Filter Ward Records &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Live Fleet & Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white border border-slate-300 rounded-xl p-3 shadow-sm text-[11px] font-mono space-y-1.5">
        <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
          <span>BBMP FLEET TELEMETRY</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-200">3 SQUADS EN ROUTE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-emerald-700" />
          <span className="text-slate-700">Rapid Road Patcher Squad</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-amber-600" />
          <span className="text-slate-700">Bitumen Utility Unit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-blue-600" />
          <span className="text-slate-700">Emergency Overhead Crew</span>
        </div>
      </div>
    </div>
  )
}
