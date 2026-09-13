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
    camera: { x: 4.2, y: 3.2, z: 4.6, targetY: 1.2 },
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
    camera: { x: 4.5, y: 3.5, z: 4.8, targetY: 1.3 },
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
    camera: { x: 4.2, y: 3.0, z: 4.6, targetY: 1.1 },
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
    camera: { x: 2.2, y: 2.3, z: 3.6, targetY: 1.6 },
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

  // Subsystem selection handler that displays the dedicated technical 3D model
  const handleSelectSubsystem = (part) => {
    setActivePart(part)
    if (cameraRef.current && part.camera) {
      const cam = cameraRef.current
      cam.position.set(part.camera.x, part.camera.y, part.camera.z)
      cam.lookAt(0, part.camera.targetY, 0)
    }

    // Toggle visibility so ONLY the selected technical 3D model is active
    Object.keys(meshRefs.current).forEach((key) => {
      const model = meshRefs.current[key]
      if (model) {
        model.visible = (key === part.id)
      }
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

    // Enhanced Studio 3-Point Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
    keyLight.position.set(12, 18, 12)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 35
    keyLight.shadow.camera.left = -6
    keyLight.shadow.camera.right = 6
    keyLight.shadow.camera.top = 6
    keyLight.shadow.camera.bottom = -6
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.65)
    fillLight.position.set(-12, 10, -10)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.45)
    rimLight.position.set(0, 8, -14)
    scene.add(rimLight)

    // Platform Base with Asphalt Road Surface
    const baseGeo = new THREE.CylinderGeometry(5.2, 5.4, 0.35, 48)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.1 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = -0.18
    baseMesh.receiveShadow = true
    scene.add(baseMesh)

    // Road Markings (Circular curb ring + double yellow lines)
    const curbGeo = new THREE.TorusGeometry(4.9, 0.08, 12, 48)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 })
    const curbMesh = new THREE.Mesh(curbGeo, curbMat)
    curbMesh.rotation.x = Math.PI / 2
    curbMesh.position.y = 0.01
    baseMesh.add(curbMesh)

    const stripeGeo = new THREE.BoxGeometry(0.14, 0.01, 3.6)
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 })
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat)
    stripe1.position.set(0.12, 0.01, 0)
    baseMesh.add(stripe1)
    const stripe2 = new THREE.Mesh(stripeGeo, stripeMat)
    stripe2.position.set(-0.12, 0.01, 0)
    baseMesh.add(stripe2)

    // Machinery Root Group
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    modelGroupRef.current = modelGroup

    // Photorealistic PBR Materials
    const chassisPaintMat = new THREE.MeshStandardMaterial({ color: 0x054d2a, roughness: 0.35, metalness: 0.35 }) // Official BBMP Green
    const cabPaintMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.15 }) // Commercial White
    const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.6 }) // Structural Steel
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.12, metalness: 0.95 }) // Chrome Rams & Mirrors
    const yellowArmMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.25 }) // Industrial Yellow
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f2537, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 })
    const rubberTireMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.9, metalness: 0.05 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.85 })
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 })
    const amberBeaconMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, emissive: 0xf59e0b, emissiveIntensity: 0.9 })
    const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0xfef08a, emissiveIntensity: 0.8 })
    const taillightMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.2, emissive: 0xe11d48, emissiveIntensity: 0.7 })
    const tankBoilerMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.65 })
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.4, metalness: 0.1 })

    const materials = {
      chassisPaintMat,
      cabPaintMat,
      darkSteelMat,
      chromeMat,
      yellowArmMat,
      glassMat,
      rubberTireMat,
      rimMat,
      brassMat,
      amberBeaconMat,
      headlightMat,
      taillightMat,
      tankBoilerMat,
      hazardMat,
    }

    // ─── Build 4 Distinct Technical 3D Models ───
    const armModel = buildArmTechnicalModel(materials)
    const tankModel = buildTankTechnicalModel(materials)
    const rollerModel = buildRollerTechnicalModel(materials)
    const telemetryModel = buildTelemetryTechnicalModel(materials)

    // Set visibility matching activePart
    armModel.visible = (activePart.id === 'arm')
    tankModel.visible = (activePart.id === 'tank')
    rollerModel.visible = (activePart.id === 'roller')
    telemetryModel.visible = (activePart.id === 'telemetry')

    modelGroup.add(armModel)
    modelGroup.add(tankModel)
    modelGroup.add(rollerModel)
    modelGroup.add(telemetryModel)

    meshRefs.current = {
      arm: armModel,
      tank: tankModel,
      roller: rollerModel,
      telemetry: telemetryModel,
    }

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

// ─────────────────────────────────────────────────────────────
// Dedicated 3D Technical Subsystem Builders (100% Unique Models)
// ─────────────────────────────────────────────────────────────

function buildArmTechnicalModel(materials) {
  const group = new THREE.Group()
  const { darkSteelMat, yellowArmMat, chromeMat, brassMat, rubberTireMat, hazardMat } = materials

  // Base Turret Assembly
  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.45, 32), darkSteelMat)
  basePlinth.position.y = 0.225
  basePlinth.castShadow = true
  group.add(basePlinth)

  // Slew Ring Gear
  const slewGear = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.14, 32), chromeMat)
  slewGear.position.y = 0.52
  group.add(slewGear)

  // Rotary Hydraulic Manifold Motor
  const slewMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.65, 16), darkSteelMat)
  slewMotor.position.set(0.65, 0.7, 0.45)
  group.add(slewMotor)

  // Rotating Turret Deck
  const turretDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.3, 24), darkSteelMat)
  turretDeck.position.y = 0.74
  turretDeck.castShadow = true
  group.add(turretDeck)

  // Heavy A-Frame Uprights
  ;[0.42, -0.42].forEach((uz) => {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.22), yellowArmMat)
    upright.position.set(-0.15, 1.45, uz)
    upright.castShadow = true
    group.add(upright)
  })

  // Main Pivot Axle Pin
  const pivotPin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.15, 16), chromeMat)
  pivotPin.rotation.x = Math.PI / 2
  pivotPin.position.set(-0.15, 1.95, 0)
  group.add(pivotPin)

  // Primary Boom (Segment 1)
  const boom1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.48, 0.42), yellowArmMat)
  boom1.position.set(0.85, 2.25, 0)
  boom1.rotation.z = 0.35
  boom1.castShadow = true
  group.add(boom1)

  // Hazard Safety Stripes on Boom 1
  const hazard1 = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.14, 0.43), hazardMat)
  hazard1.position.set(0.85, 2.25, 0)
  hazard1.rotation.z = 0.35
  group.add(hazard1)

  // Dual Hydraulic Lift Rams
  ;[0.32, -0.32].forEach((cz) => {
    const cylBody = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.25, 16), darkSteelMat)
    cylBody.position.set(0.25, 1.35, cz)
    cylBody.rotation.z = 0.7
    group.add(cylBody)

    const pistonRod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 16), chromeMat)
    pistonRod.position.set(0.75, 1.85, cz)
    pistonRod.rotation.z = 0.7
    group.add(pistonRod)
  })

  // Articulated Knuckle Elbow Joint
  const knuckleHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.55, 24), darkSteelMat)
  knuckleHousing.rotation.x = Math.PI / 2
  knuckleHousing.position.set(1.9, 2.65, 0)
  group.add(knuckleHousing)

  // Secondary Boom (Segment 2) Extending Down
  const boom2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.38, 0.36), yellowArmMat)
  boom2.position.set(2.45, 1.85, 0)
  boom2.rotation.z = -0.75
  boom2.castShadow = true
  group.add(boom2)

  // Secondary Hydraulic Tilt Cylinder
  const tiltCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.95, 12), darkSteelMat)
  tiltCyl.position.set(1.45, 2.85, 0)
  tiltCyl.rotation.z = -0.35
  group.add(tiltCyl)

  const tiltRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), chromeMat)
  tiltRod.position.set(1.8, 2.7, 0)
  tiltRod.rotation.z = -0.35
  group.add(tiltRod)

  // Heavy Flexible Aggregate Delivery Hose
  const hoseTorus = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.12, 12, 32, Math.PI * 0.95), rubberTireMat)
  hoseTorus.position.set(1.6, 2.15, -0.28)
  group.add(hoseTorus)

  // Venturi Aggregate Jet Spray Head Nozzle
  const nozzleCone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.95, 24), darkSteelMat)
  nozzleCone.rotation.x = Math.PI
  nozzleCone.position.set(3.1, 0.85, 0)
  nozzleCone.castShadow = true
  group.add(nozzleCone)

  // Brass High-Pressure Emulsion Injection Ring Diffuser
  const brassRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 12, 24), brassMat)
  brassRing.rotation.x = Math.PI / 2
  brassRing.position.set(3.1, 0.5, 0)
  group.add(brassRing)

  // Air Blast Manifold & Valve
  const airManifold = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.25), darkSteelMat)
  airManifold.position.set(3.0, 1.35, 0)
  group.add(airManifold)

  const airValve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), brassMat)
  airValve.position.set(3.0, 1.4, 0.2)
  group.add(airValve)

  // Center the whole unit neatly on the turntable
  group.position.set(-0.9, 0, 0)
  return group
}

function buildTankTechnicalModel(materials) {
  const group = new THREE.Group()
  const { tankBoilerMat, darkSteelMat, yellowArmMat, chromeMat, brassMat, rubberTireMat, headlightMat } = materials

  // Structural Cradle Saddles (3 Heavy Saddles)
  ;[-1.2, 0.0, 1.2].forEach((sx) => {
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.65, 2.5), darkSteelMat)
    saddle.position.set(sx, 0.325, 0)
    saddle.castShadow = true
    group.add(saddle)

    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 2.7), darkSteelMat)
    basePlate.position.set(sx, 0.05, 0)
    group.add(basePlate)
  })

  // Main Insulated Cylindrical Boiler Tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 3.2, 36), tankBoilerMat)
  tank.rotation.z = Math.PI / 2
  tank.position.set(0, 1.6, 0)
  tank.castShadow = true
  group.add(tank)

  // Rounded Domed Pressure Heads
  const domeGeo = new THREE.SphereGeometry(1.25, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2)
  const frontDome = new THREE.Mesh(domeGeo, tankBoilerMat)
  frontDome.position.set(1.6, 1.6, 0)
  frontDome.rotation.z = -Math.PI / 2
  frontDome.castShadow = true
  group.add(frontDome)

  const rearDome = new THREE.Mesh(domeGeo, tankBoilerMat)
  rearDome.position.set(-1.6, 1.6, 0)
  rearDome.rotation.z = Math.PI / 2
  rearDome.castShadow = true
  group.add(rearDome)

  // Circumferential Safety Tension Bands (Yellow)
  ;[-0.9, 0.0, 0.9].forEach((bx) => {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.05, 12, 36), yellowArmMat)
    band.rotation.y = Math.PI / 2
    band.position.set(bx, 1.6, 0)
    group.add(band)

    // Tensioner Turnbuckles in Chrome
    const turnbuckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.12), chromeMat)
    turnbuckle.position.set(bx, 2.85, 0)
    group.add(turnbuckle)
  })

  // Overhead Service Inspection Manhole Hatch
  const hatchNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.22, 24), darkSteelMat)
  hatchNeck.position.set(0, 2.9, 0)
  group.add(hatchNeck)

  const hatchCover = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.1, 24), tankBoilerMat)
  hatchCover.position.set(0, 3.05, 0)
  group.add(hatchCover)

  const handwheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 20), chromeMat)
  handwheel.rotation.x = Math.PI / 2
  handwheel.position.set(0, 3.16, 0)
  group.add(handwheel)

  // Pressure Relief Safety Valve
  const prv = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12), brassMat)
  prv.position.set(0.6, 2.95, 0)
  group.add(prv)

  // Vertical Heating Burner Exhaust Chimney Flue
  const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.35, 16), chromeMat)
  flue.position.set(1.2, 2.85, -0.45)
  group.add(flue)

  const rainCap = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 16), darkSteelMat)
  rainCap.position.set(1.2, 3.55, -0.45)
  group.add(rainCap)

  // Front LPG Thermostatic Heating Burner Box
  const burnerBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 0.7), darkSteelMat)
  burnerBox.position.set(1.9, 0.95, 0)
  burnerBox.castShadow = true
  group.add(burnerBox)

  const burnerShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.45, 16), chromeMat)
  burnerShroud.rotation.z = Math.PI / 2
  burnerShroud.position.set(2.25, 0.95, 0)
  group.add(burnerShroud)

  // Side Access Stainless Steel Ladder
  ;[-0.9, -0.6, -0.3, 0, 0.3, 0.6].forEach((ry) => {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), chromeMat)
    rung.rotation.z = Math.PI / 2
    rung.position.set(0, 1.4 + ry, 1.45)
    group.add(rung)
  })

  // Lateral Instrumentation & Control Module
  const instrBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.22), darkSteelMat)
  instrBox.position.set(0.3, 1.65, 1.38)
  group.add(instrBox)

  // 75.0°C Glowing Digital Readout
  const tempScreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.04), headlightMat)
  tempScreen.position.set(0.45, 1.75, 1.5)
  group.add(tempScreen)

  // Dual Analog Pressure Gauges
  ;[0.1, -0.15].forEach((gx) => {
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16), chromeMat)
    gauge.rotation.x = Math.PI / 2
    gauge.position.set(gx, 1.75, 1.5)
    group.add(gauge)
  })

  // Brass Piping Manifold & Shutoff Valves
  const mainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12), brassMat)
  mainPipe.rotation.z = Math.PI / 2
  mainPipe.position.set(0.2, 0.95, 1.4)
  group.add(mainPipe)

  // Coiled Delivery Hose Storage Reel
  const reelDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.45, 24), darkSteelMat)
  reelDrum.rotation.z = Math.PI / 2
  reelDrum.position.set(-1.95, 1.25, 0.6)
  group.add(reelDrum)

  const reelHose = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.08, 10, 24), rubberTireMat)
  reelHose.rotation.y = Math.PI / 2
  reelHose.position.set(-1.95, 1.25, 0.6)
  group.add(reelHose)

  return group
}

function buildRollerTechnicalModel(materials) {
  const group = new THREE.Group()
  const { darkSteelMat, yellowArmMat, chromeMat, brassMat, rubberTireMat } = materials

  // Heavy-Duty Machined Ground Steel Compaction Drum
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 48), darkSteelMat)
  drum.rotation.x = Math.PI / 2
  drum.position.set(0, 1.2, 0)
  drum.castShadow = true
  group.add(drum)

  // Drum Chrome End Rims & Bearing Flanges
  ;[1.62, -1.62].forEach((dz) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, 0.06, 36), chromeMat)
    rim.rotation.x = Math.PI / 2
    rim.position.set(0, 1.2, dz)
    group.add(rim)

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 20), darkSteelMat)
    hub.rotation.x = Math.PI / 2
    hub.position.set(0, 1.2, dz + (dz > 0 ? 0.15 : -0.15))
    group.add(hub)

    // Wheel Lug Studs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), chromeMat)
      stud.rotation.x = Math.PI / 2
      stud.position.set(Math.cos(angle) * 0.28, 1.2 + Math.sin(angle) * 0.28, dz + (dz > 0 ? 0.3 : -0.3))
      group.add(stud)
    }
  })

  // Heavy Trailing Linkage Arms
  ;[1.85, -1.85].forEach((az) => {
    const swingArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.32, 0.22), yellowArmMat)
    swingArm.position.set(-0.75, 1.2, az)
    swingArm.castShadow = true
    group.add(swingArm)

    // Articulated Pivot Bearing Housing
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.28, 16), darkSteelMat)
    pivot.rotation.x = Math.PI / 2
    pivot.position.set(-1.6, 1.2, az)
    group.add(pivot)

    // Heavy Hydraulic Lift & Downpressure Ram
    const cylBody = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 16), darkSteelMat)
    cylBody.position.set(-1.2, 1.85, az)
    cylBody.rotation.z = -0.55
    group.add(cylBody)

    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 16), chromeMat)
    piston.position.set(-0.7, 1.45, az)
    piston.rotation.z = -0.55
    group.add(piston)
  })

  // Transverse Heavy Torsion Tube Frame Crossmember
  const crossBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.8, 24), darkSteelMat)
  crossBeam.rotation.x = Math.PI / 2
  crossBeam.position.set(-1.6, 1.2, 0)
  group.add(crossBeam)

  // Full-Width Drum Scraper Blade Assembly
  const scraperBeam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 3.3), darkSteelMat)
  scraperBeam.position.set(0.65, 1.95, 0)
  group.add(scraperBeam)

  const rubberBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 3.25), rubberTireMat)
  rubberBlade.position.set(0.52, 1.8, 0)
  rubberBlade.rotation.z = 0.45
  group.add(rubberBlade)

  // Overhead Water / Emulsion Spray Bar with Nozzles
  const sprayBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 16), chromeMat)
  sprayBar.rotation.x = Math.PI / 2
  sprayBar.position.set(0.85, 2.2, 0)
  group.add(sprayBar)

  // 7 Atomizing Water Spray Nozzles
  for (let n = -3; n <= 3; n++) {
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), brassMat)
    nozzle.rotation.z = 0.5
    nozzle.position.set(0.82, 2.12, n * 0.45)
    group.add(nozzle)
  }

  // Hydraulic Vibratory Drive Motor Pod on Left Hub
  const motorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.55, 20), darkSteelMat)
  motorHousing.rotation.x = Math.PI / 2
  motorHousing.position.set(0, 1.2, 2.05)
  group.add(motorHousing)

  // Braided Hydraulic Hoses
  const hose1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 16), rubberTireMat)
  hose1.position.set(-0.35, 1.45, 2.0)
  group.add(hose1)

  return group
}

function buildTelemetryTechnicalModel(materials) {
  const group = new THREE.Group()
  const { darkSteelMat, cabPaintMat, chromeMat, rubberTireMat } = materials

  // Vehicle Heavy-Duty Steel Mounting Pedestal & Baseplate
  const baseFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.15, 24), darkSteelMat)
  baseFlange.position.y = 0.075
  group.add(baseFlange)

  const pedestalMast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 16), darkSteelMat)
  pedestalMast.position.y = 0.65
  group.add(pedestalMast)

  // Heavy Ball-and-Socket Articulated RAM Clamp
  const ramKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.35, 12), chromeMat)
  ramKnob.rotation.z = Math.PI / 2
  ramKnob.position.set(0.28, 1.1, 0)
  group.add(ramKnob)

  // Ruggedized Getac In-Cab Terminal Body
  const tabletBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.22), darkSteelMat)
  tabletBody.position.set(0, 1.8, 0)
  tabletBody.rotation.x = -0.15
  tabletBody.castShadow = true
  group.add(tabletBody)

  // Ruggedized Rubber Impact Corners
  ;[
    [1.15, 2.55], [-1.15, 2.55],
    [1.15, 1.05], [-1.15, 1.05],
  ].forEach(([cx, cy]) => {
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.28), rubberTireMat)
    bumper.position.set(cx, cy, 0)
    bumper.rotation.x = -0.15
    group.add(bumper)
  })

  // 10-Inch High-Contrast Diagnostic Screen
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 1.25, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0x071b2f,
      roughness: 0.2,
      emissive: 0x052e42,
      emissiveIntensity: 0.8,
    })
  )
  screen.position.set(0, 1.8, 0.12)
  screen.rotation.x = -0.15
  group.add(screen)

  // Screen UI Simulation: Glowing Map Grid lines & Reticle
  const gridLine1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.02, 0.01),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  gridLine1.position.set(0, 1.8, 0.13)
  gridLine1.rotation.x = -0.15
  group.add(gridLine1)

  const gridLine2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 1.1, 0.01),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  )
  gridLine2.position.set(0, 1.8, 0.13)
  gridLine2.rotation.x = -0.15
  group.add(gridLine2)

  // Target GPS Reticle Center
  const reticle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.02, 8, 16),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  )
  reticle.position.set(0.1, 1.85, 0.13)
  reticle.rotation.x = -0.15
  group.add(reticle)

  // Tactile Military Keypad Buttons & Diagnostic LEDs
  ;[-0.6, -0.3, 0.0, 0.3, 0.6].forEach((bx) => {
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.04), rubberTireMat)
    btn.position.set(bx, 1.12, 0.11)
    btn.rotation.x = -0.15
    group.add(btn)
  })

  // Status Indicator LEDs (Green, Blue, Amber)
  ;[
    [0.75, 0x10b981], // Green Power
    [0.85, 0x38bdf8], // Blue 5G
    [0.95, 0xf59e0b], // Amber RTK Lock
  ].forEach(([lx, color]) => {
    const led = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8),
      new THREE.MeshBasicMaterial({ color })
    )
    led.rotation.x = Math.PI / 2
    led.position.set(lx, 2.45, 0.12)
    group.add(led)
  })

  // High-Precision Dual-Frequency RTK GPS Dome Antenna
  const rtkMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 12), chromeMat)
  rtkMast.position.set(-1.3, 1.6, -0.45)
  group.add(rtkMast)

  const rtkDome = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.18, 24), cabPaintMat)
  rtkDome.position.set(-1.3, 2.25, -0.45)
  group.add(rtkDome)

  // 5G High-Gain Cellular Whip Antenna
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 8), darkSteelMat)
  whip.position.set(1.3, 2.0, -0.45)
  whip.rotation.z = -0.12
  group.add(whip)

  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 16), darkSteelMat)
  coil.position.set(1.3, 1.35, -0.45)
  group.add(coil)

  // Ribbed Protective CAN-bus Wiring Loom Conduit
  const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12), rubberTireMat)
  conduit.position.set(0, 0.9, -0.2)
  group.add(conduit)

  // Scale and angle the terminal towards front-quarter camera perspective
  group.rotation.y = 0.35
  group.scale.set(0.9, 0.9, 0.9)

  return group
}
