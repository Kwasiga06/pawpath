import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-paw-cream overflow-hidden flex items-center pt-16">
      {/* Decorative circles */}
      <div className="absolute top-24 left-8 w-20 h-20 rounded-full bg-paw-red opacity-20" />
      <div className="absolute bottom-24 left-16 w-10 h-10 rounded-full bg-paw-blue opacity-30" />
      <div className="absolute top-40 right-12 w-14 h-14 rounded-full bg-paw-pink-mid opacity-60" />
      <div className="absolute bottom-32 right-8 w-8 h-8 rounded-full bg-paw-red opacity-25" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full py-16">
        {/* Left: Text */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-4">
            Smart walks for happy dogs
          </p>
          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl leading-none tracking-tight text-gray-900 uppercase mb-6">
            A tired dog is<br />
            <span className="text-paw-red">a happy dog!</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md mb-10 leading-relaxed">
            Upload a photo of your dog. We'll detect their breed, recommend the perfect walk duration,
            and find the best route based on today's weather and air quality.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/planner"
              className="bg-paw-red text-white font-semibold uppercase tracking-wide px-8 py-4 rounded-pill hover:bg-red-700 transition-all hover:scale-105 text-sm"
            >
              Plan My Walk
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-800 text-gray-800 font-semibold uppercase tracking-wide px-8 py-4 rounded-pill hover:bg-gray-800 hover:text-white transition-all text-sm"
            >
              How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14">
            <div>
              <p className="font-display text-4xl text-paw-red">150+</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Breeds supported</p>
            </div>
            <div>
              <p className="font-display text-4xl text-paw-red">Live</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Weather & AQI data</p>
            </div>
            <div>
              <p className="font-display text-4xl text-paw-red">AI</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Powered routes</p>
            </div>
          </div>
        </div>

        {/* Right: Hero image placeholder */}
        <div className="relative flex justify-center">
          <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
            {/* Circular background blob */}
            <div className="absolute inset-0 rounded-full bg-paw-pink opacity-70" />
            {/* Dog emoji placeholder - replace with real image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[180px] md:text-[220px] select-none">🐕</span>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🌤️</span>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Today's condition</p>
              <p className="text-sm font-bold text-gray-800">Great for a walk!</p>
            </div>
          </div>

          {/* Floating breed badge */}
          <div className="absolute bottom-8 left-0 bg-paw-red text-white rounded-2xl shadow-lg px-4 py-3">
            <p className="text-xs uppercase tracking-wide opacity-80">Detected breed</p>
            <p className="text-sm font-bold">Golden Retriever</p>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs uppercase tracking-widest text-gray-400">Scroll</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
