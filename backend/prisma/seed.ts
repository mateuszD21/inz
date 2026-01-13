import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'jan.kowalski@example.com',
        password: 'haslo123',
        name: 'Jan Kowalski',
        phone: '+48123456789',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
    }),
    prisma.user.create({
      data: {
        email: 'anna.nowak@example.com',
        password: 'haslo123',
        name: 'Anna Nowak',
        phone: '+48234567890',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    }),
    prisma.user.create({
      data: {
        email: 'piotr.wisniewski@example.com',
        password: 'haslo123',
        name: 'Piotr Wiśniewski',
        phone: '+48345678901',
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.kowalczyk@example.com',
        password: 'haslo123',
        name: 'Maria Kowalczyk',
        phone: '+48456789012',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
    }),
  ]);

  const products = [
    {
      title: 'iPhone 14 Pro Max 256GB - Stan idealny',
      description: `Telefon w świetnym stanie, bez zarysowań. Komplet z pudełkiem i wszystkimi akcesoriami.

🔋 Bateria: 98% pojemności
📱 Pamięć: 256GB
🎨 Kolor: Deep Purple
📦 Zawartość: telefon, ładowarka, kabel, pudełko, instrukcja

Telefon kupiony w oficjalnym Apple Store, faktura VAT, gwarancja jeszcze 8 miesięcy.
Idealny dla kogoś kto szuka wysokiej jakości sprzętu w super cenie!`,
      price: 4500,
      category: 'Elektronika',
      condition: 'Jak nowy',
      images: [
        'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800',
        'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800',
        'https://images.unsplash.com/photo-1678685888099-a46d407be6b7?w=800',
        'https://images.unsplash.com/photo-1592286927505-b7a6723ff528?w=800',
      ],
      location: 'Warszawa, Śródmieście',
      latitude: 52.2297,
      longitude: 21.0122,
      userId: users[0].id,
    },
    {
      title: 'Rower górski Trek Marlin 7 - jak nowy',
      description: `Rower używany tylko jeden sezon, regularnie serwisowany.

🚴 Rama: aluminiowa, rozmiar M
⚙️ Przerzutki: Shimano Deore
🛞 Koła: 29"
🔧 Stan techniczny: idealny
💪 Amortyzatory: w pełni sprawne

Świetny rower do jazdy po mieście i w terenie. Sprzedam bo kupuję rower szosowy.`,
      price: 2800,
      category: 'Sport',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
        'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800',
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
      ],
      location: 'Warszawa, Mokotów',
      latitude: 52.1672,
      longitude: 21.0288,
      userId: users[1].id,
    },
    {
      title: 'Sofa 3-osobowa skandynawska Ikea Norsborg',
      description: `Wygodna sofa w stylu skandynawskim, kolor szary.

🛋️ Wymiary: 240cm x 88cm x 85cm
🎨 Kolor: Finnsta szary
✨ Stan: bardzo dobry, małe ślady użytkowania
🧼 Pokrowce: zdejmowane, można prać

Sofa super wygodna, sprzedaję bo przeprowadzam się do mniejszego mieszkania.
Możliwość transportu za dodatkową opłatą.`,
      price: 1200,
      category: 'Dom i Ogród',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
      ],
      location: 'Warszawa, Praga',
      latitude: 52.2511,
      longitude: 21.0517,
      userId: users[2].id,
    },
    {
      title: 'MacBook Pro 16" M2 Max - stan idealny',
      description: `Laptop w idealnym stanie, używany głównie do pracy biurowej.

💻 Procesor: Apple M2 Max
🧠 RAM: 32GB
💾 Dysk: 1TB SSD
🖥️ Ekran: 16" Retina
🔋 Bateria: 95% zdrowia

Komplet z pudełkiem, ładowarką i kablem. Faktura VAT, gwarancja do sierpnia 2025.
Świetna maszyna do pracy kreatywnej i programowania!`,
      price: 12500,
      category: 'Elektronika',
      condition: 'Jak nowy',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      ],
      location: 'Warszawa, Wilanów',
      latitude: 52.1635,
      longitude: 21.0890,
      userId: users[0].id,
    },
    {
      title: 'Kurtka The North Face damska rozm. M',
      description: `Zimowa kurtka puchowa, bardzo ciepła i wygodna.

🧥 Marka: The North Face
📏 Rozmiar: M
🎨 Kolor: czarny
🌡️ Temperatura: do -20°C
💧 Wodoodporna: tak

Kupiona w zeszłym sezonie, noszona kilka razy. Kurtka jak nowa, bez żadnych uszkodzeń.
Sprzedam bo za duża.`,
      price: 650,
      category: 'Moda',
      condition: 'Jak nowy',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      ],
      location: 'Warszawa, Ursynów',
      latitude: 52.1394,
      longitude: 21.0444,
      userId: users[3].id,
    },
    {
      title: 'PlayStation 5 + 2 pady + 5 gier',
      description: `Konsola PlayStation 5 w super stanie, kupiona rok temu.

🎮 Zestaw zawiera:
- Konsola PS5 (wersja z napędem)
- 2 pady DualSense
- 5 gier: Spider-Man 2, God of War Ragnarok, Horizon Forbidden West, FIFA 24, Gran Turismo 7
- Wszystkie kable i pudełko

Stan idealny, bez zadrapań. Konsola używana okazjonalnie, głównie w weekendy.
Sprzedam bo przesiadam się na Xbox.`,
      price: 2400,
      category: 'Elektronika',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
        'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800',
        'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800',
        'https://images.unsplash.com/photo-1507457379470-08b800bebc67?w=800',
      ],
      location: 'Warszawa, Bemowo',
      latitude: 52.2507,
      longitude: 20.9173,
      userId: users[1].id,
    },
    {
      title: 'Stół dębowy rozkładany + 6 krzeseł',
      description: `Piękny zestaw mebli w stylu skandynawskim.

🪑 Zestaw zawiera:
- Stół rozkładany 160-200cm
- 6 krzeseł tapicerowanych
- Drewno: dąb naturalny
- Stan: bardzo dobry

Meble kupione 2 lata temu w salonie premium. Solidne wykonanie, lekkie ślady użytkowania.
Idealne do jadalni lub salonu. Możliwość sprzedaży osobno.`,
      price: 3200,
      category: 'Dom i Ogród',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
        'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800',
      ],
      location: 'Warszawa, Żoliborz',
      latitude: 52.2750,
      longitude: 20.9860,
      userId: users[2].id,
    },
    {
      title: 'Gitara akustyczna Yamaha F310',
      description: `Gitara klasyczna dla początkujących i średnio zaawansowanych.

🎸 Model: Yamaha F310
🎵 Typ: akustyczna
📦 Zestaw zawiera:
- Gitara
- Futerał miękki
- Stroik
- Zapasowe struny
- Instrukcja

Gitara w dobrym stanie, struny wymienione miesiąc temu. Świetna do nauki gry.
Sprzedam bo przesiadam się na gitarę elektryczną.`,
      price: 380,
      category: 'Elektronika',
      condition: 'Dobry',
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
        'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
        'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800',
      ],
      location: 'Warszawa, Wola',
      latitude: 52.2390,
      longitude: 20.9722,
      userId: users[3].id,
    },
    {
      title: 'Zestaw kina domowego Samsung HW-Q800B',
      description: `Soundbar premium z subwooferem, dźwięk kinowy w Twoim domu!

🔊 Moc: 330W
📡 Technologia: Dolby Atmos, DTS:X
📱 Łączność: Bluetooth, WiFi, HDMI
🎵 Kanały: 3.1.2

Kupiony 6 miesięcy temu, gwarancja jeszcze rok. Komplet z pilotem i wszystkimi kablami.
Stan idealny, używany okazjonalnie. Sprzedam bo przeprowadzam się za granicę.`,
      price: 1800,
      category: 'Elektronika',
      condition: 'Jak nowy',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
      location: 'Warszawa, Ochota',
      latitude: 52.2120,
      longitude: 20.9797,
      userId: users[0].id,
    },
    {
      title: 'Buty Nike Air Max 90 rozm. 42',
      description: `Kultowe Nike Air Max w świetnym stanie!

👟 Rozmiar: 42 EU / 8.5 US
🎨 Kolor: białe z niebieskim
✨ Stan: bardzo dobry
📦 Pudełko: oryginalne

Buty noszone kilka miesięcy, ale bardzo zadbane. Żadnych uszkodzeń, podeszwa w super stanie.
Idealny model na co dzień, wygodny i stylowy!`,
      price: 320,
      category: 'Moda',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      ],
      location: 'Warszawa, Targówek',
      latitude: 52.2909,
      longitude: 21.0495,
      userId: users[1].id,
    },
    {
      title: 'Odkurzacz bezprzewodowy Dyson V11',
      description: `Mocny odkurzacz pionowy, świetny do codziennego sprzątania.

🧹 Model: Dyson V11 Absolute
⚡ Czas pracy: do 60 minut
🔋 Bateria: litowo-jonowa
📦 Akcesoria: 8 końcówek w zestawie
🧽 Filtr: HEPA

Odkurzacz w bardzo dobrym stanie, używany rok. Bateria trzyma jak nowa.
Idealny do mieszkania i do samochodu. Gwarancja jeszcze 6 miesięcy.`,
      price: 1200,
      category: 'Dom i Ogród',
      condition: 'Bardzo dobry',
      images: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
        'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800',
        'https://images.unsplash.com/photo-1574269910960-53c193ae0fe9?w=800',
        'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800',
      ],
      location: 'Warszawa, Bielany',
      latitude: 52.2830,
      longitude: 20.9309,
      userId: users[2].id,
    },
    {
      title: 'Smartwatch Apple Watch Series 8 45mm',
      description: `Zegarek w idealnym stanie, używany 4 miesiące.

⌚ Model: Apple Watch Series 8
📏 Rozmiar: 45mm
🎨 Kolor: Midnight
📱 Łączność: GPS + Cellular
🔋 Bateria: 100% zdrowia

Komplet z pudełkiem, dwoma paskami (sportowy i skórzany) i ładowarką.
Zegarek bez zadrapań, szkło chronione folią od pierwszego dnia.`,
      price: 1600,
      category: 'Elektronika',
      condition: 'Jak nowy',
      images: [
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
      ],
      location: 'Warszawa, Kabaty',
      latitude: 52.1267,
      longitude: 21.0651,
      userId: users[3].id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Baza danych została wypełniona przykładowymi danymi!');
  console.log(`📦 Utworzono ${users.length} użytkowników i ${products.length} produktów`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });