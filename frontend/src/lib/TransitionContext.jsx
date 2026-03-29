import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const [transitioning, setTransitioning] = useState(false)
  const [overlayLeaving, setOverlayLeaving] = useState(false)
  const [overlayColor, setOverlayColor] = useState('bg-paw-cream')
  const navigate = useNavigate()

  function transitionTo(pathOrCallback, color = 'bg-paw-cream') {
    setOverlayColor(color)
    setTransitioning(true)
    setTimeout(() => {
      if (typeof pathOrCallback === 'function') {
        pathOrCallback()
      } else {
        navigate(pathOrCallback)
      }
      setOverlayLeaving(true)
    }, 1000)
    setTimeout(() => {
      setTransitioning(false)
      setOverlayLeaving(false)
    }, 1600)
  }

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      {transitioning && (
        <div
          className={`fixed inset-0 z-[200] ${overlayColor}`}
          style={{
            animation: overlayLeaving
              ? 'slideOutToLeft 0.6s ease-in-out forwards'
              : 'slideInFromRight 1s ease-in-out forwards'
          }}
        />
      )}
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  return useContext(TransitionContext)
}
