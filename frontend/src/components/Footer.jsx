import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐾</span>
              <span className="font-display text-3xl tracking-tight text-paw-red">PAWPATH</span>
            </div>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
              Smart walking routes for every dog, every day. Powered by AI and real-time data.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">App</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/planner" className="hover:text-white transition-colors">Walk Planner</Link></li>
                <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2025 PawPath. All rights reserved.</p>
          <p className="text-xs text-gray-500">Built with ❤️ for dogs everywhere</p>
        </div>
      </div>
    </footer>
  )
}
