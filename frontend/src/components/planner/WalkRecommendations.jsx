// Breed-specific walk data - replace with real backend/AI response
const breedData = {
  default: { duration: 30, distance: 1.5, intensity: 'Moderate', tips: ['Watch for overheating', 'Bring water'], emoji: '🐕' },
  'Golden Retriever': { duration: 60, distance: 3, intensity: 'High', tips: ['Loves fetch stops', 'Great swimmer — look for water parks', 'Needs mental stimulation too'], emoji: '🦮' },
  'Labrador Retriever': { duration: 60, distance: 3, intensity: 'High', tips: ['High energy — longer routes preferred', 'Loves water', 'Watch weight — they love food'], emoji: '🐕‍🦺' },
  'German Shepherd': { duration: 60, distance: 4, intensity: 'Very High', tips: ['Needs daily vigorous exercise', 'Great for trail runs', 'Mental exercise as important as physical'], emoji: '🐕' },
  'French Bulldog': { duration: 20, distance: 0.8, intensity: 'Low', tips: ['Avoid heat — prone to overheating', 'Short frequent walks better than long ones', 'Never walk in temps above 75°F'], emoji: '🐾' },
  'Bulldog': { duration: 20, distance: 0.75, intensity: 'Low', tips: ['Very heat sensitive', 'Early morning or evening walks only', 'Monitor breathing closely'], emoji: '🐾' },
  'Poodle': { duration: 45, distance: 2, intensity: 'Moderate', tips: ['Highly intelligent — vary the route', 'Enjoy fetch and agility', 'Good in most weather'], emoji: '🐩' },
  'Beagle': { duration: 45, distance: 2.5, intensity: 'Moderate', tips: ['Strong nose — expect lots of sniffing', 'Keep on leash — may follow scents', 'Loves exploring new paths'], emoji: '🐕' },
  'Rottweiler': { duration: 60, distance: 3.5, intensity: 'High', tips: ['Needs structured exercise', 'Great for long steady walks', 'Combine with training commands'], emoji: '🐕' },
  'Yorkshire Terrier': { duration: 20, distance: 1, intensity: 'Low', tips: ['Small legs tire quickly', 'Protect from cold — consider a jacket', 'Enjoy exploring at their own pace'], emoji: '🐕' },
  'Dachshund': { duration: 25, distance: 1, intensity: 'Low-Moderate', tips: ['Short legs, big heart', 'Avoid stairs and steep hills — back health', 'Good sniffer — enjoy sniff walks'], emoji: '🌭' },
  'Siberian Husky': { duration: 90, distance: 5, intensity: 'Very High', tips: ['Built for endurance — loves long distances', 'Thrives in cold weather', 'Will pull — use harness'], emoji: '🐺' },
  'Shih Tzu': { duration: 20, distance: 0.75, intensity: 'Low', tips: ['Brachycephalic — watch breathing', 'Sensitive to heat and humidity', 'Enjoy leisurely strolls'], emoji: '🐕' },
  'Border Collie': { duration: 90, distance: 5, intensity: 'Very High', tips: ['Extremely high energy — needs vigorous exercise', 'Mental challenges as important as physical', 'Great for agility trails'], emoji: '🐕' },
  'Chihuahua': { duration: 20, distance: 0.5, intensity: 'Low', tips: ['Tiny but spunky', 'Cold sensitive — use a jacket under 60°F', 'Multiple short walks better than one long one'], emoji: '🐕' },
  'Australian Shepherd': { duration: 75, distance: 4, intensity: 'Very High', tips: ['Herding instinct — watch around cyclists', 'Loves complex routes with variety', 'Needs both physical and mental stimulation'], emoji: '🐕' },
}

const intensityColor = {
  'Low': 'bg-green-100 text-green-700',
  'Low-Moderate': 'bg-lime-100 text-lime-700',
  'Moderate': 'bg-yellow-100 text-yellow-700',
  'High': 'bg-orange-100 text-orange-700',
  'Very High': 'bg-red-100 text-red-700',
}

export default function WalkRecommendations({ breed }) {
  const data = breedData[breed] || breedData.default

  return (
    <div className="bg-white rounded-3xl p-8 mb-6">
      {/* Breed header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-paw-pink rounded-full flex items-center justify-center text-3xl">
          {data.emoji}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Breed detected</p>
          <h2 className="font-display text-4xl uppercase tracking-tight text-gray-900">{breed}</h2>
        </div>
        <span className={`ml-auto text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-pill ${intensityColor[data.intensity]}`}>
          {data.intensity} Energy
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-paw-pink rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Walk Duration</p>
          <p className="font-display text-4xl text-paw-red">{data.duration}</p>
          <p className="text-sm text-gray-500">minutes</p>
        </div>
        <div className="bg-paw-blue-light/30 rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Distance</p>
          <p className="font-display text-4xl text-paw-blue">{data.distance}</p>
          <p className="text-sm text-gray-500">miles</p>
        </div>
        <div className="bg-paw-cream rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best Time</p>
          <p className="font-display text-2xl text-gray-800">Morning</p>
          <p className="text-sm text-gray-500">6 – 9 AM</p>
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="font-display text-xl uppercase tracking-tight text-gray-700 mb-3">Walk Tips</h3>
        <ul className="space-y-2">
          {data.tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="text-paw-red mt-0.5">🐾</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
