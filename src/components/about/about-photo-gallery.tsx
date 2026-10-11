'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AboutPhoto {
  src: string
  alt: string
  width: number
  height: number
}

type View = { scale: number; x: number; y: number }
type Point = { x: number; y: number }

const MIN_SCALE = 1
const MAX_SCALE = 4
const TAP_SCALE = 2.5
const BUTTON_STEP = 1.5
const RESET: View = { scale: 1, x: 0, y: 0 }

const clampNumber = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value))

/**
 * Photo mosaic whose tiles open a full-screen lightbox. The lightbox shows the whole
 * photo and supports zoom (click/tap, wheel, pinch, buttons, +/−/0 keys) and panning
 * by dragging. All zoom is a CSS transform on the full-resolution original.
 */
export function AboutPhotoGallery({ photos, label }: { photos: AboutPhoto[]; label: string }) {
  const t = useTranslations('gallery')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [view, setView] = useState<View>(RESET)
  const [gesturing, setGesturing] = useState(false)
  const [stage, setStage] = useState({ width: 0, height: 0 })

  const tileRefs = useRef<(HTMLButtonElement | null)[]>([])
  const stageEl = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef(view)
  const wheelZoom = useRef<(factor: number, origin: Point) => void>(() => {})
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<{
    start: Point
    startTime: number
    moved: boolean
    pinch?: { distance: number; scale: number }
  } | null>(null)

  const photo = photos[active]
  const count = photos.length

  // Size of the photo as drawn by `object-contain` inside the stage, at scale 1.
  const fitted = (() => {
    if (!photo || !stage.width || !stage.height) return { width: 0, height: 0 }
    const ratio = photo.width / photo.height
    return stage.width / stage.height > ratio
      ? { width: stage.height * ratio, height: stage.height }
      : { width: stage.width, height: stage.width / ratio }
  })()

  // Keeps the zoomed photo covering the stage: no panning past its edges.
  const clampView = useCallback(
    ({ scale, x, y }: View): View => {
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
      if (s === MIN_SCALE) return RESET
      const maxX = Math.max(0, (fitted.width * s - stage.width) / 2)
      const maxY = Math.max(0, (fitted.height * s - stage.height) / 2)
      return { scale: s, x: clampNumber(x, maxX), y: clampNumber(y, maxY) }
    },
    [fitted.width, fitted.height, stage.width, stage.height],
  )

  /** Zooms to `scale`, keeping the stage point `origin` (relative to its centre) fixed. */
  const zoomTo = useCallback(
    (scale: number, origin: Point = { x: 0, y: 0 }) => {
      setView((current) => {
        const target = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))
        const factor = target / current.scale
        return clampView({
          scale: target,
          x: origin.x - (origin.x - current.x) * factor,
          y: origin.y - (origin.y - current.y) * factor,
        })
      })
    },
    [clampView],
  )

  /** Pointer position relative to the stage centre. */
  const toStagePoint = (clientX: number, clientY: number): Point => {
    const rect = stageEl.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 }
  }

  const step = useCallback(
    (direction: 1 | -1) => {
      setView(RESET)
      setActive((index) => (index + direction + count) % count)
    },
    [count],
  )

  const openAt = (index: number) => {
    setActive(index)
    setView(RESET)
    setOpen(true)
  }

  // Measures the stage (and re-measures on resize) while the lightbox is mounted.
  const stageRef = useCallback((node: HTMLDivElement | null) => {
    stageEl.current = node
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStage({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(node)

    // Wheel zoom needs a non-passive listener to stop the page from scrolling.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = node.getBoundingClientRect()
      wheelZoom.current(Math.exp(-event.deltaY * 0.002), {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      })
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      observer.disconnect()
      node.removeEventListener('wheel', onWheel)
      stageEl.current = null
    }
  }, [])

  // The wheel listener is attached once per stage; it reads the latest zoom state through this.
  useLayoutEffect(() => {
    wheelZoom.current = (factor, origin) => zoomTo(viewRef.current.scale * factor, origin)
  })

  useLayoutEffect(() => {
    viewRef.current = view
  }, [view])

  // Keyboard: arrows browse, +/−/0 zoom. Listened for on window in the capture phase, as in
  // ProductGallery — Base UI's popup stops arrow keys from bubbling.
  useLayoutEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && count > 1) step(-1)
      else if (event.key === 'ArrowRight' && count > 1) step(1)
      else if (event.key === '+' || event.key === '=') zoomTo(viewRef.current.scale * BUTTON_STEP)
      else if (event.key === '-') zoomTo(viewRef.current.scale / BUTTON_STEP)
      else if (event.key === '0') setView(RESET)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, count, step, zoomTo])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]

    if (points.length === 1) {
      gesture.current = {
        start: { x: event.clientX, y: event.clientY },
        startTime: event.timeStamp,
        moved: false,
      }
    } else if (points.length === 2 && gesture.current) {
      const [a, b] = points as [Point, Point]
      gesture.current.moved = true
      gesture.current.pinch = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        scale: viewRef.current.scale,
      }
    }
    setGesturing(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId)
    const state = gesture.current
    if (!previous || !state) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]

    if (points.length === 2 && state.pinch) {
      const [a, b] = points as [Point, Point]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const middle = toStagePoint((a.x + b.x) / 2, (a.y + b.y) / 2)
      zoomTo((state.pinch.scale * distance) / state.pinch.distance, middle)
      return
    }

    if (Math.hypot(event.clientX - state.start.x, event.clientY - state.start.y) > 6) {
      state.moved = true
    }
    // Drag pans only while zoomed; at 1× the move is read as a swipe on release.
    if (viewRef.current.scale > 1) {
      const dx = event.clientX - previous.x
      const dy = event.clientY - previous.y
      setView((current) => clampView({ ...current, x: current.x + dx, y: current.y + dy }))
    }
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    const state = gesture.current
    if (pointers.current.size > 0) {
      // One finger lifted mid-pinch: keep going as a pan with the remaining one.
      if (state) state.pinch = undefined
      return
    }
    gesture.current = null
    setGesturing(false)
    if (!state || event.type === 'pointercancel') return

    if (!state.moved && event.timeStamp - state.startTime < 500) {
      const point = toStagePoint(event.clientX, event.clientY)
      if (viewRef.current.scale > 1) {
        setView(RESET)
      } else if (Math.abs(point.x) > fitted.width / 2 || Math.abs(point.y) > fitted.height / 2) {
        // Tap on the empty letterbox around the photo closes, like the backdrop.
        setOpen(false)
      } else {
        zoomTo(TAP_SCALE, point)
      }
      return
    }

    const dx = event.clientX - state.start.x
    if (viewRef.current.scale === 1 && count > 1 && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  }

  const zoomed = view.scale > 1
  const controlClass =
    'flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white/10'

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setView(RESET)
      }}
    >
      <ul aria-label={label} className="grid grid-cols-4 gap-2 sm:gap-3">
        {photos.map((item, index) => (
          <li key={item.src}>
            <button
              ref={(node) => {
                tileRefs.current[index] = node
              }}
              type="button"
              onClick={() => openAt(index)}
              aria-label={`${t('openPreview')}: ${item.alt}`}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-line bg-slate-100 shadow-card focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 1024px) 25vw, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute right-2 bottom-2 hidden size-7 items-center justify-center rounded-full bg-white text-navy-900 shadow-card transition-opacity sm:flex lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                aria-hidden
              >
                <ZoomIn className="size-3.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[998] bg-navy-950/90 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          finalFocus={() => tileRefs.current[active] ?? true}
          // Clicks on the dark area around the stage close the preview.
          onClick={(event) => event.target === event.currentTarget && setOpen(false)}
          className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-4 p-4 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 sm:p-10"
        >
          <Dialog.Title className="sr-only">{photo?.alt}</Dialog.Title>
          <Dialog.Close
            aria-label={t('closePreview')}
            className={cn(controlClass, 'absolute top-4 right-4 z-10')}
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>

          {photo && (
            <div
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className={cn(
                'relative h-[78vh] w-full max-w-6xl touch-none overflow-hidden select-none',
                zoomed ? (gesturing ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 will-change-transform',
                  !gesturing && 'transition-transform duration-200 ease-out',
                )}
                style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
              >
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  unoptimized // full-resolution original, so zoomed detail stays sharp
                  draggable={false}
                  className="pointer-events-none object-contain animate-in fade-in duration-300"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('previous')}
                className={controlClass}
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={() => zoomTo(view.scale / BUTTON_STEP)}
              disabled={!zoomed}
              aria-label={t('zoomOut')}
              className={controlClass}
            >
              <ZoomOut className="size-5" aria-hidden />
            </button>
            <p
              className="min-w-16 text-center text-sm font-medium text-white/80 tabular-nums"
              aria-live="polite"
            >
              {active + 1} / {count}
            </p>
            <button
              type="button"
              onClick={() => zoomTo(view.scale * BUTTON_STEP)}
              disabled={view.scale >= MAX_SCALE}
              aria-label={t('zoomIn')}
              className={controlClass}
            >
              <ZoomIn className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setView(RESET)}
              disabled={!zoomed}
              aria-label={t('resetZoom')}
              className={controlClass}
            >
              <RotateCcw className="size-5" aria-hidden />
            </button>
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('next')}
                className={controlClass}
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
