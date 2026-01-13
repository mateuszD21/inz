import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ShoppingBag, User, Menu, X, LogOut, MessageCircle, Package, ShoppingCart } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const handleSectionClick = (sectionId: string) => {
  setMobileMenuOpen(false);
  
  if (location.pathname === '/') {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  } else {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80; 
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }
}


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
            { }
            <button 
              onClick={() => handleSectionClick('jak-dziala')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Jak działa?
            </button>
            <button 
              onClick={() => handleSectionClick('o-nas')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              O nas
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <Link to="/wiadomosci">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
            )}     
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Mój profil
                      </div>
                    </Link>
                    <Link
                      to="/moje-ogloszenia"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Moje ogłoszenia
                      </div>
                    </Link>
                    <Link
                      to="/transakcje"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Moje transakcje
                      </div>
                    </Link>
                    <Link
                      to="/wiadomosci"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Wiadomości
                      </div>
                    </Link>

                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Wyloguj się
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/logowanie">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

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
              <Link 
                to="/produkty" 
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kategorie
              </Link>
              {}
              <button 
                onClick={() => handleSectionClick('jak-dziala')}
                className="text-left text-gray-700 hover:text-blue-600 transition"
              >
                Jak działa?
              </button>
              <button 
                onClick={() => handleSectionClick('o-nas')}
                className="text-left text-gray-700 hover:text-blue-600 transition"
              >
                O nas
              </button>
              
              {isAuthenticated ? (
                <>
                  <hr />
                  <Link
                    to="/profil"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Mój profil
                  </Link>
                  <Link
                    to="/moje-ogloszenia"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    Moje ogłoszenia
                  </Link>
                  <Link
                    to="/transakcje"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Moje transakcje
                  </Link>
                  <Link
                    to="/wiadomosci"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Wiadomości
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Wyloguj się
                  </button>
                  <hr />
                </>
              ) : (
                <>
                  <hr />
                  <Link
                    to="/logowanie"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    to="/rejestracja"
                    className="text-gray-700 hover:text-blue-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Zarejestruj się
                  </Link>
                  <hr />
                </>
              )}
              
              <Link to="/dodaj" onClick={() => setMobileMenuOpen(false)}>
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