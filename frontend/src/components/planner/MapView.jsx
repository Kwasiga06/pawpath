import { useState, useEffect } from 'react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

export default function MapView({ breed }) {
  const [coords, setCoords] = useState(null)
  const [locationError, setLocationError] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCoords({ lat: coords.latitude, lng: coords.longitude }),
      () => setLocationError(true)
    )
  }, [])

  const hasKey = GOOGLE_MAPS_API_KEY !== ''

  const mapUrl = coords
    ? `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_API_KEY}&q=dog+friendly+walking+park&center=${coords.lat},${coords.lng}&zoom=14`
    : null

  return (
    <div className="bg-white rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your route</p>
          <h2 className="font-display text-3xl uppercase tracking-tight text-gray-900">
            Custom Walking Route
          </h2>
        </div>
        <a
          href={coords ? `https://www.google.com/maps/search/dog+friendly+park/@${coords.lat},${coords.lng},14z` : 'https://maps.google.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-paw-blue text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-pill hover:bg-blue-700 transition-colors"
        >
          Open in Maps
        </a>
      </div>

      {/* Map embed */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-paw-cream">
        {hasKey && mapUrl ? (
          <iframe
            title="Dog Walking Route"
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          />
        ) : !hasKey ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-center px-6">
            <span className="text-6xl">🗺️</span>
            <div>
              <p className="font-display text-2xl uppercase tracking-tight text-gray-700 mb-2">
                Map Coming Soon
              </p>
              <p className="text-sm text-gray-400 max-w-sm">
                Add your Google Maps API key to the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> file to display a custom walking route for your {breed}.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-8 h-8 border-2 border-paw-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 uppercase tracking-widest">
              {locationError ? 'Location access denied — enable location to see your local map' : 'Getting your location...'}
            </p>
          </div>
        )}
      </div>

      {/* Route info */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
        <div className="bg-paw-cream rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Route Type</p>
          <p className="font-semibold text-gray-700">Loop Walk</p>
        </div>
        <div className="bg-paw-cream rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Terrain</p>
          <p className="font-semibold text-gray-700">Park / Flat</p>
        </div>
        <div className="bg-paw-cream rounded-xl p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dog Friendly</p>
          <p className="font-semibold text-green-600">✓ Yes</p>
        </div>
      </div>
    </div>
  )
}
