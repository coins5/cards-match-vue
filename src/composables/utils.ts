// Small utilities: shuffle and emoji → SVG data URL

export function shuffle<T>(arr:T[]): T[]{
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function emojiToDataUrl(char:string){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>\n`+
    `<rect width='100%' height='100%' rx='24' ry='24' fill='\#141822'/>`+
    `<text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='140'>${char}</text>`+
  `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

