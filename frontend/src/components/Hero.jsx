
export default function Hero() {
  return (
    <section className="relative min-h-screen bg-paw-cream overflow-hidden flex items-center pt-10">
      {/* Decorative circles */}
      <div className="absolute w-20 h-20 rounded-full bg-paw-red opacity-20" style={{ top: '25rem', left: '2rem' }} />
      <div className="absolute w-10 h-10 rounded-full bg-paw-blue opacity-30" style={{ bottom: '6rem', left: '4rem' }} />
      <div className="absolute w-14 h-14 rounded-full bg-paw-pink-mid opacity-60" style={{ top: '10rem', right: '3rem' }} />
      <div className="absolute w-8 h-8 rounded-full bg-paw-red opacity-25" style={{ bottom: '8rem', right: '2rem' }} />

      {/* Mobile layout */}
      <div className="md:hidden max-w-7xl mx-auto px-6 w-full py-6 flex flex-col items-center gap-6">
        {/* Heading */}
        <h1 className="font-display text-5xl leading-none tracking-tight uppercase text-center">
          <span className="text-ink">Find Your Path </span>
          <span className="text-paw-red">In Less Than 5 Minutes</span>
        </h1>

        {/* Dog image + badge */}
        <div className="relative w-full flex justify-center">
          <img src="/hero-dog.png" alt="Dog" className="w-4/5 h-auto object-contain" />
          <div className="absolute bottom-4 left-4 bg-paw-red text-white rounded-2xl shadow-lg px-4 py-3">
            <p className="text-xs uppercase tracking-wide opacity-80">Detected breed</p>
            <p className="text-sm font-bold">Bernese Mountain</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-ink-mid leading-relaxed text-center">
          Upload a photo of your dog. We'll detect their breed, recommend the perfect walk duration,
          and find the best route based on today's weather and air quality.
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid max-w-7xl mx-auto px-6 w-full py-6 grid-cols-[1fr_2fr_1fr] gap-4 items-center">

        {/* Left: heading */}
        <h1 className="font-display text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight text-ink uppercase text-left self-start pt-8">
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
          <p className="text-base text-ink-mid leading-relaxed text-left">
            Upload a photo of your dog. We'll detect their breed, recommend the perfect walk duration,
            and find the best route based on today's weather and air quality.
          </p>
        </div>

      </div>

    </section>
  )
}
