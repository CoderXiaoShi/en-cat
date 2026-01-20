import type { LoadedAssets } from './assets'
import { vocabItems } from './assets'

export type CatPose = 'prepare' | 'left' | 'center' | 'right' | 'success'

export type LastChoice = {
  index: number
  result: 'correct' | 'wrong'
  untilMs: number
}

export type GameRenderState = {
  catPose: CatPose
  questionIndex: number
  lastChoice: LastChoice | null
  mode?: 'practice' | 'dictation'
}

export type HitZone =
  | { kind: 'item'; index: number; x: number; y: number; w: number; h: number }
  | { kind: 'repeat'; x: number; y: number; w: number; h: number }

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function drawTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
) {
  const measured = ctx.measureText(text)
  if (measured.width <= maxW) {
    ctx.fillText(text, x, y)
    return
  }
  const ellipsis = '…'
  let t = text
  while (t.length > 0 && ctx.measureText(t + ellipsis).width > maxW) t = t.slice(0, -1)
  ctx.fillText(t + ellipsis, x, y)
}

export function createGameRenderer(canvas: HTMLCanvasElement, assets: LoadedAssets) {
  let hitZones: HitZone[] = []

  function render(state: GameRenderState) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const now = Date.now()

    hitZones = []
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(assets.images.bg, 0, 0, w, h)

    const itemAreaTop = h * 0.72
    const itemAreaH = h - itemAreaTop
    const gap = w * 0.04
    const colW = (w - gap * 4) / 3
    const cardW = colW
    const cardH = Math.min(itemAreaH * 0.9, colW * 1.2)
    const cardY = itemAreaTop + (itemAreaH - cardH) / 2

    for (let i = 0; i < 3; i++) {
      const cardX = gap + i * (colW + gap)
      const pad = cardW * 0.08
      const imgBox = {
        x: cardX + pad,
        y: cardY + pad,
        w: cardW - pad * 2,
        h: cardH - pad * 3 - 18,
      }
      const labelY = imgBox.y + imgBox.h + pad * 0.9

      roundRectPath(ctx, cardX, cardY, cardW, cardH, 14)
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.fill()

      const lc = state.lastChoice
      if (lc && lc.index === i && now < lc.untilMs) {
        ctx.lineWidth = 3
        ctx.strokeStyle =
          lc.result === 'correct' ? 'rgba(22,163,74,0.9)' : 'rgba(220,38,38,0.9)'
        ctx.stroke()
      } else {
        ctx.lineWidth = 2
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'
        ctx.stroke()
      }

      const img = assets.images[`item_${i}`]
      const scale = Math.min(imgBox.w / img.width, imgBox.h / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = imgBox.x + (imgBox.w - dw) / 2
      const dy = imgBox.y + (imgBox.h - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)

      ctx.fillStyle = 'rgba(0,0,0,0.85)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.font = `${Math.max(12, Math.round(h * 0.026))}px system-ui, -apple-system, Segoe UI, Arial`
      ctx.fillText(vocabItems[i].zh, cardX + cardW / 2, labelY)

      hitZones.push({ kind: 'item', index: i, x: cardX, y: cardY, w: cardW, h: cardH })
    }

    const catImgKey: Record<CatPose, string> = {
      prepare: 'cat_prepare',
      left: 'cat_left',
      center: 'cat_center',
      right: 'cat_right',
      success: 'cat_success',
    }

    const catImg = assets.images[catImgKey[state.catPose]]
    const baseCatW = w * 0.62
    const catW = state.catPose === 'prepare' ? baseCatW * 0.8 : baseCatW
    const catScale = catW / catImg.width
    const catH = catImg.height * catScale
    const catX = (w - catW) / 2
    const catY = h * 0.72 - catH * 0.78
    ctx.drawImage(catImg, catX, catY, catW, catH)

    if (state.mode !== 'practice') {
      const q = vocabItems[state.questionIndex]
      const bubbleW = Math.min(w * 0.78, 340)
      const bubbleH = Math.max(44, Math.round(h * 0.09))
      const bubbleX = (w - bubbleW) / 2
      const bubbleY = Math.max(14, catY - bubbleH * 0.72)
      roundRectPath(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 16)
      ctx.fillStyle = 'rgba(255,255,255,0.96)'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(0,0,0,0.10)'
      ctx.stroke()
      ctx.fillStyle = 'rgba(0,0,0,0.88)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.max(14, Math.round(h * 0.032))}px system-ui, -apple-system, Segoe UI, Arial`
      drawTextCentered(ctx, q.en, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2, bubbleW - 22)
    }
  }

  function hitTest(x: number, y: number) {
    for (let i = hitZones.length - 1; i >= 0; i--) {
      const z = hitZones[i]
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z
    }
    return null
  }

  return { render, hitTest }
}
