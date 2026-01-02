import { Link } from 'react-router-dom'
import { Heart, MapPin } from "lucide-react"

interface ProductCardProps {
  id: number
  title: string
  price: string
  location: string
  image: string
  distance: string
}

export function ProductCard({ id, title, price, location, image, distance }: ProductCardProps) {
  // Nie pokazuj badge jeśli nie ma prawidłowej lokalizacji
  const showDistance = distance && distance !== 'Brak lokalizacji';
  
  return (
    <Link to={`/produkt/${id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <button 
            onClick={(e) => {
              e.preventDefault()
              console.log('Added to favorites')
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
          </button>
          {/* Tylko pokazuj badge jeśli jest prawidłowa odległość */}
          {showDistance && (
            <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {distance}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {price}
          </div>
        </div>
      </div>
    </Link>
  )
}