const features = [
  {
    icon: '🧬',
    title: 'AI Breed Detection',
    description: 'Google Gemini Vision identifies your dog\'s breed from up to 3 photos — supports JPG, PNG, WEBP, and HEIC formats.',
    tag: 'AI Powered',
  },
  {
    icon: '⏱️',
    title: 'Walk Recommendations',
    description: 'Duration, distance, intensity, and tips per breed — all adjusted for live weather and AQI so every walk is safe and right-sized.',
    tag: 'Personalized',
  },
  {
    icon: '🌤️',
    title: 'Live Weather Bar',
    description: 'Real-time temperature, humidity, wind, and Air Quality Index with a walk score from 0–100 so you know before you go.',
    tag: 'Live Data',
  },
  {
    icon: '📍',
    title: 'Walk Route Map',
    description: 'Google Maps embed surfaces dog-friendly parks near your location so you always have somewhere great to walk.',
    tag: 'Google Maps',
  },
  {
    icon: '🏥',
    title: 'Vet Finder',
    description: 'Search by address to find nearby veterinary clinics with ratings, open/closed hours, and a direct link to their website.',
    tag: 'Google Places',
  },
  {
    icon: '🐾',
    title: 'Dog Profiles',
    description: 'Save your dogs with photos, breed, age, and weight. Manage multiple dogs from one account with Supabase-backed storage.',
    tag: 'Profiles',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-paw-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">Everything you need</p>
          <h2 className="font-display text-6xl md:text-7xl uppercase tracking-tight text-ink">
            Built for your <span className="text-paw-red">dog</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-8 hover:-translate-y-1 transition-transform duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{f.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-paw-blue bg-paw-blue-light/30 px-3 py-1 rounded-pill">
                  {f.tag}
                </span>
              </div>
              <h3 className="font-display text-2xl uppercase tracking-tight text-ink mb-2">
                {f.title}
              </h3>
              <p className="text-ink-mid text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
