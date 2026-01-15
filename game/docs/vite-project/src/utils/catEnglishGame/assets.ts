export type VocabItem = {
  id: 'paper_towel' | 'carrot' | 'mickey_mouse'
  zh: string
  en: string
  imgSrc: string
  zhAudioSrc: string
  enAudioSrc: string
}

export type LoadedAssets = {
  images: Record<string, HTMLImageElement>
  audios: Record<string, HTMLAudioElement>
}

export const vocabItems: VocabItem[] = [
  {
    id: 'paper_towel',
    zh: '纸巾',
    en: 'paper towel',
    imgSrc: '/imgs/paper towel.png',
    zhAudioSrc: '/imgs/zh_paper towel.mp3',
    enAudioSrc: '/imgs/en_paper towel.mp3',
  },
  {
    id: 'carrot',
    zh: '萝卜',
    en: 'carrot',
    imgSrc: '/imgs/carrot.png',
    zhAudioSrc: '/imgs/zh_carrot.mp3',
    enAudioSrc: '/imgs/en_carrot.mp3',
  },
  {
    id: 'mickey_mouse',
    zh: '米老鼠',
    en: 'Mickey Mouse',
    imgSrc: '/imgs/Mickey Mouse.png',
    zhAudioSrc: '/imgs/zh_Mickey Mouse.mp3',
    enAudioSrc: '/imgs/en_Mickey Mouse.mp3',
  },
]

function assetUrl(path: string) {
  return encodeURI(path)
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`load image failed: ${src}`))
    img.src = assetUrl(src)
  })
}

function createAudio(src: string) {
  const a = new Audio(assetUrl(src))
  a.preload = 'auto'
  return a
}

export async function playAudio(a: HTMLAudioElement) {
  a.pause()
  a.currentTime = 0
  try {
    await a.play()
  } catch {
  }
}

export function pickNextQuestionIndex(prev: number, len: number) {
  if (len <= 1) return 0
  if (prev < 0) return Math.floor(Math.random() * len)
  let next = prev
  while (next === prev) next = Math.floor(Math.random() * len)
  return next
}

export async function loadGameAssets(): Promise<LoadedAssets> {
  const images: Record<string, HTMLImageElement> = {}

  const imageEntries: Array<[string, string]> = [
    ['bg', '/imgs/background.png'],
    ['cat_prepare', '/imgs/cat_prepare.png'],
    ['cat_left', '/imgs/cat_left.png'],
    ['cat_center', '/imgs/cat_center.png'],
    ['cat_right', '/imgs/cat_right_2.png'],
    ['cat_success', '/imgs/success.png'],
    ['item_0', vocabItems[0].imgSrc],
    ['item_1', vocabItems[1].imgSrc],
    ['item_2', vocabItems[2].imgSrc],
  ]

  const loadedImages = await Promise.all(imageEntries.map(([, src]) => loadImage(src)))
  for (let i = 0; i < imageEntries.length; i++) {
    images[imageEntries[i][0]] = loadedImages[i]
  }

  const audios: Record<string, HTMLAudioElement> = {
    en_0: createAudio(vocabItems[0].enAudioSrc),
    en_1: createAudio(vocabItems[1].enAudioSrc),
    en_2: createAudio(vocabItems[2].enAudioSrc),
  }

  return { images, audios }
}
