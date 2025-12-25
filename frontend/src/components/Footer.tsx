import { Link } from 'react-router-dom'
import { ShoppingBag } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">LokalMarket</span>
            </div>
            <p className="text-sm">
              Platforma wspierająca handel lokalny i budowanie społeczności.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Dla kupujących</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition">Jak kupować?</Link></li>
              <li><Link to="#" className="hover:text-white transition">Bezpieczne zakupy</Link></li>
              <li><Link to="#" className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Dla sprzedających</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition">Jak sprzedawać?</Link></li>
              <li><Link to="#" className="hover:text-white transition">Zasady</Link></li>
              <li><Link to="#" className="hover:text-white transition">Porady</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">O nas</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-white transition">Kim jesteśmy?</Link></li>
              <li><Link to="#" className="hover:text-white transition">Kontakt</Link></li>
              <li><Link to="#" className="hover:text-white transition">Kariera</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2024 LokalMarket. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}