import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Planner from './pages/Planner'
import Account from './components/Account'
import Dog from './pages/Dog'
import Onboard from './pages/Onboard'
import Vets from './pages/Vets'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/account" element={<Account />} />
        <Route path="/dog/:id" element={<Dog />} />
        <Route path="/vets" element={<Vets />} />
      </Routes>
    </div>
  )
}
