'use client'

import React, { FC, ReactNode, useEffect, useRef, useState } from 'react'

type GsapApi = typeof import('gsap').gsap

interface MagneticCursorProps {
  children: ReactNode
  magneticFactor?: number
  lerpAmount?: number
  hoverPadding?: number
  hoverAttribute?: string
  cursorSize?: number
  cursorColor?: string
  blendMode?: 'difference' | 'exclusion' | 'normal' | 'screen' | 'overlay'
  cursorClassName?: string
  shape?: 'circle' | 'square' | 'rounded-square'
  disableOnTouch?: boolean
  speedMultiplier?: number
  maxScaleX?: number
  maxScaleY?: number
  contrastBoost?: number
  disableOnMobile?: boolean
  mobileBreakpoint?: number
}

interface CursorPosition {
  current: { x: number; y: number }
}

const detectTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const detectMobileViewport = (breakpoint: number) =>
  typeof window !== 'undefined' &&
  window.matchMedia(`(max-width: ${breakpoint}px)`).matches

const detectCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches

const CursorEffect: FC<MagneticCursorProps> = ({
  children,
  cursorSize = 24,
  cursorColor = 'white',
  blendMode = 'exclusion',
  cursorClassName = '',
  shape = 'circle',
  disableOnTouch = true,
  speedMultiplier = 0.02,
  maxScaleX = 1,
  maxScaleY = 0.3,
  contrastBoost = 1.5,
  disableOnMobile = true,
  mobileBreakpoint = 768,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<CursorPosition>({
    current: { x: -100, y: -100 },
  })
  const hasInitializedRef = useRef(false)
  const gsapRef = useRef<GsapApi | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [isGsapReady, setIsGsapReady] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(() => detectTouchDevice())
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    detectMobileViewport(mobileBreakpoint),
  )
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => detectCoarsePointer())

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
  }, [])

  const shouldDisableByDevice =
    (disableOnTouch && (isTouchDevice || isCoarsePointer)) ||
    (disableOnMobile && isMobileViewport)
  const shouldLoadGsap = hasMounted && !shouldDisableByDevice

  useEffect(() => {
    if (!shouldLoadGsap || isGsapReady || gsapRef.current) return

    let cancelled = false

    const loadGsap = async () => {
      const { gsap } = await import('gsap')
      if (cancelled) return
      gsapRef.current = gsap
      setIsGsapReady(true)
    }

    void loadGsap()

    return () => {
      cancelled = true
    }
  }, [isGsapReady, shouldLoadGsap])

  useEffect(() => {
    return () => {
      gsapRef.current = null
    }
  }, [])

  const shouldDisableCursor = !hasMounted || !isGsapReady || shouldDisableByDevice

  useEffect(() => {
    if (!hasMounted) return

    const mobileQuery = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`)
    const coarseQuery = window.matchMedia('(hover: none), (pointer: coarse)')

    const syncFlags = () => {
      setIsTouchDevice(detectTouchDevice())
      setIsMobileViewport(mobileQuery.matches)
      setIsCoarsePointer(coarseQuery.matches)
    }

    syncFlags()
    mobileQuery.addEventListener('change', syncFlags)
    coarseQuery.addEventListener('change', syncFlags)

    return () => {
      mobileQuery.removeEventListener('change', syncFlags)
      coarseQuery.removeEventListener('change', syncFlags)
    }
  }, [hasMounted, mobileBreakpoint])

  useEffect(() => {
    if (shouldDisableCursor) return
    const cursorEl = cursorRef.current
    if (!cursorEl) return
    const gsap = gsapRef.current
    if (!gsap) return

    gsap.set(cursorEl, { xPercent: -50, yPercent: -50, opacity: 0 })

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX
      const y = event.clientY
      const position = positionRef.current

      const deltaX = x - position.current.x
      const deltaY = y - position.current.y
      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * speedMultiplier
      const stretchX = 1 + Math.min(speed, maxScaleX)
      const stretchY = 1 - Math.min(speed, maxScaleY)

      if (!hasInitializedRef.current) {
        positionRef.current.current.x = x
        positionRef.current.current.y = y
        hasInitializedRef.current = true
        gsap.set(cursorEl, {
          x,
          y,
          opacity: 1,
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
          overwrite: 'auto',
        })
        return
      }

      position.current.x = x
      position.current.y = y

      const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

      gsap.set(cursorEl, {
        x,
        y,
        rotate: rotation,
        scaleX: stretchX,
        scaleY: stretchY,
        opacity: 1,
        overwrite: 'auto',
      })
    }

    const onMouseLeave = () => {
      gsap.to(cursorEl, { opacity: 0, duration: 0.2, overwrite: 'auto' })
    }

    const onMouseEnter = () => {
      if (!hasInitializedRef.current) return
      gsap.to(cursorEl, { opacity: 1, duration: 0.2, overwrite: 'auto' })
    }

    window.addEventListener('pointermove', onPointerMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [maxScaleX, maxScaleY, shouldDisableCursor, speedMultiplier])

  if (shouldDisableCursor) return <>{children}</>

  const styles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    willChange: 'transform',
    backgroundColor: cursorColor,
    mixBlendMode: blendMode,
    width: cursorSize,
    height: cursorSize,
    borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '0' : '8px',
    backdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
    WebkitBackdropFilter: contrastBoost !== 1 ? `contrast(${contrastBoost})` : 'none',
  }

  return (
    <>
      <div ref={cursorRef} className={`magnetic-cursor ${cursorClassName}`} style={styles} />
      {children}
    </>
  )
}

export default CursorEffect
