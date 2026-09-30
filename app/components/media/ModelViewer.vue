<script setup lang="ts">
/**
 * 3D ビュワーの背景色は CSS 側のトークンから読む。
 *  値は "R G B" 形式なので THREE.Color へ渡す前に #rrggbb へ戻す。
 */
function themeSurfaceColor(): string {
  if (typeof window === 'undefined') return '#0b0f19'
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--t-slate-900')
    .trim()
  const [r, g, b] = raw.split(/\s+/).map(Number)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#0b0f19'
  return `rgb(${r}, ${g}, ${b})`
}
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
let pendingFit = false

/**
 * 描画バッファを CSS ボックスの物理ピクセルと一致させる。
 *  Returns true when the size was actually applied — a hidden tab gives 0x0,
 *  and in that case the fit is postponed until the ResizeObserver sees a real box.
 *  updateStyle = false keeps the canvas CSS at 100%/100%, so the buffer aspect
 *  and the rendered box always agree and the image is never stretched.
 */
function setSize() {
  const el = container.value
  if (!el || !renderer || !camera) return false
  const w = el.clientWidth
  const h = el.clientHeight
  if (!w || !h) return false
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  if (pendingFit && model) {
    pendingFit = false
    fitToModel()
  }
  return true
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

/**
 * モデルを「縦横どちらの画角にも必ず収まる」位置へカメラを置く。
 *
 *   PerspectiveCamera の fov は縦画角、aspect は横縦比だけなので、
 *  横長・縦長いずれのコンテナでも収まるようにする。
 *    横画角 = 2 * atan(tan(縦画角 / 2) * aspect)
 *    距離   = 半径 / sin(画角 / 2)  … 縦と横のうち大きい方を採用
 *
 *  境界ボックス中心を原点に移してから bounding sphere(外接球)で判定するので、
 *  どの角度から見ても切れない。distance に 1.12 倍を掛けて余白を作る。
 */
function fitToModel() {
  if (!model || !camera || !controls || !scene) return
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const radius = 0.5 * Math.hypot(size.x, size.y, size.z) || maxDim / 2
  const aspect = camera.aspect > 0 && isFinite(camera.aspect) ? camera.aspect : 1
  const vFov = (camera.fov * Math.PI) / 180
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
  const dist = Math.max(radius / Math.sin(vFov / 2), radius / Math.sin(hFov / 2)) * 1.12
  camera.position.copy(new THREE.Vector3(0.35, 0.45, 1).normalize().multiplyScalar(dist))
  camera.near = Math.max(maxDim / 1000, 0.01)
  camera.far = dist + maxDim * 20
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
      pendingFit = !setSize()
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
  scene.background = new THREE.Color(themeSurfaceColor())

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
  <div class="relative rounded-xl overflow-hidden bg-surface border border-outline-variant">
    <div
      ref="container"
      class="mv-stage touch-none"
    />

    <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/80">
      <Icon name="lucide:loader-2" class="w-7 h-7 text-indigo-400 animate-spin" />
      <div class="w-40 h-1 rounded-full bg-surface-container overflow-hidden">
        <div class="h-full bg-indigo-500 transition-all" :style="{ width: progress + '%' }" />
      </div>
      <p class="text-[11px] text-on-surface-variant">{{ progress ? progress + '%' : '3Dモデルを読み込み中...' }}</p>
    </div>

    <div v-if="error" class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/90 p-6 text-center">
      <Icon name="lucide:box" class="w-8 h-8 text-slate-600" />
      <p class="text-xs text-on-surface-variant">{{ error }}</p>
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

<style scoped>
/* 高さ固定 (h-[52vh]) だとレイアウトと喧嘩するので、比率で枠を決める。
   max-height は 16/9 より広いウィンドウで縦に伸びすぎるのを防ぐ役。 */
.mv-stage {
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 62vh;
  min-height: 200px;
}
@media (min-width: 768px) {
  .mv-stage {
    aspect-ratio: 16 / 10;
    max-height: 64vh;
  }
}
</style>
