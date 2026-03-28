import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Planner from './pages/Planner'
import Account from './components/Account'
<<<<<<< HEAD
import Dog from './pages/Dog'
=======
import Onboard from './pages/Onboard'
>>>>>>> 3d6ed0c (Add onboarding flow, fix navbar, wire APIs, add CORS to node backend)

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
      </Routes>
    </div>
  )
}
