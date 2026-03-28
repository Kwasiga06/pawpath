import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dog, setDog] = useState(undefined)

  useEffect(() => {
    supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) navigate('/account', { replace: true })
        else setDog(data)
      })
  }, [id, navigate])

  if (dog === undefined) return null

  const ageLabel = dog.age || null

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Header */}
      <section className="bg-paw-cream px-6 py-16 border-b border-paw-pink">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/account')}
            className="text-xs font-semibold uppercase tracking-widest text-paw-blue hover:text-paw-red transition-colors mb-8 inline-block"
          >
            ← Back to account
          </button>
          <div className="flex items-center gap-6">
            {dog.image ? (
              <img src={dog.image} alt={dog.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-paw-pink flex items-center justify-center text-4xl">
                🐾
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Your pal</p>
              <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
                {dog.name}
              </h1>
              {dog.breed && <p className="text-gray-500 mt-1">{dog.breed}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Stats */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Details</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">About</h2>
          </div>
          <div className="bg-white rounded-3xl divide-y divide-gray-100">
            {ageLabel && (
              <div className="flex items-center justify-between px-8 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Age</p>
                <p className="text-sm text-gray-800">{ageLabel}</p>
              </div>
            )}
            {dog.breed && (
              <div className="flex items-center justify-between px-8 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Breed</p>
                <p className="text-sm text-gray-800">{dog.breed}</p>
              </div>
            )}
            {dog.weight != null && (
              <div className="flex items-center justify-between px-8 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Weight</p>
                <p className="text-sm text-gray-800">{dog.weight} kg</p>
              </div>
            )}
            {dog.vet_records && (
              <div className="flex items-center justify-between px-8 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vet records</p>
                <p className="text-sm text-gray-800">{dog.vet_records}</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
