import { useState, useRef } from 'react'

export default function BreedUploader({ onBreedDetected, onAnalysisStart, analyzing }) {
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setError(null)
    onAnalysisStart()

    try {
      const formData = new FormData()
      formData.append('file1', file)
      const res = await fetch('http://localhost:8000/api/identify', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Detection failed')
      const data = await res.json()
      onBreedDetected(data.breed)
    } catch (err) {
      setError('Could not detect breed. Please try again.')
      onBreedDetected(null)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function handleChange(e) {
    handleFile(e.target.files[0])
  }

  return (
    <div className="bg-white rounded-3xl p-8">
      <h2 className="font-display text-3xl uppercase tracking-tight text-gray-900 mb-6">
        📸 Upload Your Dog's Photo
      </h2>

      <div
        className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer
          ${dragging ? 'border-paw-red bg-paw-pink/20' : 'border-gray-200 hover:border-paw-red'}
          ${preview ? 'border-solid border-paw-red' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !analyzing && inputRef.current?.click()}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded dog"
              className="w-full max-h-80 object-cover rounded-2xl"
            />
            {!analyzing && (
              <button
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-pill shadow transition-colors"
                onClick={(e) => { e.stopPropagation(); setPreview(null) }}
              >
                Change photo
              </button>
            )}
          </div>
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <p className="mt-3 text-sm text-paw-red font-semibold text-center">{error}</p>
      )}

      {!preview && (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-4 w-full bg-paw-red text-white font-semibold uppercase tracking-wide py-3 rounded-pill hover:bg-red-700 transition-colors"
        >
          Choose Photo
        </button>
      )}
    </div>
  )
}
