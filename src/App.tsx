import { HashRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { EditablePage } from './pages/EditablePage'

// HashRouter, nes GitHub Pages nemoka „gilių" nuorodų (/p/laiskas-1)
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:id" element={<EditablePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}
