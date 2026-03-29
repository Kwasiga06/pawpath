import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dog() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dog, setDog] = useState(undefined)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const photoInputRef = useRef(null)

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

  function startEditing() {
    setEditForm({ name: dog.name || '', breed: dog.breed || '', age: dog.age || '', weight: dog.weight ?? '' })
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = {
        name: editForm.name.trim(),
        breed: editForm.breed.trim() || null,
        age: editForm.age.trim() || null,
        weight: editForm.weight !== '' ? Number(editForm.weight) : null,
      }
      const { error } = await supabase.from('dogs').update(updates).eq('id', dog.id)
      if (error) throw error
      setDog(d => ({ ...d, ...updates }))
      setEditing(false)
    } catch (e) {
      console.error('Save failed:', e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (dog.image) {
      const path = dog.image.split('/dog-photos/')[1]
      if (path) await supabase.storage.from('dog-photos').remove([path])
    }
    await supabase.from('dogs').delete().eq('id', dog.id)
    navigate('/account', { replace: true })
  }

  async function handlePhotoChange(file) {
    if (!file || (!file.type.startsWith('image/') && !file.name.toLowerCase().match(/\.(heic|heif)$/))) return
    setUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${dog.id}/profile.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('dog-photos').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('dogs')
        .update({ image: publicUrl })
        .eq('id', dog.id)
      if (updateError) throw updateError

      setDog(d => ({ ...d, image: publicUrl }))
    } catch (e) {
      console.error('Photo upload failed:', e)
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (dog === undefined) return null

  const ageLabel = dog.age || null

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Header */}
      <section className="bg-paw-cream px-6 py-16 border-b border-paw-pink">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/account')}
              className="text-xs font-semibold uppercase tracking-widest text-paw-blue hover:text-paw-red transition-colors"
            >
              ← Back to account
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={editing ? () => setEditing(false) : startEditing}
                className="text-xs font-semibold uppercase tracking-widest text-paw-blue hover:text-paw-red transition-colors"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                className={`text-xs font-semibold uppercase tracking-widest transition-colors ${confirmDelete ? 'text-white bg-paw-red px-4 py-2 rounded-pill hover:bg-red-700' : 'text-gray-400 hover:text-paw-red'}`}
              >
                {confirmDelete ? 'Tap again to confirm' : 'Delete dog'}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Clickable avatar */}
            <button
              onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full flex-shrink-0 group focus:outline-none"
              title="Change photo"
            >
              {dog.image ? (
                <img src={dog.image} alt={dog.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-paw-pink flex items-center justify-center text-4xl">
                  🐾
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingPhoto ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={e => handlePhotoChange(e.target.files[0])}
            />

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

        {/* Stats / Edit */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Details</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">About</h2>
          </div>

          {editing ? (
            <div className="bg-white rounded-3xl divide-y divide-gray-100">
              {[
                { label: 'Name', key: 'name', type: 'text', placeholder: 'Dog\'s name' },
                { label: 'Breed', key: 'breed', type: 'text', placeholder: 'e.g. Labrador' },
                { label: 'Age', key: 'age', type: 'text', placeholder: 'e.g. 3 years' },
                { label: 'Weight (lbs)', key: 'weight', type: 'number', placeholder: 'e.g. 30' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="flex items-center justify-between px-8 py-5 gap-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0">{label}</p>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="text-sm text-gray-800 text-right bg-transparent border-b border-gray-200 focus:border-paw-blue outline-none w-full max-w-xs"
                  />
                </div>
              ))}
              <div className="px-8 py-5">
                <button
                  onClick={handleSave}
                  disabled={saving || !editForm.name.trim()}
                  className="w-full bg-paw-blue text-white text-xs font-semibold uppercase tracking-widest py-3 rounded-pill hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
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
                  <p className="text-sm text-gray-800">{dog.weight} lbs</p>
                </div>
              )}
              {dog.vet_records && (
                <div className="flex items-center justify-between px-8 py-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Vet records</p>
                  <p className="text-sm text-gray-800">{dog.vet_records}</p>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
