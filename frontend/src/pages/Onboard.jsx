import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const STEP_UPLOAD = 'upload'
const STEP_FORM = 'form'

export default function Onboard() {
  const [step, setStep] = useState(STEP_UPLOAD)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    breed: '',
    size: '',
    weight: '',
    age: '',
  })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // If already logged in, skip onboarding
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/account', { replace: true })
    })
  }, [navigate])

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setPreview(URL.createObjectURL(file))
    setError(null)
    setDetecting(true)

    try {
      const formData = new FormData()
      formData.append('file1', file)
      const res = await fetch('http://localhost:8000/api/identify', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Detection failed')
      const data = await res.json()
      setForm({
        name: '',
        breed: data.breed ?? '',
        size: data.size_category ?? '',
        weight: data.estimated_weight_lbs ?? '',
        age: data.estimated_age_years ?? '',
      })
      setStep(STEP_FORM)
    } catch {
      setError('Could not detect breed — fill in the details manually.')
      setForm({ name: '', breed: '', size: '', weight: '', age: '' })
      setStep(STEP_FORM)
    } finally {
      setDetecting(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleContinue() {
    localStorage.setItem('pending_dog', JSON.stringify({
      name: form.name,
      breed: form.breed,
      size: form.size,
      weight: form.weight,
      age: form.age,
    }))
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/account' },
    })
  }

  return (
    <div className="min-h-screen bg-paw-cream flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-paw-blue mb-2">Welcome to PawPath</p>
          <h1 className="font-display text-5xl uppercase tracking-tight text-gray-900">
            {step === STEP_UPLOAD ? "Let's Meet Your Dog" : 'Confirm Your Dog'}
          </h1>
          <p className="text-gray-500 mt-3 text-sm">
            {step === STEP_UPLOAD
              ? "Upload a photo and we'll identify your dog's breed automatically."
              : 'Check the details below — edit anything that looks off.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-8 h-8 rounded-full bg-paw-red text-white flex items-center justify-center text-xs font-bold">1</div>
          <div className={`h-0.5 w-12 transition-colors ${step === STEP_FORM ? 'bg-paw-red' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === STEP_FORM ? 'bg-paw-red text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        </div>

        {/* Step 1: Upload */}
        {step === STEP_UPLOAD && (
          <div className="bg-white rounded-3xl p-8">
            <div
              className={`border-2 border-dashed rounded-2xl transition-colors cursor-pointer
                ${dragging ? 'border-paw-red bg-paw-pink/20' : 'border-gray-200 hover:border-paw-red'}
                ${preview ? 'border-solid border-paw-red' : ''}
              `}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !detecting && inputRef.current?.click()}
            >
              {detecting ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-10 h-10 border-4 border-paw-red border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 uppercase tracking-widest">Detecting breed...</p>
                </div>
              ) : preview ? (
                <img src={preview} alt="Dog" className="w-full max-h-72 object-cover rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-paw-pink rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🐶</span>
                  </div>
                  <p className="font-semibold text-gray-700 mb-1">Drop a photo here or click to browse</p>
                  <p className="text-sm text-gray-400">JPG, PNG, WEBP accepted</p>
                </div>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-paw-red text-center">{error}</p>}

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

            {!preview && !detecting && (
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 w-full bg-paw-red text-white font-semibold uppercase tracking-wide py-3 rounded-pill hover:bg-red-700 transition-colors"
              >
                Choose Photo
              </button>
            )}
          </div>
        )}

        {/* Step 2: Editable form + Google sign in */}
        {step === STEP_FORM && (
          <div className="bg-white rounded-3xl p-8 flex flex-col gap-5">
            {error && <p className="text-sm text-paw-red text-center">{error}</p>}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Dog's Name</label>
              <input
                type="text"
                placeholder="e.g. Buddy"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Breed</label>
              <input
                type="text"
                value={form.breed}
                onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Size</label>
                <select
                  value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
                >
                  <option value="">Select</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Est. Weight (lbs)</label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Est. Age (years)</label>
              <input
                type="text"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-paw-red"
              />
            </div>

            <button
              onClick={handleContinue}
              className="mt-2 w-full bg-paw-red text-white font-semibold uppercase tracking-wide py-3 rounded-pill hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => { setStep(STEP_UPLOAD); setPreview(null); setError(null) }}
              className="text-xs text-gray-400 hover:text-paw-red transition-colors uppercase tracking-wide text-center"
            >
              ← Use a different photo
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
