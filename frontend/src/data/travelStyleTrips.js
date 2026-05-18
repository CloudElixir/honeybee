/**
 * Home "travel style" carousel: one card per row. `id` is used in URLs (?travelStyle=) and CMS package tags.
 * Use `image` + `imageFallback` so a failed load still shows a matching photo.
 * Legacy CMS tag `eductiona` → use id `educational` going forward.
 * badge: valueChoice | signaturePick | hotRightNow | beachHolidays (maps to pill styles in UI)
 */
export const travelStyleCategories = [
  {
    id: 'group-departure',
    label: 'Group departure',
    tagline: 'Laughs, fixed departures & a crew that rolls out together',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1539635278304-50093727bcf5?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
    themePath: '/group-departures',
  },
  {
    id: 'family-funventure',
    label: 'Family funventure',
    tagline: 'Sandcastles, wildlife & itineraries built around little legs',
    image:
      'https://images.unsplash.com/photo-1476708046591-e0faea48c0f0?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1511895426328-dc821679aba0?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
    themePath: '/family-funventure',
  },
  {
    id: 'educational',
    label: 'Educational',
    tagline: 'Museums, old quarters & guides who love the backstory',
    image:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b7?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
  {
    id: 'religious-retreat',
    label: 'Religious retreat',
    tagline: 'Temples, prayer routes & calm days with meaning',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
  {
    id: 'solo-expendition',
    label: 'Solo expendition',
    tagline: 'Your timeline, your detours — we handle the logistics',
    image:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1501555082462-021358b7a467?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
  {
    id: 'exploration-bundle',
    label: 'Exploration bundle',
    tagline: 'Road-trip energy: peaks, coasts & towns in one sweep',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
  {
    id: 'relax-rejuvenate',
    label: 'Relax & rejuvenate',
    tagline: 'Spa hours, still pools & mornings with nowhere to be',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6b8778045?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
  {
    id: 'elite-escapte',
    label: 'Elite escapte',
    tagline: 'Suite-level stays, private cars & detail-obsessed hosting',
    image:
      'https://images.unsplash.com/photo-1631049307264-d0bf6d0d869c?auto=format&fit=crop&w=1200&q=82',
    imageFallback:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=82',
    badge: 'valueChoice',
  },
]

/** Pill filters on the home section — ids match `travelStyleCategories`. */
export const travelStyleFilters = travelStyleCategories.map(({ id, label }) => ({ id, label }))

/**
 * badge: top-left pill style (valueChoice | signaturePick | hotRightNow | beachHolidays)
 */
export const travelStyleTrips = {
  international: [
    {
      id: 'nepal-heritage',
      tags: ['budget', 'weekend', 'smallGroup'],
      badge: 'valueChoice',
      country: 'NEPAL',
      duration: '4D / 3N',
      name: 'Kathmandu — Bhaktapur — Nagarkot views',
      price: 13999,
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
      to: '/destinations?q=Nepal',
    },
    {
      id: 'krabi-relax',
      tags: ['beach', 'budget', 'weekend'],
      badge: 'beachHolidays',
      country: 'THAILAND',
      duration: '4D / 3N',
      name: 'Relaxing Krabi islands & sunsets',
      price: 18999,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80',
      to: '/destinations?q=Krabi',
    },
    {
      id: 'samui-hot',
      tags: ['beach', 'smallGroup', 'weekend'],
      badge: 'hotRightNow',
      country: 'THAILAND',
      duration: '5D / 4N',
      name: 'Koh Samui slow days & night markets',
      price: 24999,
      image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
      to: '/destinations?q=Samui',
    },
    {
      id: 'santorini-sig',
      tags: ['beach', 'womens', 'smallGroup'],
      badge: 'signaturePick',
      country: 'GREECE',
      duration: '6D / 5N',
      name: 'Santorini caldera & wine country',
      price: 89999,
      image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=800&q=80',
      to: '/destinations/santorini-glow',
    },
    {
      id: 'bali-beach',
      tags: ['beach', 'smallGroup', 'womens'],
      badge: 'beachHolidays',
      country: 'INDONESIA',
      duration: '7D / 6N',
      name: 'Bali beaches & Ubud wellness',
      price: 32999,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      to: '/destinations/bali-serenity',
    },
    {
      id: 'portugal-budget',
      tags: ['budget', 'weekend', 'senior'],
      badge: 'valueChoice',
      country: 'PORTUGAL',
      duration: '6D / 5N',
      name: 'Lisbon tiles & Algarve coast',
      price: 45999,
      image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
      to: '/destinations?q=Portugal',
    },
    {
      id: 'kyoto-senior',
      tags: ['senior', 'smallGroup'],
      badge: 'signaturePick',
      country: 'JAPAN',
      duration: '8D / 7N',
      name: 'Kyoto temples at an easy pace',
      price: 112999,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      to: '/destinations/kyoto-heritage',
    },
    {
      id: 'morocco-womens',
      tags: ['womens', 'smallGroup', 'budget'],
      badge: 'hotRightNow',
      country: 'MOROCCO',
      duration: '5D / 4N',
      name: 'Marrakech riads & Atlas day trip',
      price: 42999,
      image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
      to: '/destinations/marrakech-riad',
    },
    {
      id: 'maldives-weekend',
      tags: ['beach', 'weekend', 'womens'],
      badge: 'signaturePick',
      country: 'MALDIVES',
      duration: '4D / 3N',
      name: 'Overwater calm — short escape',
      price: 125999,
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
      to: '/destinations?q=Maldives',
    },
  ],
  domestic: [
    {
      id: 'maui-beach',
      tags: ['beach', 'senior', 'smallGroup'],
      badge: 'beachHolidays',
      country: 'USA · HAWAII',
      duration: '5D / 4N',
      name: 'Maui beaches & sunrise summit',
      price: 78999,
      image: 'https://images.unsplash.com/photo-1542256393-7d2d7250ffd5?w=800&q=80',
      to: '/destinations?q=Maui',
    },
    {
      id: 'keys-budget',
      tags: ['beach', 'budget', 'weekend'],
      badge: 'valueChoice',
      country: 'USA · FLORIDA',
      duration: '4D / 3N',
      name: 'Florida Keys island hop',
      price: 35999,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      to: '/destinations?q=Keys',
    },
    {
      id: 'charleston-weekend',
      tags: ['weekend', 'senior', 'smallGroup'],
      badge: 'hotRightNow',
      country: 'USA · SOUTH CAROLINA',
      duration: '3D / 2N',
      name: 'Charleston food & historic lanes',
      price: 21999,
      image: 'https://images.unsplash.com/photo-1569163139304-0b3857f58414?w=800&q=80',
      to: '/destinations?q=Charleston',
    },
    {
      id: 'napa-senior',
      tags: ['senior', 'weekend', 'smallGroup'],
      badge: 'signaturePick',
      country: 'USA · CALIFORNIA',
      duration: '4D / 3N',
      name: 'Napa & Sonoma vineyards slow tour',
      price: 54999,
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
      to: '/destinations?q=Napa',
    },
    {
      id: 'aspen-weekend',
      tags: ['weekend', 'smallGroup', 'budget'],
      badge: 'valueChoice',
      country: 'USA · COLORADO',
      duration: '3D / 2N',
      name: 'Aspen long weekend in the Rockies',
      price: 62999,
      image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80',
      to: '/destinations?q=Aspen',
    },
    {
      id: 'sedona-womens',
      tags: ['womens', 'smallGroup', 'weekend'],
      badge: 'hotRightNow',
      country: 'USA · ARIZONA',
      duration: '4D / 3N',
      name: 'Sedona red rocks retreat',
      price: 38999,
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      to: '/destinations?q=Sedona',
    },
    {
      id: 'san-diego-beach',
      tags: ['beach', 'budget', 'weekend'],
      badge: 'beachHolidays',
      country: 'USA · CALIFORNIA',
      duration: '4D / 3N',
      name: 'San Diego coast & La Jolla coves',
      price: 27999,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      to: '/destinations?q=San%20Diego',
    },
    {
      id: 'outer-banks',
      tags: ['beach', 'budget', 'smallGroup'],
      badge: 'beachHolidays',
      country: 'USA · NORTH CAROLINA',
      duration: '5D / 4N',
      name: 'Outer Banks lighthouses & dunes',
      price: 31999,
      image: 'https://images.unsplash.com/photo-1505118380757-334f4ff9363f?w=800&q=80',
      to: '/destinations?q=Outer%20Banks',
    },
  ],
}
