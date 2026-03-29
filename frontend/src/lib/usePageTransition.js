import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function usePageTransition() {
  const [transitioning, setTransitioning] = useState(false)
  const [overlayLeaving, setOverlayLeaving] = useState(false)
  const [overlayColor, setOverlayColor] = useState('bg-paw-red')
  const navigate = useNavigate()

  function transitionTo(path, color = 'bg-paw-cream') {
    setOverlayColor(color)
    setTransitioning(true)
    setTimeout(() => {
      navigate(path)
      setOverlayLeaving(true)
    }, 1000)
    setTimeout(() => {
      setTransitioning(false)
      setOverlayLeaving(false)
    }, 1600)
  }

  const overlay = transitioning ? (
    <div
      className={`fixed inset-0 z-[200] ${overlayColor}`}
      style={{
        animation: overlayLeaving
          ? 'slideOutToLeft 0.6s ease-in-out forwards'
          : 'slideInFromRight 1s ease-in-out forwards'
      }}
    />
  ) : null

  return { transitionTo, overlay }
}
