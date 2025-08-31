// Game constants: difficulties, preview durations, and fallback emojis
import type { Difficulty } from './types'

export const DIFFICULTIES: Record<Difficulty, { unique: number, match: number, gridClass: string }>= {
  easy:   { unique: 4,  match: 2, gridClass:'easy' },
  medium: { unique: 8,  match: 2, gridClass:'medium' },
  hard:   { unique: 16, match: 2, gridClass:'hard' },
  dark:   { unique: 32, match: 3, gridClass:'dark' },
}

export const PREVIEW_MS: Record<Difficulty, number> = {
  easy: 2000,
  medium: 4000,
  hard: 8000,
  dark: 16000,
}

// Selection of fun emojis as offline image source
export const EMOJI = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐤',
  '🦄','🐝','🦋','🐞','🐢','🐙','🦑','🦀','🐬','🐳','🐧','🦉','🐺','🦓','🦒','🐲',
  '🍎','🍊','🍋','🍉','🍇','🍓','🍒','🍍','🥝','🥑','🌶️','🥕','🥦','🍔','🍣','🍕',
  '⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🎮','🎲','🎧','📷','🎹','🎸','🚗','✈️'
]

