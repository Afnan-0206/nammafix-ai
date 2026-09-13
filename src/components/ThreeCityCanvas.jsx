import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { MapPin, Navigation, ShieldCheck } from 'lucide-react'

export default function ThreeCityCanvas({ onSelectWard, activeWard = 'Whitefield' }) {
  const containerRef = useRef(null)
  const [hoveredInfo, setHoveredInfo] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight || 420

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1f5f9) // Crisp slate-100 daylight sky

    // Camera - Isometric angle
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

    // Lighting (Daytime architectural sunlight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2)
    dirLight.position.set(40, 60, 30)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.camera.near = 10
    dirLight.shadow.camera.far = 150
    dirLight.shadow.camera.left = -35
    dirLight.shadow.camera.right = 35
    dirLight.shadow.camera.top = 35
    dirLight.shadow.camera.bottom = -35
    scene.add(dirLight)

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(60, 60)
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Road Grid Grid
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x334155 })
    const greenMat = new THREE.MeshLambertMaterial({ color: 0x10b981 }) // Bengaluru Garden City parks

    // Roads
    const mainRoadGeo = new THREE.PlaneGeometry(60, 3)
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat)
    mainRoad.rotation.x = -Math.PI / 2
    mainRoad.position.y = 0.02
    scene.add(mainRoad)

    const crossRoadGeo = new THREE.PlaneGeometry(3, 60)
    const crossRoad = new THREE.Mesh(crossRoadGeo, roadMat)
    crossRoad.rotation.x = -Math.PI / 2
    crossRoad.position.y = 0.02
    scene.add(crossRoad)

    // Park Area (Cubbon Park representation)
    const parkGeo = new THREE.PlaneGeometry(16, 16)
    const park = new THREE.Mesh(parkGeo, greenMat)
    park.rotation.x = -Math.PI / 2
    park.position.set(-15, 0.03, -15)
    scene.add(park)

    // 3D Buildings Group
    const cityGroup = new THREE.Group()
    scene.add(cityGroup)

    const buildingColors = [0xffffff, 0xf8fafc, 0x0f2c59, 0x1e3a8a, 0xdbeafe]

    // Procedural Buildings
    const buildings = []
    for (let x = -24; x <= 24; x += 6) {
      for (let z = -24; z <= 24; z += 6) {
        // Skip roads and park center
        if (Math.abs(x) < 3 || Math.abs(z) < 3) continue
        if (x < -6 && z < -6) continue

        const h = 3 + Math.random() * 12
        const bGeo = new THREE.BoxGeometry(4.2, h, 4.2)
        const bMat = new THREE.MeshLambertMaterial({
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        })
        const bMesh = new THREE.Mesh(bGeo, bMat)
        bMesh.position.set(x, h / 2, z)
        bMesh.castShadow = true
        bMesh.receiveShadow = true
        cityGroup.add(bMesh)
        buildings.push(bMesh)
      }
    }

    // Central Iconic Building (Vidhana Soudha dome homage)
    const centralGeo = new THREE.BoxGeometry(8, 6, 8)
    const centralMat = new THREE.MeshLambertMaterial({ color: 0x0a2540 }) // Deep Gov Navy
    const centralBuilding = new THREE.Mesh(centralGeo, centralMat)
    centralBuilding.position.set(-15, 3, -15)
    centralBuilding.castShadow = true
    centralBuilding.receiveShadow = true
    cityGroup.add(centralBuilding)

    const domeGeo = new THREE.CylinderGeometry(0, 3.5, 4, 16)
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xd97706 }) // Karnataka Amber
    const dome = new THREE.Mesh(domeGeo, domeMat)
    dome.position.set(-15, 8, -15)
    dome.castShadow = true
    cityGroup.add(dome)

    // 3D Hazard Pins
    const pinData = [
      { name: 'Whitefield', category: 'Road Hazard · Pothole', urgency: '88/100', x: 12, z: 12, color: 0xdc2626 },
      { name: 'Bellandur', category: 'Drainage Overflow', urgency: '74/100', x: 15, z: -8, color: 0xd97706 },
      { name: 'Indiranagar', category: 'Resurfacing Complete', urgency: 'Resolved', x: -8, z: 14, color: 0x047857 },
      { name: 'HSR Layout', category: 'Streetlight Inoperable', urgency: '62/100', x: 6, z: -18, color: 0xd97706 },
      { name: 'Varthur', category: 'Culvert Repair Work', urgency: 'Active', x: -18, z: 8, color: 0x1d4ed8 },
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
      const sphereGeo = new THREE.SphereGeometry(1.1, 16, 16)
      const sphereMat = new THREE.MeshLambertMaterial({ color: item.color })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.y = 5.2
      sphere.castShadow = true
      pinGroup.add(sphere)

      // Ground Target Ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24)
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

    // Mouse Interaction for 3D Camera Tilt
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

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
          if (onSelectWard) onSelectWard(root.userData.name)
        }
      }
    }

    container.addEventListener('click', onClick)

    // Animation Loop
    let animId
    let clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Smooth camera damping
      targetX += (mouseX * 12 - targetX) * 0.05
      targetY += (mouseY * 8 - targetY) * 0.05

      camera.position.x = 42 + targetX
      camera.position.y = 38 + targetY
      camera.lookAt(0, 0, 0)

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
      const h = container.clientHeight || 420
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

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Official Government 3D Overlay Header */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 border border-slate-300 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-800 tracking-wide uppercase">
            BBMP 3D Ward Topography · Live Telemetry
          </span>
        </div>
        <p className="font-sans text-[11px] text-slate-500 mt-0.5">
          Interactive 3D WebGL municipal matrix. Move cursor to rotate angle. Click pins to inspect ward docket.
        </p>
      </div>

      {/* Active Pin Brief Card */}
      {hoveredInfo && (
        <div className="absolute bottom-4 left-4 z-10 bg-white border-2 border-govblue/30 rounded-xl p-3.5 shadow-lg max-w-xs animate-pageIn">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <MapPin size={15} className="text-govblue" /> {hoveredInfo.name} Ward
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              hoveredInfo.urgency === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {hoveredInfo.urgency}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{hoveredInfo.category}</p>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500">
            <span>BBMP SLA: Active</span>
            <button
              onClick={() => onSelectWard && onSelectWard(hoveredInfo.name)}
              className="text-govblue font-bold hover:underline"
            >
              Filter Ward &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Bottom Right Controls Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 border border-slate-300 rounded-lg p-2.5 shadow-sm text-[11px] font-mono space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          <span className="text-slate-700">Road Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-slate-700">Drainage/Sanitation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span className="text-slate-700">Inspected / Resolved</span>
        </div>
      </div>
    </div>
  )
}
