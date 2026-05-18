function slugifyPackageName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Flat catalog for /packages merge + /packages/:id legacy fallback */
export function listLegacyPackageItems() {
  return packageCategories.flatMap((cat) =>
    cat.items.map((item, ii) => ({
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
      categorySubtitle: cat.subtitle,
      categoryIcon: cat.icon,
      slug: slugifyPackageName(item.name),
      legacyId: `legacy-${cat.id}-${ii}`,
    }))
  )
}

export const packageCategories = [
  {
    id: 'honeymoon',
    title: 'Honeymoon',
    subtitle: 'Private moments, elevated stays',
    icon: 'Heart',
    items: [
      {
        name: 'Santorini & Athens Romance',
        nights: '9 nights',
        from: 5200,
        perks: ['Caldera suite', 'Sunset yacht', 'Athens mythology tour'],
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
      },
      {
        name: 'Maldives Overwater Escape',
        nights: '6 nights',
        from: 6890,
        perks: ['Water villa', 'Couples spa', 'Seaplane transfers'],
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
      },
      {
        name: 'Tuscany Vineyard Retreat',
        nights: '7 nights',
        from: 4580,
        perks: ['Villa with pool', 'Truffle hunt', 'Private chef night'],
        image: 'https://images.unsplash.com/photo-1528114039593-43664da2761a?w=800&q=80',
      },
    ],
  },
  {
    id: 'family',
    title: 'Family',
    subtitle: 'Room to roam, memories to keep',
    icon: 'Users',
    items: [
      {
        name: 'Costa Rica Family Discovery',
        nights: '8 nights',
        from: 3200,
        perks: ['Connecting suites', 'Kid-friendly guides', 'Beach + wildlife'],
        image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80',
      },
      {
        name: 'London & Paris Highlights',
        nights: '10 nights',
        from: 4950,
        perks: ['Museum fast-track', 'Disney day option', 'Apartment-style rooms'],
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
      },
      {
        name: 'Dubai & Desert Adventure',
        nights: '6 nights',
        from: 4100,
        perks: ['Resort with kids’ club', 'Desert safari', 'Aquarium tickets'],
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      },
    ],
  },
  {
    id: 'adventure',
    title: 'Adventure',
    subtitle: 'Guides, gear, and gravity',
    icon: 'Mountain',
    items: [
      {
        name: 'Iceland Ring Road',
        nights: '10 nights',
        from: 5600,
        perks: ['4×4 vehicle', 'Glacier hike', 'Northern lights season'],
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
      },
      {
        name: 'Nepal Annapurna Lodge Trek',
        nights: '12 nights',
        from: 3890,
        perks: ['Teahouse comfort tier', 'Private guide', 'Heli option'],
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      },
      {
        name: 'New Zealand South Island',
        nights: '11 nights',
        from: 6200,
        perks: ['Heli hike', 'Jetboat & fjord cruise', 'Adventure insurance assist'],
        image: 'https://images.unsplash.com/photo-1507699622100-4cef3c8fc8f5?w=800&q=80',
      },
    ],
  },
  {
    id: 'budget',
    title: 'Budget Smart',
    subtitle: 'Big experiences, sensible spend',
    icon: 'Wallet',
    items: [
      {
        name: 'Portugal Coastal Week',
        nights: '7 nights',
        from: 1290,
        perks: ['Boutique B&Bs', 'Train passes', 'Curated self-drive route'],
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
      },
      {
        name: 'Mexico City & Oaxaca',
        nights: '8 nights',
        from: 1180,
        perks: ['Design hotels', 'Market tours', 'Mezcal tasting'],
        image: 'https://images.unsplash.com/photo-1518659526055-ea22aee28963?w=800&q=80',
      },
      {
        name: 'Vietnam Essential',
        nights: '10 nights',
        from: 990,
        perks: ['Halong cruise', 'Hoi An cycling', 'Domestic flights included'],
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
      },
    ],
  },
]
