import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import BreedUploader from '../components/planner/BreedUploader'
import WalkRecommendations from '../components/planner/WalkRecommendations'
import MapView from '../components/planner/MapView'
import WeatherBar from '../components/planner/WeatherBar'

export default function Planner() {
  const [breed, setBreed] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [userId, setUserId] = useState(null)
  const resultsRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/'); return }
      setUserId(session.user.id)
    })
  }, [])

  function handleAnalysisStart() {
    setAnalyzing(true)
  }

  async function handleBreedDetected(result) {
    const detectedBreed = result?.breed ?? null
    setBreed(detectedBreed)
    setAnalyzing(false)

    if (detectedBreed && userId) {
      await supabase.from('dogs').insert({
        owner_id: userId,
        breed: detectedBreed,
        size: result.size_category ?? null,
      })
    }

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
          Upload a photo of your dog to get started. We'll detect their breed and build a personalized walk plan based on today's conditions.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Weather bar */}
        <WeatherBar />

        {/* Upload section */}
        <BreedUploader onBreedDetected={handleBreedDetected} onAnalysisStart={handleAnalysisStart} analyzing={analyzing} />

        {/* Results */}
        {(analyzing || breed) && (
          <div ref={resultsRef}>
            {analyzing ? (
              <div className="bg-white rounded-3xl p-12 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-paw-red border-t-transparent rounded-full animate-spin" />
                <p className="font-display text-2xl uppercase tracking-tight text-gray-700">Analyzing your dog...</p>
                <p className="text-gray-400 text-sm">Detecting breed and fetching conditions</p>
              </div>
            ) : (
              <>
                <WalkRecommendations breed={breed} />
                <MapView breed={breed} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
