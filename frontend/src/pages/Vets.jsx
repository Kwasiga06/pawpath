import { useState } from 'react'

export default function Vets() {
  const [address, setAddress] = useState('')
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const res = await fetch(`/api/vets?address=${encodeURIComponent(address)}`)
      if (!res.ok) throw new Error('Failed to fetch vets')
      const data = await res.json()
      setVets(data)
    } catch {
      setError('Could not find vets. Please try again.')
      setVets([])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Header */}
      <div className="bg-white border-b border-paw-pink px-6 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">Healthcare</p>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
          Find a <span className="text-paw-red">Vet</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Enter an address to find nearby veterinary clinics.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Search box */}
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter an address or city..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-paw-red text-white font-semibold uppercase tracking-wide px-6 py-3 rounded-pill hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-paw-red font-semibold text-center mb-6">{error}</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-10 h-10 border-4 border-paw-red border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 uppercase tracking-widest">Finding nearby vets...</p>
          </div>
        )}

        {/* No results */}
        {!loading && searched && vets.length === 0 && !error && (
          <div className="bg-white rounded-3xl p-10 text-center">
            <span className="text-5xl">🏥</span>
            <p className="mt-4 font-display text-2xl uppercase tracking-tight text-gray-700">No vets found</p>
            <p className="text-sm text-gray-400 mt-2">Try a different address.</p>
          </div>
        )}

        {/* Results */}
        {!loading && vets.length > 0 && (
          <div className="flex flex-col gap-4">
            {vets.map((vet, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-tight text-gray-900">{vet.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{vet.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {vet.rating && (
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-pill">
                          ⭐ {vet.rating}
                        </span>
                      )}
                      {vet.open_now !== null && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${vet.open_now ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {vet.open_now ? 'Open Now' : 'Closed'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-3xl">🏥</span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(vet.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-paw-blue text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-pill hover:bg-blue-700 transition-colors"
                  >
                    Get Directions
                  </a>
                  {vet.website && (
                    <a
                      href={vet.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-paw-red text-white text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-pill hover:bg-red-700 transition-colors"
                    >
                      Book Online
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
