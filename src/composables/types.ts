// Shared TypeScript types for the Cards Match game

export type Difficulty = 'easy'|'medium'|'hard'|'dark'
export type Source = 'emoji'|'giphy'

export type Settings = {
  difficulty: Difficulty
  source: Source
  giphyApiKey?: string
  giphyQuery?: string
}

export type Card = {
  id: number
  imageId: string
  imageUrl: string
  flipped: boolean
  matched: boolean
}

export type ScoreEntry = {
  id: string
  date: string
  difficulty: Difficulty
  score: number
  totalCards: number
  matchSize: number
  source: Source
}

