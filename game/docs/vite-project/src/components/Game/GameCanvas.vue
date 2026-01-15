<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  loadGameAssets,
  pickNextQuestionIndex,
  playAudio,
  vocabItems,
} from '@/utils/catEnglishGame/assets'
import type { LoadedAssets } from '@/utils/catEnglishGame/assets'
import { createGameRenderer } from '@/utils/catEnglishGame/renderer'
import type { CatPose, LastChoice } from '@/utils/catEnglishGame/renderer'

const shellRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const phase = ref<'loading' | 'ready'>('loading')
const errorText = ref('')
const startedByUser = ref(false)

const questionIndex = ref(0)
const catPose = ref<CatPose>('prepare')
const lastChoice = ref<LastChoice | null>(null)

let assets: LoadedAssets | null = null
let renderer: ReturnType<typeof createGameRenderer> | null = null
let resizeObserver: ResizeObserver | null = null
let pendingTimeouts: number[] = []

function clearTimeouts() {
  for (const t of pendingTimeouts) window.clearTimeout(t)
  pendingTimeouts = []
}

function getState() {
  return {
    catPose: catPose.value,
    questionIndex: questionIndex.value,
    lastChoice: lastChoice.value,
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const shell = shellRef.value
  if (!canvas || !shell) return
  const rect = shell.getBoundingClientRect()
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))

  canvas.width = Math.max(1, Math.floor(rect.width * dpr))
  canvas.height = Math.max(1, Math.floor(rect.height * dpr))
  canvas.style.width = `${Math.max(1, rect.width)}px`
  canvas.style.height = `${Math.max(1, rect.height)}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  renderer?.render(getState())
}

function nextQuestion(playEn: boolean) {
  questionIndex.value = pickNextQuestionIndex(questionIndex.value, vocabItems.length)
  lastChoice.value = null
  renderer?.render(getState())
  if (playEn && startedByUser.value && assets) void playAudio(assets.audios[`en_${questionIndex.value}`])
}

function startGame() {
  if (phase.value !== 'ready') return
  if (!startedByUser.value) startedByUser.value = true
  catPose.value = 'prepare'
  questionIndex.value = pickNextQuestionIndex(-1, vocabItems.length)
  lastChoice.value = null
  renderer?.render(getState())
  if (assets) void playAudio(assets.audios[`en_${questionIndex.value}`])
}

function handlePointerDown(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas || !renderer) return
  e.preventDefault()

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const z = renderer.hitTest(x, y)

  if (!z) {
    if (!startedByUser.value) startGame()
    return
  }

  if (!startedByUser.value) {
    startGame()
    if (z.kind === 'repeat' && assets) void playAudio(assets.audios[`en_${questionIndex.value}`])
    return
  }

  if (z.kind === 'repeat') {
    if (startedByUser.value && assets) void playAudio(assets.audios[`en_${questionIndex.value}`])
    return
  }

  const pose: CatPose = z.index === 0 ? 'left' : z.index === 1 ? 'center' : 'right'
  catPose.value = pose

  const correct = z.index === questionIndex.value
  lastChoice.value = {
    index: z.index,
    result: correct ? 'correct' : 'wrong',
    untilMs: Date.now() + 700,
  }
  renderer.render(getState())

  clearTimeouts()
  if (correct) {
    catPose.value = 'success'
    renderer.render(getState())
    pendingTimeouts.push(
      window.setTimeout(() => {
        catPose.value = 'prepare'
        nextQuestion(true)
      }, 850),
    )
    return
  }

  pendingTimeouts.push(
    window.setTimeout(() => {
      catPose.value = 'prepare'
      renderer?.render(getState())
    }, 550),
  )
  if (assets) void playAudio(assets.audios[`en_${questionIndex.value}`])
}

onMounted(async () => {
  try {
    assets = await loadGameAssets()
    const canvas = canvasRef.value
    if (!canvas) throw new Error('canvas not found')
    renderer = createGameRenderer(canvas, assets)

    resizeObserver = new ResizeObserver(() => resizeCanvas())
    if (shellRef.value) resizeObserver.observe(shellRef.value)
    window.addEventListener('orientationchange', resizeCanvas)
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false })

    phase.value = 'ready'
    resizeCanvas()
  } catch (err) {
    errorText.value = err instanceof Error ? err.message : String(err)
    phase.value = 'ready'
  }
})

onBeforeUnmount(() => {
  clearTimeouts()
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('orientationchange', resizeCanvas)
  window.removeEventListener('resize', resizeCanvas)
  canvasRef.value?.removeEventListener('pointerdown', handlePointerDown)
})
</script>

<template>
  <div ref="shellRef" class="game-shell">
    <canvas ref="canvasRef" class="game-canvas" />

    <div v-if="phase === 'loading'" class="overlay">
      <div class="overlay-card">加载中…</div>
    </div>

    <div v-else-if="errorText" class="overlay">
      <div class="overlay-card overlay-error">
        <div class="overlay-title">资源加载失败</div>
        <div class="overlay-body">{{ errorText }}</div>
      </div>
    </div>

    <div v-else-if="!startedByUser" class="overlay" @click="startGame">
      <div class="overlay-card">
        <div class="overlay-title">点击开始</div>
        <div class="overlay-body">开始后会播放英文读音</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-shell {
  width: min(100vw, 420px);
  aspect-ratio: 9 / 16;
  max-height: 100vh;
  margin: 0 auto;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: manipulation;
  user-select: none;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.overlay-card {
  width: min(86%, 320px);
  border-radius: 14px;
  padding: 14px 14px;
  background: rgba(255, 255, 255, 0.96);
  color: rgba(0, 0, 0, 0.86);
  text-align: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.overlay-error {
  text-align: left;
}

.overlay-title {
  font-weight: 700;
  font-size: 16px;
}

.overlay-body {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.35;
  word-break: break-word;
}
</style>
