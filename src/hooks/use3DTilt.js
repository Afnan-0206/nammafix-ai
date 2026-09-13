import { useRef, useCallback } from 'react'

/**
 * use3DTilt - Custom React Hook for physics-based 3D card tilt
 * Gives elements genuine 3D perspective depth with Z-axis layering and clean specular sheen.
 */
export function use3DTilt(maxTilt = 12, perspective = 1000) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
  }, [maxTilt, perspective])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
  }, [perspective])

  return {
    ref: cardRef,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: {
      transformStyle: 'preserve-3d',
      transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
  }
}
