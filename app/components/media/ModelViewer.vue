<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps<{
  src: string
  name?: string
}>()

const container = ref<HTMLElement | null>(null)
const loading = ref(true)
const progress = ref(0)
const error = ref('')
const autoRotate = ref(true)
const visible = ref(true)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let model: THREE.Object3D | null = null
let frame: number | null = null
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
let disposed = false

function setSize() {
  const el = container.value
  if (!el || !renderer || !camera) return
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h) return
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function start() {
  if (frame !== null || disposed) return
  const loop = () => {
    frame = requestAnimationFrame(loop)
    if (!renderer || !scene || !camera) return
    controls?.update()
    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(loop)
}

function stop() {
  if (frame !== null) { cancelAnimationFrame(frame); frame = null }
}

function fitToModel() {
  if (!model || !camera || !controls || !scene) return
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const fov = (camera.fov * Math.PI) / 180
  const dist = maxDim / (2 * Math.tan(fov / 2))
  camera.position.set(maxDim * 0.35, maxDim * 0.45, dist * 1.7)
  camera.near = Math.max(maxDim / 1000, 0.01)
  camera.far = maxDim * 200
  camera.updateProjectionMatrix()
  controls.target.set(0, 0, 0)
  controls.update()

  const grid = scene.getObjectByName('grid')
  if (grid) grid.scale.setScalar(Math.max(maxDim / 5, 0.5))
}

function resetView() {
  fitToModel()
}

function toggleRotate() {
  autoRotate.value = !autoRotate.value
  if (controls) controls.autoRotate = autoRotate.value
}

async function toggleFullscreen() {
  const el = container.value?.parentElement
  if (!el) return
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
  else await el.requestFullscreen().catch(() => {})
}

function load() {
  if (!props.src || !scene) return
  loading.value = true
  error.value = ''
  progress.value = 0

  if (model) {
    scene.remove(model)
    model.traverse((o: any) => {
      o.geometry?.dispose?.()
      const mat = o.material
      if (Array.isArray(mat)) mat.forEach(m => m.dispose?.())
      else mat?.dispose?.()
    })
    model = null
  }

  const loader = new GLTFLoader()
  loader.load(
    props.src,
    (gltf) => {
      if (disposed || !scene) return
      model = gltf.scene
      scene.add(model)
      fitToModel()
      loading.value = false
    },
    (event) => {
      if (event.total) progress.value = Math.round((event.loaded / event.total) * 100)
    },
    () => {
      loading.value = false
      error.value = 'モデルを読み込めませんでした（.glb / .gltf に対応）'
    },
  )
}

function init() {
  const el = container.value
  if (!el) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0b0f19')

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
  camera.position.set(0, 2, 6)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 1.4

  scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.6))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(5, 8, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x818cf8, 1.6)
  rim.position.set(-6, 3, -6)
  scene.add(rim)

  const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b)
  grid.name = 'grid'
  grid.position.y = -0.001
  scene.add(grid)

  setSize()
  load()
  start()

  ro = new ResizeObserver(setSize)
  ro.observe(el)

  io = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting
    if (visible.value && !document.hidden) start()
    else stop()
  }, { threshold: 0.05 })
  io.observe(el)

  document.addEventListener('visibilitychange', onVisibility)
}

function onVisibility() {
  if (document.hidden) stop()
  else if (visible.value) start()
}

onMounted(init)

onUnmounted(() => {
  disposed = true
  stop()
  ro?.disconnect()
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  controls?.dispose()
  if (model) {
    model.traverse((o: any) => {
      o.geometry?.dispose?.()
      const mat = o.material
      if (Array.isArray(mat)) mat.forEach(m => m.dispose?.())
      else mat?.dispose?.()
    })
  }
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  scene = null
  camera = null
  controls = null
})

watch(() => props.src, () => { if (scene) load() })
</script>

<template>
  <div class="relative rounded-xl overflow-hidden bg-[#0b0f19] border border-slate-800">
    <div
      ref="container"
      class="w-full h-[52vh] min-h-[280px] touch-none"
    />

    <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0f19]/80">
      <Icon name="lucide:loader-2" class="w-7 h-7 text-indigo-400 animate-spin" />
      <div class="w-40 h-1 rounded-full bg-slate-800 overflow-hidden">
        <div class="h-full bg-indigo-500 transition-all" :style="{ width: progress + '%' }" />
      </div>
      <p class="text-[11px] text-slate-500">{{ progress ? progress + '%' : '3Dモデルを読み込み中...' }}</p>
    </div>

    <div v-if="error" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b0f19]/90 p-6 text-center">
      <Icon name="lucide:box" class="w-8 h-8 text-slate-600" />
      <p class="text-xs text-slate-400">{{ error }}</p>
    </div>

    <div class="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-1.5 py-1">
      <button @click="toggleRotate" class="p-1.5 rounded-full transition" :class="autoRotate ? 'text-indigo-400 bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'" title="自動回転">
        <Icon name="lucide:rotate-3d" class="w-4 h-4" />
      </button>
      <button @click="resetView" class="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition" title="視点をリセット">
        <Icon name="lucide:focus" class="w-4 h-4" />
      </button>
      <button @click="toggleFullscreen" class="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition" title="全画面">
        <Icon name="lucide:maximize" class="w-4 h-4" />
      </button>
    </div>

    <div v-if="name" class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] text-white/70 truncate max-w-[70%]">
      {{ name }}
    </div>
  </div>
</template>
