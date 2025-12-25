import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, User, Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LokalMarket</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/produkty" className="text-gray-700 hover:text-blue-600 transition">
              Kategorie
            </Link>
            <Link to="#" className="text-gray-700 hover:text-blue-600 transition">
              Jak działa?
            </Link>
            <Link to="#" className="text-gray-700 hover:text-blue-600 transition">
              O nas
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Link to="/profil">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dodaj">
              <Button className="bg-blue-600 hover:bg-blue-700">
                + Dodaj ogłoszenie
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link to="/produkty" className="text-gray-700 hover:text-blue-600 transition">
                Kategorie
              </Link>
              <Link to="#" className="text-gray-700 hover:text-blue-600 transition">
                Jak działa?
              </Link>
              <Link to="#" className="text-gray-700 hover:text-blue-600 transition">
                O nas
              </Link>
              <Link to="/dodaj">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  + Dodaj ogłoszenie
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}