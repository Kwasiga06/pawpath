import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: '01',
    icon: '📸',
    title: 'Snap a Photo',
    description: 'Upload a picture of your dog. Our AI instantly identifies their breed with high accuracy.',
    color: 'bg-paw-pink',
  },
  {
    number: '02',
    icon: '🌦️',
    title: 'We Check Conditions',
    description: 'We pull real-time weather and air quality data for your location to find the safest time to walk.',
    color: 'bg-paw-blue-light',
  },
  {
    number: '03',
    icon: '🗺️',
    title: 'Get Your Route',
    description: "Receive a custom Google Maps walking route tailored to your dog's breed, energy level, and today's conditions.",
    color: 'bg-paw-pink-mid',
  },
]

function StepCard({ step }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div className={`${step.color} rounded-3xl p-8 h-full transition-transform group-hover:-translate-y-2 duration-300`}>
        <div className="flex items-start justify-between mb-6">
          <span className="text-5xl">{step.icon}</span>
          <span className="font-display text-6xl text-black/10">{step.number}</span>
        </div>
        <h3 className="font-display text-3xl uppercase tracking-tight text-gray-900 mb-3">
          {step.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-paw-blue mb-3">Simple process</p>
          <h2 className="font-display text-6xl md:text-7xl uppercase tracking-tight text-gray-900">
            How it <span className="text-paw-red">works</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  )
}
