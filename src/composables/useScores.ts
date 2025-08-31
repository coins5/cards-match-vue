// Scores store: persists recent scores in localStorage
import { ref } from 'vue'
import type { ScoreEntry } from './types'

const STORAGE_SCORES = 'cm-scores'

function load(): ScoreEntry[]{
  try{ return JSON.parse(localStorage.getItem(STORAGE_SCORES) || '[]') }catch{ return [] }
}
function save(scores: ScoreEntry[]){
  localStorage.setItem(STORAGE_SCORES, JSON.stringify(scores.slice(0, 20)))
}

export function useScores(){
  const scores = ref<ScoreEntry[]>(load())
  function addScore(entry: ScoreEntry){
    scores.value = [entry, ...scores.value].slice(0, 30)
    save(scores.value)
  }
  return { scores, addScore }
}

