<script setup lang="ts">
import { reactive, watch, toRefs } from 'vue'

type Difficulty = 'easy'|'medium'|'hard'|'dark'
type Source = 'emoji'|'giphy'

const props = defineProps<{
  open: boolean
  difficulty: Difficulty
  source: Source
  giphyApiKey?: string
  giphyQuery?: string
}>()
const emit = defineEmits<{
  (e:'close'): void
  (e:'save', payload: { difficulty: Difficulty, source: Source, giphyApiKey?: string, giphyQuery?: string }): void
}>()

const state = reactive({
  difficulty: props.difficulty as Difficulty,
  source: props.source as Source,
  giphyApiKey: props.giphyApiKey ?? '',
  giphyQuery: props.giphyQuery ?? 'cats'
})

watch(() => props.open, (o) => {
  if (o){
    state.difficulty = props.difficulty
    state.source = props.source
    state.giphyApiKey = props.giphyApiKey ?? ''
    state.giphyQuery = props.giphyQuery ?? 'cats'
  }
})

function onSave(){
  emit('save', { ...state })
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div class="title">Settings</div>
        <button class="btn ghost" @click="emit('close')">Close</button>
      </div>

      <div class="panel" style="display:grid; gap:10px;">
        <label class="row" style="justify-content:space-between;">
          <span>Difficulty</span>
          <select class="select" v-model="state.difficulty">
            <option value="easy">Easy (4 images, match 2)</option>
            <option value="medium">Medium (8 images, match 2)</option>
            <option value="hard">Hard (16 images, match 2)</option>
            <option value="dark">Dark Souls (32 images, match 3)</option>
          </select>
        </label>

        <label class="row" style="justify-content:space-between;">
          <span>Image Source</span>
          <select class="select" v-model="state.source">
            <option value="emoji">Built-in Emoji</option>
            <option value="giphy">Giphy (API key required)</option>
          </select>
        </label>

        <div v-if="state.source==='giphy'" style="display:grid; gap:8px;">
          <label class="row" style="justify-content:space-between;">
            <span>Giphy API Key</span>
            <input class="input" v-model="state.giphyApiKey" placeholder="Your Giphy API key" />
          </label>
          <label class="row" style="justify-content:space-between;">
            <span>Search Term</span>
            <input class="input" v-model="state.giphyQuery" placeholder="e.g. cats" />
          </label>
          <div class="muted">Tip: We fetch exactly as many unique images as needed for the chosen difficulty.</div>
        </div>
      </div>

      <div class="row" style="justify-content:flex-end; margin-top:12px; gap:8px;">
        <button class="btn ghost" @click="emit('close')">Cancel</button>
        <button class="btn primary" @click="onSave">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

