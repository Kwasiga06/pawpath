import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function Account() {
  const [user, setUser] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) navigate('/', { replace: true })
    })
  }, [navigate])

  if (user === undefined) return null

  const displayName = user.user_metadata?.full_name || user.email
  const avatar = user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen bg-paw-cream pt-16">
      {/* Header */}
      <section className="bg-paw-cream px-6 py-16 border-b border-paw-pink">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          {avatar ? (
            <img src={avatar} alt="avatar" referrerPolicy="no-referrer" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-paw-pink flex items-center justify-center text-2xl">
              🐾
            </div>
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Your account</p>
            <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight text-gray-900">
              {displayName}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* My Dogs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Your pals</p>
              <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">My Dogs</h2>
            </div>
            <button className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors">
              + Add Dog
            </button>
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center">
            <span className="text-6xl mb-4">🐕</span>
            <h3 className="font-display text-2xl uppercase tracking-tight text-gray-900 mb-2">No dogs yet</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Add your dog to get personalized walk recommendations tailored to their breed and age.
            </p>
          </div>
        </section>

        {/* Settings */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-1">Preferences</p>
            <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">Settings</h2>
          </div>

          <div className="bg-white rounded-3xl divide-y divide-gray-100">
            {/* Email row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
                <p className="text-sm text-gray-800">{user.email}</p>
              </div>
            </div>

            {/* Units row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Distance units</p>
                <p className="text-sm text-gray-800">Kilometres</p>
              </div>
              <button className="text-xs font-semibold uppercase tracking-wide text-paw-blue hover:text-paw-red transition-colors">
                Change
              </button>
            </div>

            {/* Notifications row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Walk reminders</p>
                <p className="text-sm text-gray-800">Off</p>
              </div>
              <button className="text-xs font-semibold uppercase tracking-wide text-paw-blue hover:text-paw-red transition-colors">
                Enable
              </button>
            </div>

            {/* Sign out row */}
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Session</p>
                <p className="text-sm text-gray-800">Signed in with Google</p>
              </div>
              <button
                onClick={() => supabase.auth.signOut().then(() => navigate('/'))}
                className="text-xs font-semibold uppercase tracking-wide text-paw-red hover:text-red-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Account
