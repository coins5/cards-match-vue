<script setup lang="ts">
// Render recent scores as compact chips
import type { ScoreEntry } from '../composables/types'
defineProps<{ scores: ScoreEntry[] }>()
</script>

<template>
  <div>
    <div class="muted">Recent scores</div>
    <div class="scores">
      <div v-for="s in scores" :key="s.id" class="chip">
        {{ new Date(s.date).toLocaleString() }} · {{ s.difficulty }} · {{ s.score }}
      </div>
    </div>
  </div>
  
</template>

<style scoped>
</style>

