import { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api'
import { supabase } from '../../lib/supabaseClient'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

// Minimal dark map style
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1e2433' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b97b0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e2433' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a202c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d4a63' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1e' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

function haversineMeters(a, b) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function metersToMiles(m) {
  return m / 1609.344
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function LiveWalkTracker({ dog, parkName, onClose }) {
  const [status, setStatus] = useState('idle') // idle | active | paused | ended
  const [points, setPoints] = useState([])
  const [totalMeters, setTotalMeters] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [currentPos, setCurrentPos] = useState(null)
  const [saving, setSaving] = useState(false)

  const mapRef = useRef(null)
  const watchIdRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedSecondsRef = useRef(0)

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY })

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  // Keep map centered on current position
  useEffect(() => {
    if (mapRef.current && currentPos) {
      mapRef.current.panTo(currentPos)
    }
  }, [currentPos])

  function startTracking() {
    setStatus('active')
    startTimeRef.current = Date.now() - pausedSecondsRef.current * 1000

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const newPt = { lat: coords.latitude, lng: coords.longitude }
        setCurrentPos(newPt)
        setPoints((prev) => {
          if (prev.length > 0) {
            const d = haversineMeters(prev[prev.length - 1], newPt)
            if (d < 5) return prev // ignore GPS jitter under 5 m
            setTotalMeters((m) => m + d)
          }
          return [...prev, newPt]
        })
      },
      null,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  function pauseTracking() {
    setStatus('paused')
    pausedSecondsRef.current = elapsed
    clearInterval(timerRef.current)
    navigator.geolocation.clearWatch(watchIdRef.current)
  }

  async function endWalk() {
    clearInterval(timerRef.current)
    navigator.geolocation.clearWatch(watchIdRef.current)
    setStatus('ended')
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('walks').insert({
        owner_id: session.user.id,
        dog_id: dog.id,
        dog_name: dog.name,
        breed: dog.breed,
        started_at: new Date(startTimeRef.current).toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: elapsed,
        distance_meters: totalMeters,
        route: points,
        park_name: parkName ?? null,
      })
    }
    setSaving(false)
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const miles = metersToMiles(totalMeters)
  const paceMinutes = elapsed > 30 && miles > 0.05 ? elapsed / 60 / miles : null
  const paceDisplay = paceMinutes
    ? `${Math.floor(paceMinutes)}:${String(Math.floor((paceMinutes % 1) * 60)).padStart(2, '0')}`
    : '--:--'

  // Custom red dot icon (defined after Maps API is loaded)
  const currentDotIcon = isLoaded
    ? {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#e53e3e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 10,
      }
    : null

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {dog.image ? (
            <img src={dog.image} className="w-9 h-9 rounded-full object-cover" alt={dog.name} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-paw-pink flex items-center justify-center text-base">
              🐾
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{dog.name}</p>
            <p className="text-gray-400 text-xs">{parkName ?? 'Live Walk'}</p>
          </div>
        </div>
        {status === 'idle' && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {!isLoaded ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-paw-red border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={currentPos ?? { lat: 37.7749, lng: -122.4194 }}
            zoom={17}
            onLoad={onMapLoad}
            options={{
              styles: MAP_STYLES,
              disableDefaultUI: true,
              zoomControl: false,
              gestureHandling: 'greedy',
            }}
          >
            {points.length > 1 && (
              <Polyline
                path={points}
                options={{
                  strokeColor: '#e53e3e',
                  strokeOpacity: 0.95,
                  strokeWeight: 6,
                }}
              />
            )}
            {currentPos && currentDotIcon && (
              <Marker position={currentPos} icon={currentDotIcon} />
            )}
          </GoogleMap>
        )}

        {status === 'active' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-paw-red text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow flex items-center gap-2 z-10 pointer-events-none">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live
          </div>
        )}
        {status === 'paused' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow z-10 pointer-events-none">
            Paused
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-900 px-6 py-5 grid grid-cols-3 gap-4 text-center shrink-0">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Time</p>
          <p className="text-white font-display text-3xl">{formatTime(elapsed)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Distance</p>
          <p className="text-white font-display text-3xl">{miles.toFixed(2)}</p>
          <p className="text-gray-500 text-xs">miles</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Pace</p>
          <p className="text-white font-display text-3xl">{paceDisplay}</p>
          <p className="text-gray-500 text-xs">min/mi</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-950 px-6 py-6 shrink-0">
        {status === 'idle' && (
          <button
            onClick={startTracking}
            className="w-full bg-paw-red text-white font-display text-2xl uppercase tracking-widest py-5 rounded-2xl hover:bg-red-700 transition-colors"
          >
            Start Walk
          </button>
        )}
        {status === 'active' && (
          <div className="flex gap-4">
            <button
              onClick={pauseTracking}
              className="flex-1 bg-gray-800 text-white font-semibold uppercase tracking-wide py-4 rounded-2xl hover:bg-gray-700 transition-colors"
            >
              Pause
            </button>
            <button
              onClick={endWalk}
              className="flex-1 bg-paw-red text-white font-semibold uppercase tracking-wide py-4 rounded-2xl hover:bg-red-700 transition-colors"
            >
              End Walk
            </button>
          </div>
        )}
        {status === 'paused' && (
          <div className="flex gap-4">
            <button
              onClick={startTracking}
              className="flex-1 bg-paw-red text-white font-semibold uppercase tracking-wide py-4 rounded-2xl hover:bg-red-700 transition-colors"
            >
              Resume
            </button>
            <button
              onClick={endWalk}
              className="flex-1 bg-gray-800 text-white font-semibold uppercase tracking-wide py-4 rounded-2xl hover:bg-gray-700 transition-colors"
            >
              End Walk
            </button>
          </div>
        )}
        {status === 'ended' && (
          <div className="space-y-4">
            {saving ? (
              <div className="flex items-center justify-center gap-3 text-gray-400 py-4">
                <div className="w-5 h-5 border-2 border-paw-red border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Saving walk...</span>
              </div>
            ) : (
              <>
                <div className="bg-gray-800 rounded-2xl p-5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">Walk Complete</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-white font-display text-3xl">{formatTime(elapsed)}</p>
                      <p className="text-gray-500 text-xs mt-1">total time</p>
                    </div>
                    <div>
                      <p className="text-white font-display text-3xl">{miles.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs mt-1">miles</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-paw-red text-white font-semibold uppercase tracking-wide py-4 rounded-2xl hover:bg-red-700 transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
