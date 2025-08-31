// Image service: supplies the set of unique images according to settings
import { EMOJI } from './constants'
import { emojiToDataUrl } from './utils'
import type { Settings } from './types'

export async function getImages(settings: Settings, count:number): Promise<{ id:string, url:string }[]>{
  if (settings.source === 'emoji'){
    const list = EMOJI.slice(0, Math.max(count, 0))
    return list.slice(0, count).map((ch, i) => ({ id: `emoji-${i}-${ch}`, url: emojiToDataUrl(ch) }))
  }
  // Giphy fetch; gracefully fallback to emojis if network/key/query fails
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

