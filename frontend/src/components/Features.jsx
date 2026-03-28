const features = [
  {
    icon: '🧬',
    title: 'Breed Intelligence',
    description: 'Every breed has unique exercise needs. A Husky needs far more activity than a Bulldog. We tailor every recommendation to your specific dog.',
    tag: 'AI Powered',
  },
  {
    icon: '⏱️',
    title: 'Walk Duration',
    description: 'Get exact walk time recommendations based on your dog\'s breed, size, and age — so you never under or over-exercise them.',
    tag: 'Personalized',
  },
  {
    icon: '🌫️',
    title: 'Air Quality Alerts',
    description: 'High AQI days can be dangerous for dogs, especially brachycephalic breeds. We warn you before you step outside.',
    tag: 'Live Data',
  },
  {
    icon: '🌡️',
    title: 'Weather Safety',
    description: 'Too hot for paw pads? Too cold for short-haired breeds? We factor in real-time temperature, humidity, and UV index.',
    tag: 'Real-time',
  },
  {
    icon: '📍',
    title: 'Custom Routes',
    description: 'Google Maps integration generates a route optimized for your walk duration — finding parks, avoiding traffic, and keeping it interesting.',
    tag: 'Google Maps',
  },
  {
    icon: '🐾',
    title: 'Breed Health Tips',
    description: 'Get breed-specific health insights so you know the warning signs to watch for on your walk.',
    tag: 'Education',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-paw-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">Everything you need</p>
          <h2 className="font-display text-6xl md:text-7xl uppercase tracking-tight text-gray-900">
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
              <h3 className="font-display text-2xl uppercase tracking-tight text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
