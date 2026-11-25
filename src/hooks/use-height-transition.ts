import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const DURATION_MS = 500
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

/**
 * Eases an element's height to its new natural value whenever `view` changes, so swapping its
 * contents doesn't make the page below jump. Other size changes (a resized textarea, error
 * messages) are left alone, and no inline styles remain afterwards.
 */
export function useHeightTransition(ref: RefObject<HTMLElement | null>, view: unknown) {
  const lastHeight = useRef(0)
  const lastView = useRef(view)
  const animation = useRef<Animation | null>(null)

  // Resize observers run after layout effects, so below `lastHeight` is still the height the
  // visitor sees — including halfway through a running transition.
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      lastHeight.current = element.getBoundingClientRect().height
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  useLayoutEffect(() => {
    if (Object.is(lastView.current, view)) return
    lastView.current = view
    const element = ref.current
    if (!element) return

    animation.current?.cancel()
    const from = lastHeight.current
    const to = element.getBoundingClientRect().height
    if (!from || from === to) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    animation.current = element.animate(
      [
        { height: `${from}px`, overflow: 'hidden' },
        { height: `${to}px`, overflow: 'hidden' },
      ],
      { duration: DURATION_MS, easing: EASING },
    )
  }, [ref, view])
}
