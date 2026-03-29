import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import WalkRecommendations from '../components/planner/WalkRecommendations'
import WeatherBar from '../components/planner/WeatherBar'
import MapView from '../components/planner/MapView'
import BreedUploader from '../components/planner/BreedUploader'
import LiveWalkTracker from '../components/planner/LiveWalkTracker'

export default function Planner() {
  const [breed, setBreed] = useState(null)
  const [selectedDog, setSelectedDog] = useState(null)
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [originCoords, setOriginCoords] = useState(null)
  const [walkTrackerOpen, setWalkTrackerOpen] = useState(false)
  const [weather, setWeather] = useState(null)
  const resultsRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate('/'); return }
      const { data } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', session.user.id)
      setDogs(data ?? [])
      setLoading(false)
    })
  }, [])

  async function fetchRoute(dog, overrideBreed) {
    const effectiveBreed = overrideBreed ?? dog.breed ?? ''
    setRouteData(null)
    setRouteError(null)
    setRouteLoading(true)
    try {
      const coords = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not supported'))
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
          () => reject(new Error('Location access denied'))
        )
      })
      setOriginCoords(coords)
      const highHeat = ['French Bulldog', 'Bulldog', 'Shih Tzu', 'Pug', 'Boston Terrier', 'Boxer', 'Brachycephalic']
      const lowHeat = ['Siberian Husky', 'Alaskan Malamute', 'Bernese Mountain Dog', 'Samoyed']
      const heat_sensitivity = highHeat.some(b => effectiveBreed.includes(b)) ? 'high'
        : lowHeat.some(b => effectiveBreed.includes(b)) ? 'low'
        : 'moderate'

      // Duration lookup by breed — used to size the search radius so the loop
      // fills the recommended walk time, not just whatever park is nearby
      const breedDurations = {
        'Golden Retriever': 60, 'Labrador Retriever': 60, 'German Shepherd': 60,
        'Rottweiler': 60, 'French Bulldog': 20, 'Bulldog': 20, 'Shih Tzu': 20,
        'Yorkshire Terrier': 20, 'Chihuahua': 20, 'Dachshund': 25, 'Poodle': 45,
        'Beagle': 45, 'Siberian Husky': 90, 'Border Collie': 90, 'Australian Shepherd': 75,
      }
      const target_duration_mins = breedDurations[effectiveBreed] ?? 30

      const res = await fetch(
        `/api/walks/routes?origin_lat=${coords.lat}&origin_lng=${coords.lng}&target_duration_mins=${target_duration_mins}&heat_sensitivity=${heat_sensitivity}`
      )
      if (!res.ok) throw new Error('Could not generate route')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setRouteData(data)
    } catch (e) {
      setRouteError(e.message)
    } finally {
      setRouteLoading(false)
    }
  }

  function handleSelectDog(dog) {
    setSelectedDog(dog)
    setBreed(dog.breed ?? null)
    if (dog.breed) fetchRoute(dog)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Page Header */}
      <div className="bg-white border-b border-paw-pink px-6 py-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">Let's get walking</p>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
          Plan Your <span className="text-paw-red">Walk</span>
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Select your dog below to get a personalized walk plan based on today's conditions.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Weather bar */}
        <WeatherBar onWeatherLoaded={setWeather} />

        {/* Dog selector */}
        <div className="bg-white rounded-3xl p-8">
          <h2 className="font-display text-3xl uppercase tracking-tight text-gray-900 mb-6">
            Select Your Dog
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-paw-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dogs.length === 0 ? (
            <div className="flex flex-col items-center text-center py-10 gap-4">
              <span className="text-5xl">🐕</span>
              <p className="text-gray-500 text-sm">You haven't added any dogs yet.</p>
              <button
                onClick={() => navigate('/onboard')}
                className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
              >
                Add Your First Dog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => handleSelectDog(dog)}
                  className={`flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all
                    ${selectedDog?.id === dog.id
                      ? 'border-paw-red bg-paw-pink/10'
                      : 'border-gray-100 hover:border-paw-red hover:shadow-sm'
                    }`}
                >
                  {dog.image ? (
                    <img src={dog.image} alt={dog.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-paw-pink flex items-center justify-center text-2xl flex-shrink-0">
                      🐾
                    </div>
                  )}
                  <div>
                    <p className="font-display text-xl uppercase tracking-tight text-gray-900">{dog.name || 'Unnamed'}</p>
                    {dog.breed && <p className="text-sm text-gray-500">{dog.breed}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {selectedDog && !breed && (
          <div ref={resultsRef}>
            <BreedUploader
              analyzing={false}
              onAnalysisStart={() => {}}
              onBreedDetected={(data) => {
                if (data?.breed) {
                  setBreed(data.breed)
                  fetchRoute(selectedDog, data.breed)
                }
              }}
            />
          </div>
        )}
        {breed && (
          <div ref={resultsRef} className="space-y-6">
            <WalkRecommendations breed={breed} weather={weather} routeData={routeData} routeLoading={routeLoading} routeError={routeError} />
            <MapView routeData={routeData} routeLoading={routeLoading} breed={breed} originCoords={originCoords} />

            {/* Start Walk CTA */}
            <div className="bg-white rounded-3xl p-8 text-center">
              <button
                onClick={() => setWalkTrackerOpen(true)}
                className="bg-paw-red text-white font-display text-2xl uppercase tracking-widest px-14 py-5 rounded-2xl hover:bg-red-700 transition-colors"
              >
                Start Walk
              </button>
              <p className="text-gray-400 text-sm mt-3">
                Tracks your live route and saves to history
              </p>
            </div>
          </div>
        )}
      </div>

      {walkTrackerOpen && selectedDog && (
        <LiveWalkTracker
          dog={selectedDog}
          parkName={routeData?.destination?.name ?? null}
          onClose={() => setWalkTrackerOpen(false)}
        />
      )}
    </div>
  )
}
