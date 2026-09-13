import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Wrench, ShieldCheck, Cpu, Gauge, Layers, Info } from 'lucide-react'

const MACHINERY_PARTS = [
  {
    id: 'arm',
    name: 'Articulated Hydraulic Jet-Patch Arm',
    kannada: 'ಹೈಡ್ರಾಲಿಕ್ ಆಸ್ಫಾಲ್ಟ್ ಜೆಟ್ ಆರ್ಮ್',
    spec: 'Pressure: 120 PSI · Flow: 85 L/min',
    desc: 'High-velocity aggregate delivery arm clears loose debris with compressed air, sprays hot emulsion tack coat, and compacts stone aggregates into potholes in under 8 minutes.',
  },
  {
    id: 'tank',
    name: 'Insulated Bituminous Emulsion Chamber',
    kannada: 'ಬಿಟುಮೆನ್ ಎಮಲ್ಷನ್ ಟ್ಯಾಂಕ್',
    spec: 'Capacity: 1,500 Liters · Heating: 60°C - 80°C',
    desc: 'Maintains cationic rapid setting (RS-1) bitumen emulsion at optimum thermodynamic flow temperature for rapid pavement curing.',
  },
  {
    id: 'roller',
    name: 'Front Compaction Roller & Axle',
    kannada: 'ಕಂಪ್ಯಾಕ್ಷನ್ ರೋಲರ್',
    spec: 'Vibratory Frequency: 45 Hz · Force: 22 kN',
    desc: 'Ensures flush gradient alignment with surrounding asphalt to eliminate vehicular bump impact and prevent rainwater pooling.',
  },
  {
    id: 'telemetry',
    name: 'GIS Telemetry & Work-Order Computer',
    kannada: 'ಜಿಐಎಸ್ ಟೆಲಿಮೆಟ್ರಿ ಘಟಕ',
    spec: 'GPS Accuracy: ± 0.5m · 5G BBMP Command Link',
    desc: 'Transmits real-time before/after square-meter asphalt volume logs directly to BBMP Central Command Center for RTI compliance audits.',
  },
]

export default function ThreeMachineryViewer() {
  const containerRef = useRef(null)
  const [activePart, setActivePart] = useState(MACHINERY_PARTS[0])
  const [wireframe, setWireframe] = useState(false)
  const [isRotating, setIsRotating] = useState(true)
  const sceneRef = useRef(null)
  const meshRefs = useRef({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 380

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(7, 5, 8)
    camera.lookAt(0, 1.2, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lighting (Crisp Studio Lighting)
    const ambient = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3)
    keyLight.position.set(10, 15, 10)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.7)
    fillLight.position.set(-10, 8, -8)
    scene.add(fillLight)

    // Platform Base
    const baseGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.4, 32)
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = -0.2
    baseMesh.receiveShadow = true
    scene.add(baseMesh)

    // Machinery Root Group
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    // Materials
    const chassisMat = new THREE.MeshLambertMaterial({ color: 0x047857 }) // BBMP Green
    const cabMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x334155 })
    const yellowArmMat = new THREE.MeshLambertMaterial({ color: 0xd97706 })
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x0a2540 })
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })

    // 1. Chassis
    const chassisGeo = new THREE.BoxGeometry(4.2, 0.9, 2.0)
    const chassis = new THREE.Mesh(chassisGeo, chassisMat)
    chassis.position.set(0, 0.9, 0)
    chassis.castShadow = true
    chassis.receiveShadow = true
    modelGroup.add(chassis)

    // 2. Cab
    const cabGeo = new THREE.BoxGeometry(1.4, 1.2, 1.9)
    const cab = new THREE.Mesh(cabGeo, cabMat)
    cab.position.set(1.2, 1.8, 0)
    cab.castShadow = true
    modelGroup.add(cab)

    // Windshield
    const windowGeo = new THREE.BoxGeometry(0.05, 0.7, 1.7)
    const windshield = new THREE.Mesh(windowGeo, glassMat)
    windshield.position.set(1.92, 1.9, 0)
    modelGroup.add(windshield)

    // 3. Bitumen Emulsion Tank
    const tankGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 20)
    const tank = new THREE.Mesh(tankGeo, metalMat)
    tank.rotation.z = Math.PI / 2
    tank.position.set(-0.7, 1.6, 0)
    tank.castShadow = true
    modelGroup.add(tank)
    meshRefs.current.tank = tank

    // Tank Bands
    const bandGeo = new THREE.TorusGeometry(0.72, 0.04, 8, 24)
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xd97706 })
    const band1 = new THREE.Mesh(bandGeo, bandMat)
    band1.rotation.y = Math.PI / 2
    band1.position.set(-0.3, 1.6, 0)
    modelGroup.add(band1)

    const band2 = new THREE.Mesh(bandGeo, bandMat)
    band2.rotation.y = Math.PI / 2
    band2.position.set(-1.1, 1.6, 0)
    modelGroup.add(band2)

    // 4. Wheels & Compactor
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 16)
    const wheelPositions = [
      [1.1, 0.45, 1.05], [1.1, 0.45, -1.05],
      [-1.1, 0.45, 1.05], [-1.1, 0.45, -1.05]
    ]
    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(wx, wy, wz)
      wheel.castShadow = true
      modelGroup.add(wheel)
    })

    // Heavy Roller Drum at Rear
    const rollerGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.9, 24)
    const roller = new THREE.Mesh(rollerGeo, metalMat)
    roller.rotation.x = Math.PI / 2
    roller.position.set(-2.0, 0.5, 0)
    roller.castShadow = true
    modelGroup.add(roller)
    meshRefs.current.roller = roller

    // 5. Articulated Hydraulic Patch Arm
    const armGroup = new THREE.Group()
    armGroup.position.set(-1.6, 1.5, 0)

    // Arm Segment 1
    const seg1Geo = new THREE.BoxGeometry(1.6, 0.22, 0.22)
    const seg1 = new THREE.Mesh(seg1Geo, yellowArmMat)
    seg1.position.set(-0.7, 0.5, 0)
    seg1.rotation.z = -0.6
    seg1.castShadow = true
    armGroup.add(seg1)

    // Arm Joint
    const jointGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12)
    const joint = new THREE.Mesh(jointGeo, metalMat)
    joint.position.set(-1.4, 0.9, 0)
    armGroup.add(joint)

    // Arm Segment 2 (Pointing downwards)
    const seg2Geo = new THREE.BoxGeometry(1.4, 0.18, 0.18)
    const seg2 = new THREE.Mesh(seg2Geo, yellowArmMat)
    seg2.position.set(-1.8, 0.3, 0)
    seg2.rotation.z = 0.8
    seg2.castShadow = true
    armGroup.add(seg2)

    // Jet Nozzle Dispenser
    const nozzleGeo = new THREE.ConeGeometry(0.25, 0.5, 12)
    const nozzleMat = new THREE.MeshLambertMaterial({ color: 0x0f172a })
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
    nozzle.rotation.x = Math.PI
    nozzle.position.set(-2.3, -0.3, 0)
    nozzle.castShadow = true
    armGroup.add(nozzle)

    modelGroup.add(armGroup)
    meshRefs.current.arm = armGroup

    // 6. GIS Telemetry Mast & Sensor Beacon
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8)
    const mast = new THREE.Mesh(mastGeo, metalMat)
    mast.position.set(0.7, 2.7, 0.5)
    modelGroup.add(mast)

    const beaconGeo = new THREE.SphereGeometry(0.16, 12, 12)
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xd97706 })
    const beacon = new THREE.Mesh(beaconGeo, beaconMat)
    beacon.position.set(0.7, 3.2, 0.5)
    modelGroup.add(beacon)
    meshRefs.current.telemetry = beacon

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
        modelGroup.rotation.y += 0.007
      }
      camera.lookAt(0, 1.2, 0)
      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight || 380
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
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              Interactive 3D Municipal Machinery Diagnostic
            </span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            BBMP Rapid Road Surface Patcher &bull; Technical Model
          </h3>
          <p className="font-kannada text-xs font-semibold text-slate-600">
            ತ್ವರಿತ ರಸ್ತೆ ಗುಂಡಿ ದುರಸ್ತಿ ವಾಹನ - ತಾಂತ್ರಿಕ ವಿವರಣೆ
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
      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        {/* WebGL Viewport */}
        <div className="relative h-[340px] sm:h-[400px] bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-600 shadow-sm flex items-center gap-1.5">
            <RotateCw size={12} className="text-slate-400" /> Click &amp; drag mouse to inspect 360°
          </div>
        </div>

        {/* Engineering Part Breakdown */}
        <div className="p-5 flex flex-col justify-between bg-white">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-govblue tracking-wider block mb-2">
              Subsystem Diagnostic Selector
            </span>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {MACHINERY_PARTS.map((part) => (
                <button
                  key={part.id}
                  onClick={() => setActivePart(part)}
                  className={`p-2.5 text-left rounded-lg border text-xs transition ${
                    activePart.id === part.id
                      ? 'border-civic bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-display font-bold block truncate">{part.name.split(' ')[0]} {part.name.split(' ')[1]}</span>
                  <span className={`text-[10px] font-mono mt-0.5 block truncate ${activePart.id === part.id ? 'text-amber-400' : 'text-slate-500'}`}>
                    {part.id.toUpperCase()} UNIT
                  </span>
                </button>
              ))}
            </div>

            {/* Active Part Details */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display font-bold text-sm text-slate-900">{activePart.name}</h4>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                  BBMP Certified
                </span>
              </div>
              <p className="font-kannada text-xs font-semibold text-amber-700 mt-0.5">{activePart.kannada}</p>

              <div className="mt-2.5 py-1.5 px-2 bg-white rounded border border-slate-200 font-mono text-xs text-slate-800 font-bold">
                {activePart.spec}
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{activePart.desc}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>BBMP FLEET ID: KA-01-GA-3456</span>
            <span className="text-emerald-700 font-bold">STATUS: FIELD OPERATIONAL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
