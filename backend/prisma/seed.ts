import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Stwórz testowego użytkownika
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'haslo123',
      name: 'Jan Kowalski',
      phone: '+48123456789',
    },
  });

  // Stwórz przykładowe produkty
  const products = [
    {
      title: 'iPhone 14 Pro - Stan idealny',
      description: 'Telefon w świetnym stanie, bez zarysowań. Komplet z pudełkiem.',
      price: 3500,
      category: 'Elektronika',
      condition: 'Jak nowy',
      images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400'],
      location: 'Warszawa, Śródmieście',
      latitude: 52.2297,
      longitude: 21.0122,
      userId: user.id,
    },
    {
      title: 'Rower górski Trek - jak nowy',
      description: 'Rower używany sezon, serwisowany. Amortyzatory w pełni sprawne.',
      price: 1800,
      category: 'Sport',
      condition: 'Bardzo dobry',
      images: ['https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400'],
      location: 'Warszawa, Mokotów',
      latitude: 52.1672,
      longitude: 21.0288,
      userId: user.id,
    },
    {
      title: 'Sofa 3-osobowa skandynawska',
      description: 'Wygodna sofa w stylu skandynawskim, kolor szary.',
      price: 2200,
      category: 'Dom i Ogród',
      condition: 'Dobry',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
      location: 'Warszawa, Praga',
      latitude: 52.2511,
      longitude: 21.0517,
      userId: user.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Baza danych została wypełniona przykładowymi danymi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });