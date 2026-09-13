import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Wrench, ShieldCheck, Cpu, Gauge, Layers, Info, ExternalLink, CheckCircle2 } from 'lucide-react'

const MACHINERY_PARTS = [
  {
    id: 'arm',
    name: 'Articulated Hydraulic Jet-Patch Arm',
    kannada: 'ಹೈಡ್ರಾಲಿಕ್ ಆಸ್ಫಾಲ್ಟ್ ಜೆಟ್ ಆರ್ಮ್',
    unitBadge: 'ARM UNIT',
    image: '/bbmp_unit_arm.jpg',
    spec: 'Pressure: 220 BAR (3,190 PSI) · Air Flow: 85 L/min',
    desc: 'High-velocity aggregate delivery robotic arm clears loose cavity debris with 95 km/h compressed air, sprays hot cationic emulsion tack coat, and compacts stone aggregates into potholes in under 8 minutes.',
    engineeringData: [
      { label: 'Working Radius', value: '4.5 m (360° Articulation)' },
      { label: 'Aggregate Rating', value: '6mm - 10mm Granite' },
      { label: 'Hydraulic Circuit', value: 'Rexroth Triple-Piston' },
      { label: 'Nozzle Type', value: 'Venturi Hot-Mix Jet' },
    ],
    camera: { x: -5, y: 3.5, z: 4.5, targetY: 1.2 },
  },
  {
    id: 'tank',
    name: 'Insulated Bituminous Emulsion Chamber',
    kannada: 'ಬಿಟುಮೆನ್ ಎಮಲ್ಷನ್ ಟ್ಯಾಂಕ್',
    unitBadge: 'TANK UNIT',
    image: '/bbmp_unit_tank.jpg',
    spec: 'Capacity: 1,500 Litres · Heated: 60°C - 75°C RS-1',
    desc: 'Rockwool-insulated cylindrical heating chamber maintains cationic rapid-setting emulsion at optimum thermodynamic flow temperature for instant pavement curing and water resistance.',
    engineeringData: [
      { label: 'Emulsion Grade', value: 'VG-30 Cationic RS-1' },
      { label: 'Heating Method', value: 'Thermostatic LPG Burner' },
      { label: 'Insulation', value: '50mm High-Density Rockwool' },
      { label: 'Safety Cut-Off', value: 'Dual Overpressure Relief' },
    ],
    camera: { x: -2, y: 4.5, z: 5.5, targetY: 1.5 },
  },
  {
    id: 'roller',
    name: 'Front Compaction Roller & Axle',
    kannada: 'ಕಂಪ್ಯಾಕ್ಷನ್ ರೋಲರ್',
    unitBadge: 'ROLLER UNIT',
    image: '/bbmp_unit_roller.jpg',
    spec: 'Centrifugal Force: 22 kN · Frequency: 45 Hz (2,700 VPM)',
    desc: 'Hydraulic dual-vibratory steel drum provides immediate high-density surface compaction flush with surrounding road gradient to prevent vehicular bump impact and eliminate water ponding.',
    engineeringData: [
      { label: 'Drum Width', value: '1,900 mm Heavy Steel' },
      { label: 'Dynamic Impact', value: '2,200 kg Surface Force' },
      { label: 'Surface Tolerance', value: 'Flush ±1.5 mm IRC Std' },
      { label: 'Suspension', value: 'Hydraulic Dual-Shock' },
    ],
    camera: { x: 4.5, y: 2.8, z: 4.2, targetY: 0.6 },
  },
  {
    id: 'telemetry',
    name: 'GIS Telemetry & Work-Order Computer',
    kannada: 'ಜಿಐಎಸ್ ಟೆಲಿಮೆಟ್ರಿ ಘಟಕ',
    unitBadge: 'TELEMETRY UNIT',
    image: '/bbmp_unit_telemetry.jpg',
    spec: 'GPS Accuracy: ± 0.25m RTK · 5G BBMP Command Link',
    desc: 'In-cab ruggedized Getac terminal logs square-meter asphalt delivery volumes, thermal telemetry, and GPS coordinates directly to BBMP Central Command Center for RTI compliance audits.',
    engineeringData: [
      { label: 'Positioning', value: 'Dual-Frequency RTK GPS' },
      { label: 'In-Cab Terminal', value: 'Getac Ruggedized IP67' },
      { label: 'Command Uplink', value: 'Encrypted 5G VPN' },
      { label: 'Compliance Audit', value: 'RTI Sec 4(1)(b) Direct' },
    ],
    camera: { x: 2.5, y: 4.5, z: 3.5, targetY: 2.2 },
  },
]

export default function ThreeMachineryViewer() {
  const containerRef = useRef(null)
  const [activePart, setActivePart] = useState(MACHINERY_PARTS[0])
  const [wireframe, setWireframe] = useState(false)
  const [isRotating, setIsRotating] = useState(true)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const meshRefs = useRef({})
  const modelGroupRef = useRef(null)

  // Subsystem selection handler that updates camera and 3D focus
  const handleSelectSubsystem = (part) => {
    setActivePart(part)
    if (cameraRef.current && part.camera) {
      const cam = cameraRef.current
      cam.position.set(part.camera.x, part.camera.y, part.camera.z)
      cam.lookAt(0, part.camera.targetY, 0)
    }

    // Highlight active 3D part
    Object.keys(meshRefs.current).forEach((key) => {
      const mesh = meshRefs.current[key]
      if (!mesh) return
      mesh.traverse((child) => {
        if (child.isMesh && child.material) {
          if (key === part.id) {
            child.material.emissive = new THREE.Color(0xd97706)
            child.material.emissiveIntensity = 0.35
          } else {
            child.material.emissive = new THREE.Color(0x000000)
            child.material.emissiveIntensity = 0
          }
        }
      })
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 420

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(7, 5, 8)
    camera.lookAt(0, 1.2, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lighting (Crisp Studio Daylight Lighting)
    const ambient = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(10, 16, 10)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.6)
    fillLight.position.set(-10, 8, -8)
    scene.add(fillLight)

    // Platform Base with Asphalt Road Surface
    const baseGeo = new THREE.CylinderGeometry(4.8, 5.0, 0.4, 32)
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x334155 }) // Dark Asphalt
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = -0.2
    baseMesh.receiveShadow = true
    scene.add(baseMesh)

    // Road White Line Striping on Base
    const stripeGeo = new THREE.BoxGeometry(0.2, 0.02, 3.2)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const stripe = new THREE.Mesh(stripeGeo, stripeMat)
    stripe.position.set(0, 0.01, 0)
    baseMesh.add(stripe)

    // Machinery Root Group
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    modelGroupRef.current = modelGroup

    // Materials
    const chassisMat = new THREE.MeshLambertMaterial({ color: 0x005a36 }) // Official BBMP Forest Green
    const cabMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x475569 })
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 })
    const yellowArmMat = new THREE.MeshLambertMaterial({ color: 0xd97706 })
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x0a2540 })
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a })

    // 1. Chassis
    const chassisGeo = new THREE.BoxGeometry(4.4, 0.9, 2.1)
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.set(0, 0.9, 0)
    chassis.castShadow = true
    chassis.receiveShadow = true
    modelGroup.add(chassis)

    // 2. Cab
    const cabGeo = new THREE.BoxGeometry(1.5, 1.3, 2.0)
    const cab = new THREE.Mesh(cabGeo, cabMat)
    cab.position.set(1.3, 1.85, 0)
    cab.castShadow = true
    modelGroup.add(cab)

    // Windshield
    const windowGeo = new THREE.BoxGeometry(0.05, 0.75, 1.8)
    const windshield = new THREE.Mesh(windowGeo, glassMat)
    windshield.position.set(2.06, 1.95, 0)
    modelGroup.add(windshield)

    // Headlights
    const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16)
    const leftLight = new THREE.Mesh(lightGeo, headlightMat)
    leftLight.rotation.z = Math.PI / 2
    leftLight.position.set(2.21, 0.9, 0.75)
    modelGroup.add(leftLight)

    const rightLight = new THREE.Mesh(lightGeo, headlightMat)
    rightLight.rotation.z = Math.PI / 2
    rightLight.position.set(2.21, 0.9, -0.75)
    modelGroup.add(rightLight)

    // 3. Bitumen Emulsion Tank Unit
    const tankGroup = new THREE.Group()
    const tankGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.9, 24)
    const tank = new THREE.Mesh(tankGeo, metalMat)
    tank.rotation.z = Math.PI / 2
    tank.position.set(-0.7, 1.65, 0)
    tank.castShadow = true
    tankGroup.add(tank)

    // Tank Warning Bands
    const bandGeo = new THREE.TorusGeometry(0.77, 0.04, 8, 24)
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xd97706 })
    const band1 = new THREE.Mesh(bandGeo, bandMat)
    band1.rotation.y = Math.PI / 2
    band1.position.set(-0.3, 1.65, 0)
    tankGroup.add(band1)

    const band2 = new THREE.Mesh(bandGeo, bandMat)
    band2.rotation.y = Math.PI / 2
    band2.position.set(-1.1, 1.65, 0)
    tankGroup.add(band2)

    modelGroup.add(tankGroup)
    meshRefs.current.tank = tankGroup

    // 4. Wheels & Compaction Roller Unit
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.45, 20)
    const wheelPositions = [
      [1.1, 0.48, 1.1], [1.1, 0.48, -1.1],
      [-0.8, 0.48, 1.1], [-0.8, 0.48, -1.1]
    ]
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(wx, wy, wz)
      wheel.castShadow = true
      modelGroup.add(wheel)
    })

    // Heavy Roller Drum Unit
    const rollerGroup = new THREE.Group()
    const rollerGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.0, 28)
    const roller = new THREE.Mesh(rollerGeo, metalMat)
    roller.rotation.x = Math.PI / 2
    roller.position.set(-2.1, 0.55, 0)
    roller.castShadow = true
    rollerGroup.add(roller)

    // Hydraulic roller bracket
    const bracketGeo = new THREE.BoxGeometry(0.6, 0.2, 2.1)
    const bracket = new THREE.Mesh(bracketGeo, chromeMat)
    bracket.position.set(-1.9, 0.9, 0)
    rollerGroup.add(bracket)

    modelGroup.add(rollerGroup)
    meshRefs.current.roller = rollerGroup

    // 5. Articulated Hydraulic Jet-Patch Arm Unit
    const armGroup = new THREE.Group()
    armGroup.position.set(-1.6, 1.6, 0)

    // Arm Segment 1
    const seg1Geo = new THREE.BoxGeometry(1.6, 0.24, 0.24)
    const seg1 = new THREE.Mesh(seg1Geo, yellowArmMat)
    seg1.position.set(-0.7, 0.5, 0)
    seg1.rotation.z = -0.6
    seg1.castShadow = true
    armGroup.add(seg1)

    // Hydraulic Cylinder Piston
    const pistonGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12)
    const piston = new THREE.Mesh(pistonGeo, chromeMat)
    piston.position.set(-0.6, 0.2, 0.16)
    piston.rotation.z = -0.5
    armGroup.add(piston)

    // Articulation Swivel Joint
    const jointGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16)
    const joint = new THREE.Mesh(jointGeo, metalMat)
    joint.position.set(-1.4, 0.9, 0)
    armGroup.add(joint)

    // Arm Segment 2 (Pointing down to road)
    const seg2Geo = new THREE.BoxGeometry(1.5, 0.2, 0.2)
    const seg2 = new THREE.Mesh(seg2Geo, yellowArmMat)
    seg2.position.set(-1.8, 0.3, 0)
    seg2.rotation.z = 0.8
    seg2.castShadow = true
    armGroup.add(seg2)

    // High-Pressure Rubber Delivery Hose
    const hoseGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 16, Math.PI)
    const hoseMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })
    const hose = new THREE.Mesh(hoseGeo, hoseMat)
    hose.position.set(-1.4, 0.6, -0.15)
    armGroup.add(hose)

    // Venturi Aggregate Jet Nozzle
    const nozzleGeo = new THREE.ConeGeometry(0.28, 0.55, 16)
    const nozzleMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
    nozzle.rotation.x = Math.PI
    nozzle.position.set(-2.3, -0.3, 0)
    nozzle.castShadow = true
    armGroup.add(nozzle)

    modelGroup.add(armGroup)
    meshRefs.current.arm = armGroup

    // 6. GIS Telemetry Mast & Sensor Beacon Unit
    const telemetryGroup = new THREE.Group()
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8)
    const mast = new THREE.Mesh(mastGeo, metalMat)
    mast.position.set(0.7, 2.7, 0.5)
    telemetryGroup.add(mast)

    // Flashing Strobe Beacon
    const beaconGeo = new THREE.SphereGeometry(0.18, 16, 16)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xd97706 })
    const beacon = new THREE.Mesh(beaconGeo, beaconMat)
    beacon.position.set(0.7, 3.25, 0.5)
    telemetryGroup.add(beacon)

    // In-Cab GPS Antenna Disc
    const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16)
    const discMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const disc = new THREE.Mesh(discGeo, discMat)
    disc.position.set(1.3, 2.55, 0)
    telemetryGroup.add(disc)

    modelGroup.add(telemetryGroup)
    meshRefs.current.telemetry = telemetryGroup

    // Mouse Drag Rotation
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      modelGroup.rotation.y += deltaX * 0.01
      camera.position.y = Math.max(2, Math.min(8, camera.position.y + deltaY * 0.01))
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Animation Loop
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (isRotating && !isDragging) {
        modelGroup.rotation.y += 0.006
      }
      camera.lookAt(0, 1.2, 0)
      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 420
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isRotating])

  // Wireframe toggle effect
  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = wireframe
      }
    })
  }, [wireframe])

  return (
    <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              Interactive 3D Municipal Machinery Diagnostic
            </span>
          </div>
          <h3 className="heading text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            BBMP Rapid Road Surface Patcher &bull; Technical Model
          </h3>
          <p className="font-kannada text-xs font-semibold text-slate-600">
            ತ್ವರಿತ ರಸ್ತೆ ಗುಂಡಿ ದುರಸ್ತಿ ವಾಹನ - ತಾಂತ್ರಿಕ ವಿವರಣೆ ಮತ್ತು ನೈಜ ಘಟಕ ಪರಿವೀಕ್ಷಣೆ
          </p>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              wireframe ? 'bg-civic text-white border-civic' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers size={13} /> {wireframe ? 'Solid Mode' : 'Wireframe'}
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              isRotating ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100' : 'bg-amber-600 text-white border-amber-600'
            }`}
          >
            <RotateCw size={13} /> {isRotating ? 'Pause Spin' : 'Resume Spin'}
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas & Inspector Grid */}
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* WebGL 3D Model Viewport */}
        <div className="relative h-[360px] sm:h-[440px] bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-600 shadow-sm flex items-center gap-1.5">
            <RotateCw size={12} className="text-slate-400" /> Click &amp; drag mouse to inspect 360° &bull; Focused on {activePart.name.split(' ')[0]}
          </div>
        </div>

        {/* Real Subsystem Photo & Engineering Diagnostic Breakdown */}
        <div className="p-5 flex flex-col justify-between bg-white overflow-y-auto max-h-[500px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase font-bold text-govblue tracking-wider block">
                Subsystem Diagnostic Selector
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Real Field Data
              </span>
            </div>

            {/* Subsystem Selector Buttons with Thumbnails */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {MACHINERY_PARTS.map((part) => (
                <button
                  key={part.id}
                  onClick={() => handleSelectSubsystem(part)}
                  className={`p-2 text-left rounded-lg border text-xs transition flex items-center gap-2 ${
                    activePart.id === part.id
                      ? 'border-civic bg-slate-900 text-white shadow-sm ring-1 ring-amber-500'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={part.image}
                    alt={part.name}
                    className="h-9 w-9 rounded object-cover border border-slate-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-display font-bold block truncate text-[11px]">
                      {part.name.split(' ')[0]} {part.name.split(' ')[1]}
                    </span>
                    <span className={`text-[10px] font-mono block truncate font-bold ${activePart.id === part.id ? 'text-amber-400' : 'text-slate-500'}`}>
                      {part.unitBadge}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Part Real Photo & Technical Detail Card */}
            <div className="rounded-xl border border-slate-300 bg-slate-50 overflow-hidden shadow-sm">
              {/* Real Unit Photograph */}
              <div className="relative h-44 overflow-hidden border-b border-slate-200 group">
                <img
                  src={activePart.image}
                  alt={activePart.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-slate-900/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1.5 shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AUTHENTIC BENGALURU FIELD PHOTO
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/85 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow">
                  {activePart.unitBadge}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-sm text-slate-900 leading-tight">
                    {activePart.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded shrink-0">
                    BBMP Certified
                  </span>
                </div>
                <p className="font-kannada text-xs font-semibold text-amber-700">
                  {activePart.kannada}
                </p>

                <div className="py-1.5 px-2 bg-white rounded border border-slate-200 font-mono text-xs text-slate-800 font-bold">
                  {activePart.spec}
                </div>

                {/* 4 Real Engineering Specs */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {activePart.engineeringData.map((data) => (
                    <div key={data.label} className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none mb-0.5">
                        {data.label}
                      </span>
                      <span className="font-mono font-bold text-[11px] text-slate-900 block leading-tight">
                        {data.value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {activePart.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Fleet Status */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>BBMP FLEET ID: KA-01-GA-3456</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" /> STATUS: FIELD OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
