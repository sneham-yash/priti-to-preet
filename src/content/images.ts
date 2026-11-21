export interface ImageVariantSet {
  widths: number[]
  /** height / width */
  aspect: number
}

export interface SceneImageAsset {
  key: string
  landscape: ImageVariantSet
  portrait: ImageVariantSet & { dedicated: boolean }
  focal: [number, number]
}

export interface ImageManifest {
  mountain: SceneImageAsset
  ocean: SceneImageAsset
  oasis: SceneImageAsset
  /** Optional "same frame, no oasis" base layer for the reveal. */
  oasisEmpty: SceneImageAsset | null
}

export type ImageFormat = 'avif' | 'webp'

export function srcSet(asset: SceneImageAsset, orientation: 'l' | 'p', format: ImageFormat): string {
  const set = orientation === 'l' ? asset.landscape : asset.portrait
  return set.widths
    .map((w) => `/images/${asset.key}-${orientation}-${w}.${format} ${w}w`)
    .join(', ')
}

export function fallbackSrc(asset: SceneImageAsset): string {
  const widths = asset.landscape.widths
  const w = widths[Math.min(1, widths.length - 1)] ?? widths[0]
  return `/images/${asset.key}-l-${w}.webp`
}
