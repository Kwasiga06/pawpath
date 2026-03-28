import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-paw-cream overflow-hidden flex items-center pt-16">
      {/* Decorative circles */}
      <div className="absolute top-24 left-8 w-20 h-20 rounded-full bg-paw-red opacity-20" />
      <div className="absolute bottom-24 left-16 w-10 h-10 rounded-full bg-paw-blue opacity-30" />
      <div className="absolute top-40 right-12 w-14 h-14 rounded-full bg-paw-pink-mid opacity-60" />
      <div className="absolute bottom-32 right-8 w-8 h-8 rounded-full bg-paw-red opacity-25" />

      <div className="max-w-7xl mx-auto px-6 w-full py-16 grid grid-cols-[1fr_2fr_1fr] gap-4 items-center">

        {/* Left: heading */}
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight text-gray-900 uppercase text-left">
          Find<br />Your<br />Path
        </h1>

        {/* Center: Dog image */}
        <div className="relative flex justify-center">
          <img src="/hero-dog.png" alt="Dog" className="w-full h-auto object-contain" />
          {/* Floating breed badge */}
          <div className="absolute bottom-4 left-0 bg-paw-red text-white rounded-2xl shadow-lg px-4 py-3">
            <p className="text-xs uppercase tracking-wide opacity-80">Detected breed</p>
            <p className="text-sm font-bold">Bernese Mountain</p>
          </div>
        </div>

        {/* Right: heading + description + buttons */}
        <div className="text-right flex flex-col gap-6">
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight text-paw-red uppercase">
            In Less<br />Than 5<br />Minutes
          </h1>
          <p className="text-base text-gray-600 leading-relaxed text-left">
            Upload a photo of your dog. We'll detect their breed, recommend the perfect walk duration,
            and find the best route based on today's weather and air quality.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/planner"
              className="bg-paw-red text-white font-semibold uppercase tracking-wide px-6 py-3 rounded-pill hover:bg-red-700 transition-all hover:scale-105 text-sm text-center"
            >
              Plan My Walk
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-800 text-gray-800 font-semibold uppercase tracking-wide px-6 py-3 rounded-pill hover:bg-gray-800 hover:text-white transition-all text-sm text-center"
            >
              How It Works
            </a>
          </div>
        </div>

      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs uppercase tracking-widest text-gray-400">Scroll</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
