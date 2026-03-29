import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let lastY = window.scrollY
    function onScroll() {
      const currentY = window.scrollY
      setHidden(currentY > lastY && currentY > 64)
      lastY = currentY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleLogIn() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      navigate('/account')
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/account' },
      })
    }
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-paw-cream/90 backdrop-blur-sm transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/dog-logo.png" alt="PawPath logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-2xl tracking-tight text-paw-red">PAWPATH</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/' ? 'text-paw-red' : 'text-gray-600 hover:text-paw-red'}`}>
            Home
          </Link>
          <a href="/#how-it-works" className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors">
            How It Works
          </a>
          <a href="/#features" className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors">
            Features
          </a>
          {user ? (
            <>
              <Link
                to="/account"
                className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
              >
                Hi, {displayName}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-paw-red transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogIn}
                className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/onboard')}
                className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill hover:bg-red-700 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          <div className="w-6 h-0.5 bg-gray-800 mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-gray-800 mb-1.5 transition-all" />
          <div className="w-6 h-0.5 bg-gray-800 transition-all" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-paw-cream px-6 py-4 flex flex-col gap-4">
          <Link to="/" className="text-sm font-semibold uppercase tracking-wide text-gray-700" onClick={() => setOpen(false)}>Home</Link>
          <a href="/#how-it-works" className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors" onClick={() => setOpen(false)}>How It Works</a>
          <a href="/#features" className="text-sm font-semibold uppercase tracking-wide text-gray-700" onClick={() => setOpen(false)}>Features</a>
          {user ? (
            <>
              <Link to="/account" className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill text-center hover:bg-red-700 transition-colors" onClick={() => setOpen(false)}>
                Hi, {displayName}
              </Link>
              <button onClick={() => { setOpen(false); handleSignOut() }} className="text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-paw-red transition-colors text-center">
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); handleLogIn() }} className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors text-center">
                Log In
              </button>
              <button onClick={() => { setOpen(false); navigate('/onboard') }} className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill text-center hover:bg-red-700 transition-colors">
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
