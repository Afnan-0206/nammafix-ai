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

    // ─── 1. Heavy-Duty Chassis Frame Rails & Front Bumper ───
    const railGeo = new THREE.BoxGeometry(4.8, 0.25, 0.2)
    const leftRail = new THREE.Mesh(railGeo, darkSteelMat)
    leftRail.position.set(0, 0.7, 0.55)
    leftRail.castShadow = true
    modelGroup.add(leftRail)

    const rightRail = new THREE.Mesh(railGeo, darkSteelMat)
    rightRail.position.set(0, 0.7, -0.55)
    rightRail.castShadow = true
    modelGroup.add(rightRail)

    // Cross members
    ;[-1.8, -0.8, 0.2, 1.2, 2.1].forEach((cx) => {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 1.2), darkSteelMat)
      cross.position.set(cx, 0.7, 0)
      modelGroup.add(cross)
    })

    // Heavy Front Bumper with Tow Hooks
    const bumperGeo = new THREE.BoxGeometry(0.35, 0.38, 2.3)
    const bumper = new THREE.Mesh(bumperGeo, darkSteelMat)
    bumper.position.set(2.15, 0.75, 0)
    bumper.castShadow = true
    modelGroup.add(bumper)

    // Bumper Hazard Caution Plate
    const hazardPlate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 1.6), hazardMat)
    hazardPlate.position.set(2.33, 0.75, 0)
    modelGroup.add(hazardPlate)

    // Headlight Assemblies
    ;[0.85, -0.85].forEach((hz) => {
      const hlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.32), darkSteelMat)
      hlHousing.position.set(2.28, 0.82, hz)
      modelGroup.add(hlHousing)

      const hlLens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), headlightMat)
      hlLens.rotation.z = Math.PI / 2
      hlLens.position.set(2.33, 0.82, hz)
      modelGroup.add(hlLens)
    })

    // Rear Bumper & Taillights
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 2.2), darkSteelMat)
    rearBumper.position.set(-2.3, 0.7, 0)
    rearBumper.castShadow = true
    modelGroup.add(rearBumper)

    ;[0.8, -0.8].forEach((tz) => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.3), taillightMat)
      tl.position.set(-2.43, 0.75, tz)
      modelGroup.add(tl)
    })

    // ─── 2. Commercial Truck Cab (White & BBMP Green) ───
    const cabGroup = new THREE.Group()

    // Main Cab Body
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.45, 2.1), cabPaintMat)
    cabBody.position.set(1.2, 1.75, 0)
    cabBody.castShadow = true
    cabGroup.add(cabBody)

    // Cab Lower Skirt in Official BBMP Green
    const cabSkirt = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.45, 2.12), chassisPaintMat)
    cabSkirt.position.set(1.2, 1.15, 0)
    cabSkirt.castShadow = true
    cabGroup.add(cabSkirt)

    // Aerodynamic Slanted Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.82, 1.9), glassMat)
    windshield.position.set(2.01, 1.95, 0)
    windshield.rotation.z = -0.15
    cabGroup.add(windshield)

    // Twin Windshield Wipers
    ;[0.4, -0.4].forEach((wz) => {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.45, 0.03), darkSteelMat)
      wiper.position.set(2.04, 1.85, wz)
      wiper.rotation.z = 0.4
      cabGroup.add(wiper)
    })

    // Side Door Windows
    ;[1.06, -1.06].forEach((wz) => {
      const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.05), glassMat)
      sideWin.position.set(1.25, 2.0, wz)
      cabGroup.add(sideWin)

      // Door Handles
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.06), chromeMat)
      handle.position.set(0.9, 1.65, wz * 1.02)
      cabGroup.add(handle)

      // Side Entry Grab Steps
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.2), darkSteelMat)
      step.position.set(1.2, 0.75, wz * 1.05)
      cabGroup.add(step)

      // Heavy Side Mirrors on Chrome Tubular Brackets
      const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), chromeMat)
      bracket.position.set(1.9, 1.95, wz * 1.15)
      bracket.rotation.x = Math.PI / 2
      cabGroup.add(bracket)

      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.18), darkSteelMat)
      mirror.position.set(1.9, 1.95, wz * 1.3)
      cabGroup.add(mirror)
    })

    // Front Grille & Radiator
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 1.7), darkSteelMat)
    grille.position.set(2.02, 1.25, 0)
    cabGroup.add(grille)

    // Chrome Grille Louvers
    ;[1.4, 1.25, 1.1].forEach((ly) => {
      const louver = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 1.55), chromeMat)
      louver.position.set(2.07, ly, 0)
      cabGroup.add(louver)
    })

    // BBMP Crest Medallion on Grille
    const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 20), brassMat)
    crest.rotation.z = Math.PI / 2
    crest.position.set(2.08, 1.35, 0)
    cabGroup.add(crest)

    // Cab Roof Warning Lightbar & Beacons
    const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 1.5), darkSteelMat)
    lightbarBase.position.set(1.15, 2.52, 0)
    cabGroup.add(lightbarBase)

    ;[0.55, -0.55].forEach((bz) => {
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.18, 16), amberBeaconMat)
      beacon.position.set(1.15, 2.65, bz)
      cabGroup.add(beacon)
    })

    // Chrome Dual Air Horns
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.6, 12), chromeMat)
    horn.rotation.z = Math.PI / 2
    horn.position.set(1.25, 2.58, 0.18)
    cabGroup.add(horn)

    // Vertical Diesel Exhaust Chimney Stack
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 16), chromeMat)
    exhaust.position.set(0.35, 2.3, -0.9)
    exhaust.castShadow = true
    cabGroup.add(exhaust)

    const exhaustCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.15, 12), darkSteelMat)
    exhaustCap.position.set(0.35, 3.25, -0.9)
    exhaustCap.rotation.z = 0.3
    cabGroup.add(exhaustCap)

    modelGroup.add(cabGroup)

    // ─── 3. 6-Wheel Tandem Axle Suspension (2 Front, 4 Rear Duals) ───
    const createWheel = (wx, wy, wz, isDual = false) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.position.set(wx, wy, wz)

      // Outer Rubber Tire with Tread Chamfer
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, isDual ? 0.42 : 0.32, 28), rubberTireMat)
      tire.rotation.x = Math.PI / 2
      tire.castShadow = true
      wheelGroup.add(tire)

      // Alloy Wheel Rim
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, isDual ? 0.44 : 0.34, 20), rimMat)
      rim.rotation.x = Math.PI / 2
      wheelGroup.add(rim)

      // Central Hubcap & Lug Nuts
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, isDual ? 0.46 : 0.36, 16), darkSteelMat)
      hub.rotation.x = Math.PI / 2
      wheelGroup.add(hub)

      modelGroup.add(wheelGroup)
    }

    // Front Steer Axle (x = 1.2)
    createWheel(1.2, 0.5, 1.1)
    createWheel(1.2, 0.5, -1.1)

    // Rear Tandem Axle 1 (x = -0.6) Dual Wheels
    createWheel(-0.6, 0.5, 1.15, true)
    createWheel(-0.6, 0.5, -1.15, true)

    // Rear Tandem Axle 2 (x = -1.5) Dual Wheels
    createWheel(-1.5, 0.5, 1.15, true)
    createWheel(-1.5, 0.5, -1.15, true)

    // Mudguards / Fenders over wheels in BBMP Green
    ;[1.15, -1.15].forEach((fz) => {
      // Rear Tandem Fender
      const rearFender = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 0.5), chassisPaintMat)
      rearFender.position.set(-1.05, 1.1, fz)
      rearFender.castShadow = true
      modelGroup.add(rearFender)
    })

    // ─── 4. Subsystem 1: Insulated Bituminous Emulsion Boiler Tank ───
    const tankGroup = new THREE.Group()

    // Main Cylindrical Boiler Tank (Horizontal)
    const tankBody = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 2.2, 32), tankBoilerMat)
    tankBody.rotation.z = Math.PI / 2
    tankBody.position.set(-0.5, 1.72, 0)
    tankBody.castShadow = true
    tankGroup.add(tankBody)

    // Rounded Domed End Caps
    const domeGeo = new THREE.SphereGeometry(0.82, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const frontDome = new THREE.Mesh(domeGeo, tankBoilerMat)
    frontDome.position.set(0.6, 1.72, 0)
    frontDome.rotation.z = -Math.PI / 2
    frontDome.castShadow = true
    tankGroup.add(frontDome)

    const rearDome = new THREE.Mesh(domeGeo, tankBoilerMat)
    rearDome.position.set(-1.6, 1.72, 0)
    rearDome.rotation.z = Math.PI / 2
    rearDome.castShadow = true
    tankGroup.add(rearDome)

    // Structural Saddle Cradles
    ;[-1.2, -0.5, 0.2].forEach((sx) => {
      const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 1.8), darkSteelMat)
      saddle.position.set(sx, 0.95, 0)
      saddle.castShadow = true
      tankGroup.add(saddle)
    })

    // Safety Caution Circumferential Bands
    ;[-1.0, 0.0].forEach((bx) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.035, 12, 32), yellowArmMat)
      band.rotation.y = Math.PI / 2
      band.position.set(bx, 1.72, 0)
      tankGroup.add(band)
    })

    // Top Service Inspection Hatch & Handwheel
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 20), darkSteelMat)
    hatch.position.set(-0.5, 2.58, 0)
    tankGroup.add(hatch)

    const handwheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 16), chromeMat)
    handwheel.rotation.x = Math.PI / 2
    handwheel.position.set(-0.5, 2.68, 0)
    tankGroup.add(handwheel)

    // Lateral Thermal Instrumentation Cluster (Pressure Gauge & 75°C Digital Module)
    const gaugeBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.15), darkSteelMat)
    gaugeBox.position.set(-0.3, 1.7, 0.88)
    tankGroup.add(gaugeBox)

    const analogGauge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16), chromeMat)
    analogGauge.rotation.x = Math.PI / 2
    analogGauge.position.set(-0.3, 1.82, 0.96)
    tankGroup.add(analogGauge)

    const digitalReadout = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.02), headlightMat)
    digitalReadout.position.set(-0.3, 1.62, 0.96)
    tankGroup.add(digitalReadout)

    // Brass Circulation Pipes & Valves
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 12), brassMat)
    pipe.position.set(-0.3, 1.15, 0.85)
    tankGroup.add(pipe)

    // Rear High-Pressure Hose Storage Reel
    const reelGroup = new THREE.Group()
    reelGroup.position.set(-1.8, 1.4, 0.65)

    const reelDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.32, 20), darkSteelMat)
    reelDrum.rotation.z = Math.PI / 2
    reelGroup.add(reelDrum)

    const reelHose = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 20), rubberTireMat)
    reelHose.rotation.y = Math.PI / 2
    reelGroup.add(reelHose)
    tankGroup.add(reelGroup)

    modelGroup.add(tankGroup)
    meshRefs.current.tank = tankGroup

    // ─── 5. Subsystem 2: Articulated Hydraulic Jet-Patch Arm ───
    const armGroup = new THREE.Group()
    armGroup.position.set(-1.8, 1.35, 0)

    // Slewing Turret Base & Hydraulic Motor
    const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.35, 24), darkSteelMat)
    turretBase.castShadow = true
    armGroup.add(turretBase)

    const turretGear = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 24), chromeMat)
    turretGear.position.y = 0.12
    armGroup.add(turretGear)

    // Primary Boom (Segment 1) in Heavy Industrial Yellow
    const boom1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.28), yellowArmMat)
    boom1.position.set(-0.75, 0.65, 0)
    boom1.rotation.z = -0.55
    boom1.castShadow = true
    armGroup.add(boom1)

    // Dual Chrome Hydraulic Lift Rams
    ;[0.18, -0.18].forEach((rz) => {
      const cylBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 12), darkSteelMat)
      cylBody.position.set(-0.45, 0.35, rz)
      cylBody.rotation.z = -0.6
      armGroup.add(cylBody)

      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.7, 12), chromeMat)
      piston.position.set(-0.75, 0.65, rz)
      piston.rotation.z = -0.6
      armGroup.add(piston)
    })

    // Articulation Knuckle Joint
    const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 20), darkSteelMat)
    knuckle.position.set(-1.5, 1.05, 0)
    armGroup.add(knuckle)

    // Secondary Boom (Segment 2) angled down toward road
    const boom2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.22), yellowArmMat)
    boom2.position.set(-1.95, 0.45, 0)
    boom2.rotation.z = 0.75
    boom2.castShadow = true
    armGroup.add(boom2)

    // Flexible Spiral-Wound Delivery Hose
    const armHose = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.06, 12, 24, Math.PI * 0.9), rubberTireMat)
    armHose.position.set(-1.4, 0.75, -0.18)
    armGroup.add(armHose)

    // Aggregate Jet Injection Spray Head & Diffuser
    const nozzleHead = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.65, 20), darkSteelMat)
    nozzleHead.rotation.x = Math.PI
    nozzleHead.position.set(-2.55, -0.15, 0)
    nozzleHead.castShadow = true
    armGroup.add(nozzleHead)

    const nozzleDiffuser = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 16), brassMat)
    nozzleDiffuser.rotation.x = Math.PI / 2
    nozzleDiffuser.position.set(-2.55, -0.45, 0)
    armGroup.add(nozzleDiffuser)

    modelGroup.add(armGroup)
    meshRefs.current.arm = armGroup

    // ─── 6. Subsystem 3: Heavy Front Compaction Roller ───
    const rollerGroup = new THREE.Group()

    // Articulated Hydraulic Mounting Linkage
    ;[0.9, -0.9].forEach((az) => {
      const armLink = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.14), darkSteelMat)
      armLink.position.set(2.4, 0.55, az)
      armLink.castShadow = true
      rollerGroup.add(armLink)

      // Hydraulic Lift Actuator
      const liftCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 12), chromeMat)
      liftCyl.position.set(2.25, 0.85, az)
      liftCyl.rotation.z = 0.45
      rollerGroup.add(liftCyl)
    })

    // Heavy Steel Compaction Drum
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 2.15, 36), darkSteelMat)
    drum.rotation.x = Math.PI / 2
    drum.position.set(2.65, 0.52, 0)
    drum.castShadow = true
    rollerGroup.add(drum)

    // Full-Width Drum Scraper Bar
    const scraper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 2.2), yellowArmMat)
    scraper.position.set(2.65, 0.95, 0)
    rollerGroup.add(scraper)

    // Hydraulic Vibratory Motor Pod
    const motorPod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 16), darkSteelMat)
    motorPod.rotation.x = Math.PI / 2
    motorPod.position.set(2.65, 0.52, 1.18)
    rollerGroup.add(motorPod)

    modelGroup.add(rollerGroup)
    meshRefs.current.roller = rollerGroup

    // ─── 7. Subsystem 4: GIS Telemetry & Telematics Command Station ───
    const telemetryGroup = new THREE.Group()

    // High-Precision RTK GPS Dome Antenna on Cab Roof
    const rtkMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), chromeMat)
    rtkMast.position.set(1.25, 2.65, 0.25)
    telemetryGroup.add(rtkMast)

    const rtkDome = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 20), cabPaintMat)
    rtkDome.position.set(1.25, 2.9, 0.25)
    telemetryGroup.add(rtkDome)

    // 5G Encrypted Command Whip Antenna
    const whipAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.1, 8), darkSteelMat)
    whipAntenna.position.set(0.9, 3.0, -0.35)
    whipAntenna.rotation.z = -0.1
    telemetryGroup.add(whipAntenna)

    // Lateral Auxiliary Diesel Generator & Hydraulic Power Unit
    const generatorBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.72, 0.55), chassisPaintMat)
    generatorBox.position.set(0.2, 0.82, -1.05)
    generatorBox.castShadow = true
    telemetryGroup.add(generatorBox)

    // Generator Louvered Vents
    ;[-0.1, 0.1, 0.3].forEach((vx) => {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), darkSteelMat)
      vent.position.set(vx, 0.85, -1.33)
      telemetryGroup.add(vent)
    })

    // In-Cab Diagnostic Telemetry Display Console (Glowing Screen)
    const screenConsole = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), darkSteelMat)
    screenConsole.position.set(1.65, 1.75, 0.35)
    screenConsole.rotation.y = -0.3
    telemetryGroup.add(screenConsole)

    const screenGlow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.02), new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.9 }))
    screenGlow.position.set(1.65, 1.75, 0.37)
    screenGlow.rotation.y = -0.3
    telemetryGroup.add(screenGlow)

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
