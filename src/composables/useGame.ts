// Core game logic and state
// - Deals a deck based on difficulty and source
// - Handles preview (show-all) with live countdown
// - Click matching logic and scoring

import { ref, computed, onBeforeUnmount } from 'vue'
import { DIFFICULTIES, PREVIEW_MS } from './constants'
import { shuffle } from './utils'
import { getImages } from './imageService'
import { useSettings } from './useSettings'
import { useScores } from './useScores'
import type { Card, Difficulty, Settings } from './types'

export function useGame(){
  // Settings + scores are separate composables for clarity
  const { settings } = useSettings()
  const { scores, addScore } = useScores()

  // Game state
  const deck = ref<Card[]>([])
  const score = ref(0)
  const busy = ref(false) // blocks input; also true during preview
  const picked = ref<number[]>([])
  const firstPickAt = ref<number|null>(null)
  const gameOver = ref(false)
  const showStart = ref(true) // first visit start screen

  // Derived meta
  const meta = computed(() => DIFFICULTIES[settings.difficulty])
  const remaining = computed(() => deck.value.filter(c => !c.matched).length)
  const previewMs = computed(() => PREVIEW_MS[settings.difficulty])

  // Preview countdown state
  const previewing = ref(false)
  const previewLeftMs = ref(0)
  let previewTick: any = null
  let previewTimeout: any = null
  function clearPreviewTimers(){
    if (previewTick){ clearInterval(previewTick); previewTick = null }
    if (previewTimeout){ clearTimeout(previewTimeout); previewTimeout = null }
  }

  // Start a new round, with preview
  async function startNewGame(){
    busy.value = true
    gameOver.value = false
    score.value = 0
    picked.value = []
    firstPickAt.value = null

    const { unique, match } = meta.value
    const images = await getImages(settings, unique)

    let cards: Card[] = []
    let idCounter = 1
    for (const img of images){
      for (let k=0;k<match;k++){
        cards.push({ id: idCounter++, imageId: img.id, imageUrl: img.url, flipped:false, matched:false })
      }
    }
    deck.value = shuffle(cards)

    // Reveal preview with live countdown
    deck.value.forEach(c => c.flipped = true)
    showStart.value = false
    previewing.value = true
    clearPreviewTimers()
    const endAt = Date.now() + previewMs.value
    previewLeftMs.value = previewMs.value
    previewTick = setInterval(() => {
      previewLeftMs.value = Math.max(0, endAt - Date.now())
    }, 100)
    previewTimeout = setTimeout(() => {
      deck.value.forEach(c => { if (!c.matched) c.flipped = false })
      busy.value = false
      previewing.value = false
      clearPreviewTimers()
    }, previewMs.value)
  }

  // Click handler for a card by index
  function clickCard(index:number){
    if (busy.value) return
    const c = deck.value[index]
    if (!c || c.matched || c.flipped) return

    c.flipped = true
    picked.value.push(index)
    if (picked.value.length === 1){
      firstPickAt.value = Date.now()
    }

    const groupSize = meta.value.match
    if (picked.value.length === groupSize){
      busy.value = true
      const chosen = picked.value.map(i => deck.value[i])
      const allSame = chosen.every(x => x.imageId === chosen[0].imageId)
      const resolve = () => {
        picked.value = []
        firstPickAt.value = null
        busy.value = false
        if (deck.value.every(x => x.matched)){
          gameOver.value = true
          const payload = { id: `${Date.now()}` , date: new Date().toISOString(), difficulty: settings.difficulty, score: score.value, totalCards: deck.value.length, matchSize: meta.value.match, source: settings.source }
          addScore(payload)
        }
      }

      if (allSame){
        const now = Date.now()
        const delta = firstPickAt.value ? now - firstPickAt.value : 0
        const bonus = Math.max(0, 1000 - delta)
        score.value += 100 + bonus
        chosen.forEach(c => c.matched = true)
        setTimeout(resolve, 250)
      } else {
        // Wrong set → flip back
        setTimeout(() => {
          picked.value.forEach(i => deck.value[i].flipped = false)
          resolve()
        }, 700)
      }
    }
  }

  function restart(){ startNewGame() }

  function applySettings(s: Settings){
    settings.difficulty = s.difficulty
    settings.source = s.source
    settings.giphyApiKey = s.giphyApiKey
    settings.giphyQuery = s.giphyQuery
    // Start a new game to reflect settings immediately
    startNewGame()
  }

  onBeforeUnmount(() => clearPreviewTimers())

  return {
    // state
    settings,
    scores,
    deck, score, busy, gameOver, showStart,
    previewing, previewLeftMs,
    // derived
    meta, previewMs, remaining,
    // actions
    startNewGame, clickCard, restart, applySettings,
  }
}

