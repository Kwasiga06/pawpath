import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useTransition } from '../lib/TransitionContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { transitionTo } = useTransition()

  function handleSectionNav(sectionId) {
    if (pathname === '/') {
      transitionTo(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 'bg-paw-cream')
    } else {
      transitionTo(() => {
        navigate('/')
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }, 'bg-paw-cream')
    }
  }

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
    transitionTo('/', 'bg-paw-cream')
  }

  async function handleLogIn() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      transitionTo('/account', 'bg-paw-cream')
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/account' },
      })
    }
  }

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]

  return (
    <>
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${pathname === '/onboard' ? 'bg-paw-red' : 'bg-paw-cream/90'}`}>
      {/* Full-width red strip at top of page */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-paw-red pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => transitionTo('/', 'bg-paw-cream')} className="flex items-center gap-2">
          <img src="/dog-logo.png" alt="PawPath logo" className={`h-8 w-8 object-contain transition-all ${pathname === '/onboard' ? 'brightness-0 invert' : ''}`} />
          <span className={`font-display text-2xl tracking-tight ${pathname === '/onboard' ? 'text-paw-cream' : 'text-paw-red'}`}>PAWPATH</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex self-stretch items-stretch gap-8">
          <button onClick={() => transitionTo('/', 'bg-paw-cream')} className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : pathname === '/' ? 'text-paw-red' : 'text-gray-600 hover:text-paw-red'}`}>
            Home
          </button>
          <button onClick={() => handleSectionNav('how-it-works')} className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : 'text-gray-600 hover:text-paw-red'}`}>
            How It Works
          </button>
          <button onClick={() => handleSectionNav('features')} className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : 'text-gray-600 hover:text-paw-red'}`}>
            Features
          </button>
          <button onClick={() => transitionTo('/vets', 'bg-paw-cream')} className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : pathname === '/vets' ? 'text-paw-red' : 'text-gray-600 hover:text-paw-red'}`}>
            Find a Vet
          </button>
          <button onClick={() => transitionTo('/history', 'bg-paw-cream')} className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : pathname === '/history' ? 'text-paw-red' : 'text-gray-600 hover:text-paw-red'}`}>
            History
          </button>
          {user ? (
            <>
              <button
                onClick={() => transitionTo('/account', 'bg-paw-cream')}
                className={`flex items-center text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : 'text-gray-600 hover:text-paw-red'}`}
              >
                Hi, {displayName}
              </button>
              <button
                onClick={handleSignOut}
                className="relative self-stretch mb-2 flex items-center justify-center text-sm font-semibold uppercase tracking-wide px-8 overflow-visible hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 120 74" fill="none" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M120 12L120 54C120 65.0457 111.046 74 100 74L20 74C8.95431 74 0 65.0457 0 54L0 12L0 8L0 0L120 0L120 8L120 12Z" fill={pathname === '/onboard' ? '#f3f3e9' : '#e33529'}/>
                </svg>
                <span className={`relative z-10 ${pathname === '/onboard' ? 'text-paw-red' : 'text-white'}`}>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogIn}
                className={`text-sm font-semibold uppercase tracking-wide transition-colors ${pathname === '/onboard' ? 'text-paw-cream hover:text-white' : 'text-gray-600 hover:text-paw-red'}`}
              >
                Log In
              </button>
              <button
                onClick={() => transitionTo('/onboard', 'bg-paw-red')}
                className="relative self-stretch mb-2 flex items-center justify-center text-white text-sm font-semibold uppercase tracking-wide px-8 overflow-visible hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 120 74" fill="none" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M120 12L120 54C120 65.0457 111.046 74 100 74L20 74C8.95431 74 0 65.0457 0 54L0 12L0 8L0 0L120 0L120 8L120 12Z" fill="#e33529"/>
                </svg>
                <span className="relative z-10">Sign Up</span>
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
          <button onClick={() => { setOpen(false); transitionTo('/', 'bg-paw-cream') }} className="text-sm font-semibold uppercase tracking-wide text-gray-700 text-left">Home</button>
          <button onClick={() => { setOpen(false); handleSectionNav('how-it-works') }} className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors text-left">How It Works</button>
          <button onClick={() => { setOpen(false); handleSectionNav('features') }} className="text-sm font-semibold uppercase tracking-wide text-gray-700 text-left">Features</button>
          <button onClick={() => { setOpen(false); transitionTo('/vets', 'bg-paw-cream') }} className="text-sm font-semibold uppercase tracking-wide text-gray-700 text-left">Find a Vet</button>
          <button onClick={() => { setOpen(false); transitionTo('/history', 'bg-paw-cream') }} className="text-sm font-semibold uppercase tracking-wide text-gray-700 text-left">History</button>
          {user ? (
            <>
              <button onClick={() => { setOpen(false); transitionTo('/account', 'bg-paw-cream') }} className="bg-paw-red text-white text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill text-center hover:bg-red-700 transition-colors">
                Hi, {displayName}
              </button>
              <button onClick={() => { setOpen(false); handleSignOut() }} className="text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-paw-red transition-colors text-center">
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setOpen(false); handleLogIn() }} className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-paw-red transition-colors text-center">
                Log In
              </button>
              <button onClick={() => { setOpen(false); transitionTo('/onboard', 'bg-paw-red') }} className="border-2 border-paw-red text-paw-red text-sm font-semibold uppercase tracking-wide px-6 py-2 rounded-pill text-center hover:bg-paw-red hover:text-white transition-colors">
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
    </>
  )
}
