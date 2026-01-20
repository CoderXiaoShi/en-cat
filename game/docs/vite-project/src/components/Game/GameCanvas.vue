<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, nextTick } from 'vue'
import { loadGameAssets, pickNextQuestionIndex, playAudio, vocabItems, playSuccessSound } from '@/utils/catEnglishGame/assets'
import type { LoadedAssets } from '@/utils/catEnglishGame/assets'
import { createGameRenderer } from '@/utils/catEnglishGame/renderer'
import type { CatPose, LastChoice } from '@/utils/catEnglishGame/renderer'
import EnglishKeyboard from '@/components/Keyboard/EnglishKeyboard.vue'

const shellRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const phase = ref<'loading' | 'ready'>('loading')
const errorText = ref('')
const startedByUser = ref(false)
const mode = ref<'practice' | 'dictation'>('practice')
const showKeyboard = ref(false)
const keyboardWrapRef = ref<HTMLDivElement | null>(null)

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
    mode: mode.value,
  }
}

function playQuestionAudio() {
  if (!assets) return
  const a = assets.audios[`en_${questionIndex.value}`]
  if (!a) return
  if (mode.value === 'practice') {
    catPose.value = questionIndex.value === 0 ? 'left' : questionIndex.value === 1 ? 'center' : 'right'
    renderer?.render(getState())
  }
  void playAudio(a)
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
  if (mode.value === 'practice') {
    practiceInput.value = ''
    showKeyboard.value = false
  }
  if (playEn && startedByUser.value && assets) void playQuestionAudio()
}

function startGame() {
  if (phase.value !== 'ready') return
  if (!startedByUser.value) startedByUser.value = true
  catPose.value = 'prepare'
  questionIndex.value = pickNextQuestionIndex(-1, vocabItems.length)
  lastChoice.value = null
  renderer?.render(getState())
  if (mode.value === 'practice') {
    practiceInput.value = ''
    showKeyboard.value = false
  }
  if (assets) void playQuestionAudio()
}

function handlePointerDown(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas || !renderer) return
  e.preventDefault()

  if (mode.value === 'practice') {
    if (!startedByUser.value) startGame()
    return
  }

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
    if (assets) void playSuccessSound(assets.audios)
    pendingTimeouts.push(
      window.setTimeout(() => {
        if (mode.value !== 'practice') catPose.value = 'prepare'
        nextQuestion(true)
      }, 850),
    )
    return
  }

  pendingTimeouts.push(
    window.setTimeout(() => {
      if (mode.value !== 'practice') catPose.value = 'prepare'
      renderer?.render(getState())
    }, 550),
  )
  if (assets) void playQuestionAudio()
}

const practiceInputEl = ref<HTMLDivElement | null>(null)
const practiceInput = ref('')
function submitPractice() {
  if (!startedByUser.value) return
  const q = vocabItems[questionIndex.value]
  const input = practiceInput.value.trim()
  practiceInput.value = ''
  const target = q.en.trim()
  const correct = input.toLowerCase() === target.toLowerCase()
  lastChoice.value = {
    index: questionIndex.value,
    result: correct ? 'correct' : 'wrong',
    untilMs: Date.now() + 700,
  }
  renderer?.render(getState())
  clearTimeouts()
  if (correct) {
    if (assets) void playSuccessSound(assets.audios)
    pendingTimeouts.push(
      window.setTimeout(() => {
        if (mode.value !== 'practice') catPose.value = 'prepare'
        nextQuestion(true)
      }, 850),
    )
    return
  }
  if (assets) void playQuestionAudio()
}

const practiceBoxStyle = computed(() => {
  const canvas = canvasRef.value
  if (!canvas || !assets) return {}
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  const catImgKey: Record<CatPose, string> = {
    prepare: 'cat_prepare',
    left: 'cat_left',
    center: 'cat_center',
    right: 'cat_right',
    success: 'cat_success',
  }
  const catImg = assets.images[catImgKey[catPose.value]]
  const baseCatW = w * 0.62
  const catW = catPose.value === 'prepare' ? baseCatW * 0.8 : baseCatW
  const catScale = catW / catImg.width
  const catH = catImg.height * catScale
  const catY = h * 0.72 - catH * 0.78
  const bubbleW = Math.min(w * 0.78, 340)
  const bubbleH = Math.max(44, Math.round(h * 0.09))
  const bubbleY = Math.round(h * 0.25)
  return {
    left: '50%',
    transform: 'translateX(-50%)',
    top: `${bubbleY}px`,
    width: `${bubbleW}px`,
  }
})

function onKeyPress(ch: string) {
  practiceInput.value += ch.toLowerCase()
}
function onKeySpace() {
  practiceInput.value += ' '
}
function onKeyDelete() {
  practiceInput.value = practiceInput.value.slice(0, -1)
}

function handleGlobalPointerDown(e: PointerEvent) {
  if (!showKeyboard.value) return
  const target = e.target as Node | null
  const inPractice = practiceInputEl.value?.contains(target as Node) ?? false
  const inKeyboard = keyboardWrapRef.value?.contains(target as Node) ?? false
  if (!inPractice && !inKeyboard) {
    showKeyboard.value = false
  }
}

onMounted(async () => {
  try {
    const v = localStorage.getItem('game.mode')
    if (v === 'practice' || v === 'dictation') mode.value = v
    assets = await loadGameAssets()
    const canvas = canvasRef.value
    if (!canvas) throw new Error('canvas not found')
    renderer = createGameRenderer(canvas, assets)

    resizeObserver = new ResizeObserver(() => resizeCanvas())
    if (shellRef.value) resizeObserver.observe(shellRef.value)
    window.addEventListener('orientationchange', resizeCanvas)
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false })
    document.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true })

    phase.value = 'ready'
    resizeCanvas()
    const r = localStorage.getItem('game.restart')
    if (r === '1') {
      localStorage.removeItem('game.restart')
      startGame()
    }
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
  document.removeEventListener('pointerdown', handleGlobalPointerDown)
})
</script>

<template>
  <div ref="shellRef" class="game-shell">
    <canvas ref="canvasRef" class="game-canvas" />
    <div class="brand">英语咪</div>

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

    <div v-else-if="mode === 'practice'" class="practice-box" :style="practiceBoxStyle">
      <div class="practice-label">
        {{ vocabItems[questionIndex]?.zh }}：<span class="en">{{ vocabItems[questionIndex]?.en }}</span>
      </div>
      <div ref="practiceInputEl" class="practice-input" :class="{ placeholder: !practiceInput }"
        @click="showKeyboard = true">
        {{ practiceInput || '请输入英文' }}
      </div>
    </div>
    <div v-if="mode === 'practice' && showKeyboard" ref="keyboardWrapRef">
      <EnglishKeyboard @press="onKeyPress" @space="onKeySpace" @confirm="submitPractice" @cancel="showKeyboard = false"
        @delete="onKeyDelete" />
    </div>
  </div>
</template>

<style scoped>
.game-shell {
  height: 100vh;
  height: 100dvh;
  aspect-ratio: 9 / 16;
  width: auto;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  border-radius: 0;
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

.brand {
  position: absolute;
  top: 12px;
  right: 0;
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  z-index: 30;
  pointer-events: none;
  width: 100vw;
  text-align: center;
}

.mobile .game-shell,
@media (hover: none) and (pointer: coarse) {
  .game-shell {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    aspect-ratio: auto;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.practice-box {
  position: absolute;
}

.practice-label {
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  color: rgba(0, 0, 0, 0.88);
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 20px;
  line-height: 1.35;
  text-align: center;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}
.practice-label .en {
  font-weight: 700;
}

.practice-input {
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.96);
  color: rgba(0, 0, 0, 0.9);
  font-size: 16px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}

.practice-input.placeholder {
  color: rgba(0, 0, 0, 0.4);
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
