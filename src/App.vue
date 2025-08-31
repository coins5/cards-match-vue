<script setup lang="ts">
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import CardItem from './components/CardItem.vue'
import SettingsModal from './components/SettingsModal.vue'

type Difficulty = 'easy'|'medium'|'hard'|'dark'
type Source = 'emoji'|'giphy'

type Settings = {
  difficulty: Difficulty
  source: Source
  giphyApiKey?: string
  giphyQuery?: string
}

type Card = {
  id: number
  imageId: string
  imageUrl: string
  flipped: boolean
  matched: boolean
}

const DIFFICULTIES: Record<Difficulty, { unique: number, match: number, gridClass: string }>= {
  easy:   { unique: 4,  match: 2, gridClass:'easy' },
  medium: { unique: 8,  match: 2, gridClass:'medium' },
  hard:   { unique: 16, match: 2, gridClass:'hard' },
  dark:   { unique: 32, match: 3, gridClass:'dark' },
}

const DEFAULT_SETTINGS: Settings = {
  difficulty: 'medium',
  source: 'emoji',
  giphyApiKey: '',
  giphyQuery: 'cats'
}

const STORAGE_SETTINGS = 'cm-settings'
const STORAGE_SCORES   = 'cm-scores'

const scores = ref<Array<{ id:string, date:string, difficulty:Difficulty, score:number, totalCards:number, matchSize:number, source:Source }>>(loadScores())

function loadScores(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_SCORES) || '[]') }catch{ return [] }
}
function saveScores(){ localStorage.setItem(STORAGE_SCORES, JSON.stringify(scores.value.slice(0, 20))) }

function loadSettings(): Settings{
  try{ return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || 'null') || {}) } }
  catch{ return { ...DEFAULT_SETTINGS } }
}
function saveSettings(){ localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)) }

const settings = reactive<Settings>(loadSettings())
watch(settings, saveSettings, { deep:true })

const deck = ref<Card[]>([])
const score = ref(0)
const busy = ref(false)
const picked = ref<number[]>([])
const firstPickAt = ref<number|null>(null)
const gameOver = ref(false)
const showStart = ref(true)

const meta = computed(() => DIFFICULTIES[settings.difficulty])
const remaining = computed(() => deck.value.filter(c => !c.matched).length)

// Preview durations per difficulty
const PREVIEW_MS: Record<Difficulty, number> = {
  easy: 2000,
  medium: 4000,
  hard: 8000,
  dark: 16000,
}
const previewMs = computed(() => PREVIEW_MS[settings.difficulty])
const previewing = ref(false)
const previewLeftMs = ref(0)
let previewTick: any = null
let previewTimeout: any = null
function clearPreviewTimers(){
  if (previewTick){ clearInterval(previewTick); previewTick = null }
  if (previewTimeout){ clearTimeout(previewTimeout); previewTimeout = null }
}

// Emoji source — we convert to SVG data URLs for crisp, offline images
const EMOJI = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐤',
  '🦄','🐝','🦋','🐞','🐢','🐙','🦑','🦀','🐬','🐳','🐧','🦉','🐺','🦓','🦒','🐲',
  '🍎','🍊','🍋','🍉','🍇','🍓','🍒','🍍','🥝','🥑','🌶️','🥕','🥦','🍔','🍣','🍕',
  '⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🎮','🎲','🎧','📷','🎹','🎸','🚗','✈️'
]

function emojiToDataUrl(char:string){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>\n`+
    `<rect width='100%' height='100%' rx='24' ry='24' fill='\#141822'/>`+
    `<text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='140'>${char}</text>`+
  `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

async function getImages(count:number): Promise<{ id:string, url:string }[]>{
  if (settings.source === 'emoji'){
    const list = EMOJI.slice(0, Math.max(count, 0))
    return list.slice(0, count).map((ch, i) => ({ id: `emoji-${i}-${ch}`, url: emojiToDataUrl(ch) }))
  }
  // Giphy fetch fallback to emoji if anything fails
  try{
    const apiKey = (settings.giphyApiKey || '').trim()
    const q = encodeURIComponent(settings.giphyQuery || 'cats')
    const limit = Math.min(Math.max(count, 1), 50)
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${q}&limit=${limit}&rating=g`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Giphy request failed')
    const data = await res.json()
    const items = (data.data || []) as any[]
    const unique = items.map((it) => {
      const img = (it.images?.downsized_still?.url) || (it.images?.fixed_width_still?.url) || it.images?.original_still?.url || it.images?.preview_gif?.url || it.images?.downsized?.url
      return { id: it.id, url: img }
    }).filter(x => !!x.url)
    if (unique.length < count) throw new Error('Not enough images')
    return unique.slice(0, count)
  } catch(err){
    console.warn('Falling back to emoji images:', err)
    const list = EMOJI.slice(0, Math.max(count, 0))
    return list.slice(0, count).map((ch, i) => ({ id: `emoji-${i}-${ch}`, url: emojiToDataUrl(ch) }))
  }
}

function shuffle<T>(arr:T[]): T[]{
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function startNewGame(){
  busy.value = true
  gameOver.value = false
  score.value = 0
  picked.value = []
  firstPickAt.value = null
  const { unique, match } = meta.value
  const images = await getImages(unique)
  let cards: Card[] = []
  let idCounter = 1
  for (const img of images){
    for (let k=0;k<match;k++){
      cards.push({ id: idCounter++, imageId: img.id, imageUrl: img.url, flipped:false, matched:false })
    }
  }
  deck.value = shuffle(cards)
  // Reveal preview with countdown
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
        scores.value = [payload, ...scores.value].slice(0, 30)
        saveScores()
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
      // flip back after delay
      setTimeout(() => {
        picked.value.forEach(i => deck.value[i].flipped = false)
        resolve()
      }, 700)
    }
  }
}

function restart(){ startNewGame() }

// initial: show start screen; do not auto-deal

onBeforeUnmount(() => clearPreviewTimers())

// modal
const showSettings = ref(false)
function applySettings(s: Settings){
  settings.difficulty = s.difficulty
  settings.source = s.source
  settings.giphyApiKey = s.giphyApiKey
  settings.giphyQuery = s.giphyQuery
  showSettings.value = false
  startNewGame()
}
</script>

<template>
  <div class="wrap">
    <div class="row" style="justify-content:space-between;">
      <div>
        <div class="title">Cards Match</div>
        <div class="muted">Flip cards to find {{ meta.match }}-of-a-kind. 100 pts + up to 1000 bonus per match.</div>
      </div>
      <div class="row" style="gap:8px;">
        <button class="btn" @click="restart">New Game</button>
        <button class="btn" @click="showSettings = true">Settings</button>
      </div>
    </div>

    <div class="panel row" style="justify-content:space-between;">
      <div class="row" style="gap:8px;">
        <span class="chip">Difficulty: {{ settings.difficulty }}</span>
        <span class="chip">Source: {{ settings.source }}</span>
        <span class="chip">Match: {{ meta.match }}</span>
        <span class="chip">Cards: {{ deck.length }}</span>
        <span class="chip" v-if="previewing">Preview: {{ (previewLeftMs/1000).toFixed(1) }}s</span>
      </div>
      <div class="row" style="gap:8px;">
        <span>Score: <strong>{{ score }}</strong></span>
        <span class="muted">Remaining: {{ remaining }}</span>
      </div>
    </div>

    <div v-if="showStart" class="panel" style="text-align:center; padding:24px; display:grid; gap:10px;">
      <div class="title">Ready to play?</div>
      <div class="muted">We will reveal all cards for {{ previewMs/1000 }}s ({{ settings.difficulty }}) before the round starts.</div>
      <div class="row" style="justify-content:center;">
        <button class="btn primary" @click="startNewGame">Start Game</button>
      </div>
    </div>

    <div v-else class="panel">
      <div class="grid" :class="meta.gridClass">
        <CardItem v-for="(c, idx) in deck" :key="c.id"
          :flipped="c.flipped"
          :matched="c.matched"
          :image-url="c.imageUrl"
          :disabled="busy"
          @click="clickCard(idx)"
        />
      </div>
    </div>

    <div class="footer">
      <div>
        <div class="muted">Recent scores</div>
        <div class="scores">
          <div v-for="s in scores" :key="s.id" class="chip">
            {{ new Date(s.date).toLocaleString() }} · {{ s.difficulty }} · {{ s.score }}
          </div>
        </div>
      </div>
      <button v-if="gameOver" class="btn primary" @click="restart">Play again</button>
    </div>

    <SettingsModal
      :open="showSettings"
      :difficulty="settings.difficulty"
      :source="settings.source"
      :giphy-api-key="settings.giphyApiKey"
      :giphy-query="settings.giphyQuery"
      @close="showSettings=false"
      @save="applySettings"
    />
  </div>
</template>
