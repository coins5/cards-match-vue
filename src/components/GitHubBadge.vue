<script setup lang="ts">
// Small badge linking to the GitHub repo with live star count
import { ref, onMounted } from 'vue'

const props = defineProps<{ repo: string }>() // e.g., "coins5/cards-match-vue"
const stars = ref<number|null>(null)
const loading = ref(true)
const error = ref<string|undefined>()

function formatStars(n: number){
  if (n < 1000) return String(n)
  if (n < 10000) return (n/1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return Math.round(n/1000) + 'k'
}

onMounted(async () => {
  try{
    const res = await fetch(`https://api.github.com/repos/${props.repo}`)
    if (!res.ok) throw new Error('GitHub API error')
    const data = await res.json()
    stars.value = Number(data.stargazers_count || 0)
  } catch (e:any){
    error.value = e?.message || 'Failed to load'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <a class="gh" :href="`https://github.com/${repo}`" target="_blank" rel="noopener noreferrer">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="logo">
      <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
    </svg>
    <span class="label">GitHub</span>
    <span class="stars" v-if="!loading">
      ★ {{ stars !== null ? formatStars(stars) : '?' }}
    </span>
  </a>
</template>

<style scoped>
.gh{
  display:inline-flex; align-items:center; gap:8px;
  background:#16181d; border:1px solid #2a2f3d; color:#e8e8ea;
  padding:6px 10px; border-radius:10px; text-decoration:none;
}
.gh:hover{ filter:brightness(1.06); }
.logo{ display:block; color:#c9d1d9; }
.label{ font-size:13px; color:#c9d1d9; }
.stars{ font-size:12px; color:#a0a3aa; background:#1b1f2a; border:1px solid #2a2f3d; padding:2px 6px; border-radius:999px; }
</style>

