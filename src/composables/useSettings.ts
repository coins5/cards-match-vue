// Settings store: persists user preferences in localStorage
import { reactive, watch } from 'vue'
import type { Settings } from './types'

const STORAGE_SETTINGS = 'cm-settings'

const DEFAULTS: Settings = {
  difficulty: 'medium',
  source: 'emoji',
  giphyApiKey: '',
  giphyQuery: 'cats'
}

function load(): Settings{
  try{ return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || 'null') || {}) } }
  catch{ return { ...DEFAULTS } }
}

export function useSettings(){
  const settings = reactive<Settings>(load())
  watch(settings, () => {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings))
  }, { deep:true })
  return { settings }
}

