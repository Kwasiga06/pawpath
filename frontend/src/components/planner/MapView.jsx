// Google Maps embed - replace YOUR_API_KEY with a real key
// The map generates a walking route centered on a default location
// In production, use the user's geolocation and Google Maps Directions API

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

// Mock waypoints for a dog-friendly walking loop (LA example)
// Replace with dynamically generated waypoints from Google Maps Directions API
const DEFAULT_MAP_URL = `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=Griffith+Park,Los+Angeles,CA&destination=Griffith+Park,Los+Angeles,CA&waypoints=Fern+Dell+Nature+Museum,Los+Angeles,CA|Vermont+Canyon+Tennis+Courts,Los+Angeles,CA&mode=walking`

export default function MapView({ breed }) {
  const hasKey = GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY'

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
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-paw-blue text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-pill hover:bg-blue-700 transition-colors"
        >
          Open in Maps
        </a>
      </div>

      {/* Map embed */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-paw-cream">
        {hasKey ? (
          <iframe
            title="Dog Walking Route"
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={DEFAULT_MAP_URL}
          />
        ) : (
          // Placeholder shown until a real API key is added
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-center px-6">
            <span className="text-6xl">🗺️</span>
            <div>
              <p className="font-display text-2xl uppercase tracking-tight text-gray-700 mb-2">
                Map Coming Soon
              </p>
              <p className="text-sm text-gray-400 max-w-sm">
                Add your Google Maps API key to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">MapView.jsx</code> to display a custom walking route for your {breed}.
              </p>
            </div>
            <a
              href="https://developers.google.com/maps/documentation/embed/get-api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-paw-blue text-white text-xs font-semibold uppercase tracking-wide px-5 py-2 rounded-pill hover:bg-blue-700 transition-colors"
            >
              Get a Maps API Key
            </a>
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
