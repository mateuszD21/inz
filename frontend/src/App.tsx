import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/ui/Header' 
import { Footer } from './components/Footer'
import { Home } from './pages/Home'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App