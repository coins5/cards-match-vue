<script setup lang="ts">
// App shell: delegates logic to useGame composable and composes UI components
import { ref } from 'vue'
import CardItem from './components/CardItem.vue'
import SettingsModal from './components/SettingsModal.vue'
import ScoresList from './components/ScoresList.vue'
import { useGame } from './composables/useGame'

// Main game API (state + actions)
const {
  // state
  settings, scores, deck, score, busy, gameOver, showStart,
  previewing, previewLeftMs,
  // derived
  meta, previewMs, remaining,
  // actions
  startNewGame, clickCard, restart, applySettings,
} = useGame()

// Local UI-only state (modal visibility)
const showSettings = ref(false)
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
      <ScoresList :scores="scores" />
      <button v-if="gameOver" class="btn primary" @click="restart">Play again</button>
    </div>

    <SettingsModal
      :open="showSettings"
      :difficulty="settings.difficulty"
      :source="settings.source"
      :giphy-api-key="settings.giphyApiKey"
      :giphy-query="settings.giphyQuery"
      @close="showSettings=false"
      @save="(s) => { showSettings=false; applySettings(s) }"
    />
  </div>
  
</template>

