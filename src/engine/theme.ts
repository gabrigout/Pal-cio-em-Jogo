import type { CampaignTheme } from '../state/types'

const THEME_SURFACE = '#373737'

interface RGB {
  red: number
  green: number
  blue: number
}

interface HSL {
  hue: number
  saturation: number
  lightness: number
}

function parseHex(hexColor: string): RGB {
  const normalized = hexColor.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) throw new Error('Cor de tema inválida.')
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function channelLuminance(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hexColor: string): number {
  const color = parseHex(hexColor)
  return 0.2126 * channelLuminance(color.red)
    + 0.7152 * channelLuminance(color.green)
    + 0.0722 * channelLuminance(color.blue)
}

export function contrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = relativeLuminance(firstColor)
  const secondLuminance = relativeLuminance(secondColor)
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

function toHsl(hexColor: string): HSL {
  const { red, green, blue } = parseHex(hexColor)
  const channels = [red / 255, green / 255, blue / 255]
  const maximum = Math.max(...channels)
  const minimum = Math.min(...channels)
  const difference = maximum - minimum
  let hue = 0
  let saturation = 0
  const lightness = (maximum + minimum) / 2

  if (difference > 0) {
    saturation = difference / (1 - Math.abs(2 * lightness - 1))
    if (maximum === channels[0]) hue = ((channels[1] - channels[2]) / difference) % 6
    else if (maximum === channels[1]) hue = (channels[2] - channels[0]) / difference + 2
    else hue = (channels[0] - channels[1]) / difference + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  return { hue, saturation, lightness }
}

function fromHsl({ hue, saturation, lightness }: HSL): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const section = hue / 60
  const intermediate = chroma * (1 - Math.abs((section % 2) - 1))
  const [red, green, blue] = section < 1 ? [chroma, intermediate, 0]
    : section < 2 ? [intermediate, chroma, 0]
      : section < 3 ? [0, chroma, intermediate]
        : section < 4 ? [0, intermediate, chroma]
          : section < 5 ? [intermediate, 0, chroma]
            : [chroma, 0, intermediate]
  const offset = lightness - chroma / 2
  const hex = [red, green, blue]
    .map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, '0'))
    .join('')
  return `#${hex}`
}

export function ensureContrast(hexColor: string, background: string, minimumRatio = 4.5): string {
  if (contrastRatio(hexColor, background) >= minimumRatio) return hexColor.toLowerCase()

  const original = toHsl(hexColor)
  const candidates: Array<{ color: string; distance: number }> = []

  for (const direction of [-1, 1]) {
    let lowerDistance = 0
    let upperDistance = direction < 0 ? original.lightness : 1 - original.lightness
    for (let iteration = 0; iteration < 24; iteration += 1) {
      const distance = (lowerDistance + upperDistance) / 2
      const candidate = fromHsl({
        ...original,
        lightness: original.lightness + direction * distance,
      })
      if (contrastRatio(candidate, background) >= minimumRatio) upperDistance = distance
      else lowerDistance = distance
    }

    const distance = upperDistance
    const color = fromHsl({
      ...original,
      lightness: original.lightness + direction * distance,
    })
    if (contrastRatio(color, background) >= minimumRatio) candidates.push({ color, distance })
  }

  return candidates.sort((first, second) => first.distance - second.distance)[0]?.color
    ?? (contrastRatio('#ffffff', background) > contrastRatio('#000000', background) ? '#ffffff' : '#000000')
}

export function getButtonTextColor(background: string): string {
  return contrastRatio(background, '#000000') >= contrastRatio(background, '#ffffff')
    ? '#000000'
    : '#ffffff'
}

export function createCampaignTheme(primaryColor: string, secondaryColor: string): CampaignTheme {
  return {
    officialPrimary: primaryColor.toLowerCase(),
    officialSecondary: secondaryColor.toLowerCase(),
    primary: ensureContrast(primaryColor, THEME_SURFACE),
    secondary: ensureContrast(secondaryColor, THEME_SURFACE),
    buttonText: getButtonTextColor(ensureContrast(primaryColor, THEME_SURFACE)),
  }
}