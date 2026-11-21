import { useCallback, useState, type CSSProperties } from 'react'
import { fallbackSrc, srcSet, type SceneImageAsset } from '../content/images'

interface SceneImageProps {
  asset: SceneImageAsset
  alt: string
  className?: string
  /** The first scene image is fetched at once (at low priority); later ones lazily (FR-081). */
  eager?: boolean
}

type LoadState = 'loading' | 'loaded' | 'failed'

const ratio = (aspect: number) => Math.round((1 / aspect) * 1000)

/**
 * Art-directed, full-bleed scene image (FR-091): portrait viewports get a focal-point crop,
 * landscape viewports the full frame. Until it decodes, the scene's gradient shows through;
 * if it fails, it simply stays hidden and the scene still works (FR-082).
 */
export function SceneImage({ asset, alt, className = '', eager = false }: SceneImageProps) {
  const [state, setState] = useState<LoadState>('loading')

  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setState('loaded')
  }, [])

  const landscapeSizes = `(max-aspect-ratio: ${ratio(asset.landscape.aspect)}/1000) ${Math.ceil(100 / asset.landscape.aspect)}vh, 100vw`
  const portraitSizes = `(max-aspect-ratio: ${ratio(asset.portrait.aspect)}/1000) ${Math.ceil(100 / asset.portrait.aspect)}vh, 100vw`
  const [fx, fy] = asset.focal

  return (
    <picture className={`scene-image ${className}`} data-state={state}>
      <source media="(orientation: portrait)" type="image/avif" srcSet={srcSet(asset, 'p', 'avif')} sizes={portraitSizes} />
      <source media="(orientation: portrait)" type="image/webp" srcSet={srcSet(asset, 'p', 'webp')} sizes={portraitSizes} />
      <source type="image/avif" srcSet={srcSet(asset, 'l', 'avif')} sizes={landscapeSizes} />
      <source type="image/webp" srcSet={srcSet(asset, 'l', 'webp')} sizes={landscapeSizes} />
      <img
        ref={imgRef}
        src={fallbackSrc(asset)}
        alt={alt}
        width={1000}
        height={Math.round(asset.landscape.aspect * 1000)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'low' : 'auto'}
        style={{ '--focal-x': `${fx * 100}%`, '--focal-y': `${fy * 100}%` } as CSSProperties}
        onLoad={() => setState('loaded')}
        onError={() => setState('failed')}
      />
    </picture>
  )
}
