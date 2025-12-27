import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Header } from './components/ui/Header' 
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { ProductDetail } from './pages/ProductDetail'
import { ProductList } from './pages/ProductList'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { MyProducts } from './pages/MyProducts'
import { EditProduct } from './pages/EditProduct'
import { AddProduct } from './pages/AddProduct'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/produkty" element={<ProductList />} />
              <Route path="/produkt/:id" element={<ProductDetail />} />
              <Route path="/logowanie" element={<Login />} />
              <Route path="/rejestracja" element={<Register />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/moje-ogloszenia" element={<MyProducts />} />
              <Route path="/dodaj" element={<AddProduct />} />
              <Route path="/edytuj/:id" element={<EditProduct />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App