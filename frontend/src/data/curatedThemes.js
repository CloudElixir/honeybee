/**
 * Each theme: featured carousel + exactly 4 grid packages.
 * Prices in INR (₹) for display.
 */
export const curatedThemes = [
  {
    id: 'eliteEscape',
    label: 'Elite Escape',
    featured: {
      title: 'Elite Escape',
      subtitle: 'Private jets, private islands, private joy',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'e1',
        place: 'Maldives',
        line: 'Overwater villas · seaplane arrival',
        price: 189000,
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        to: '/destinations?q=Maldives',
      },
      {
        id: 'e2',
        place: 'Dubai',
        line: 'Sky suites & desert sundowners',
        price: 95000,
        image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
        to: '/destinations?q=Dubai',
      },
      {
        id: 'e3',
        place: 'French Riviera',
        line: 'Nice · Monaco · St-Tropez',
        price: 225000,
        image: 'https://images.unsplash.com/photo-1499678329028-101765695a20?w=800&q=80',
        to: '/destinations?q=Riviera',
      },
      {
        id: 'e4',
        place: 'Swiss Alps',
        line: 'Glacier Express & chalet nights',
        price: 198000,
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d8b99?w=800&q=80',
        to: '/destinations/swiss-alps',
      },
    ],
  },
  {
    id: 'soloExpedition',
    label: 'Solo Expedition',
    featured: {
      title: 'Solo Expedition',
      subtitle: 'Go far. Find yourself. Repeat.',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 's1',
        place: 'Iceland',
        line: 'Ring road · hostels to lodges',
        price: 112000,
        image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c3b?w=800&q=80',
        to: '/destinations?q=Iceland',
      },
      {
        id: 's2',
        place: 'Portugal',
        line: 'Lisbon tiles & solo surf mornings',
        price: 52000,
        image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
        to: '/destinations?q=Portugal',
      },
      {
        id: 's3',
        place: 'Nepal',
        line: 'Kathmandu base · gentle hikes',
        price: 48000,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
        to: '/destinations?q=Nepal',
      },
      {
        id: 's4',
        place: 'Patagonia',
        line: 'Torres lookouts & quiet lodges',
        price: 165000,
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        to: '/destinations/patagonia-wild',
      },
    ],
  },
  {
    id: 'familyFunventure',
    label: 'Family Funventure',
    featured: {
      title: 'Family Funventure',
      subtitle: 'Laughter loud, logistics quiet',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'f1',
        place: 'Costa Rica',
        line: 'Sloths · volcanoes · easy beaches',
        price: 89000,
        image: 'https://images.unsplash.com/photo-1518252267499-012bafbea00b?w=800&q=80',
        to: '/destinations/costa-rica-pura',
      },
      {
        id: 'f2',
        place: 'Orlando & coast',
        line: 'Theme parks + Cocoa Beach wind-down',
        price: 72000,
        image: 'https://images.unsplash.com/photo-1523906834658-6e455ef79a68?w=800&q=80',
        to: '/destinations?q=Orlando',
      },
      {
        id: 'f3',
        place: 'Japan',
        line: 'Kyoto crafts · kid-friendly pacing',
        price: 198000,
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
        to: '/destinations/kyoto-heritage',
      },
      {
        id: 'f4',
        place: 'Greece',
        line: 'Islands with shallow blues',
        price: 142000,
        image: 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=800&q=80',
        to: '/destinations/santorini-glow',
      },
    ],
  },
  {
    id: 'groupAdventures',
    label: 'Group Adventures',
    featured: {
      title: 'Group Adventures',
      subtitle: 'Shared miles, bigger stories',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1533105076920-e74f341290a9?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'g1',
        place: 'Amalfi Coast',
        line: 'Private minibus · lemon grove lunch',
        price: 125000,
        image: 'https://images.unsplash.com/photo-1533105076920-e74f341290a9?w=800&q=80',
        to: '/destinations/amalfi-riviera',
      },
      {
        id: 'g2',
        place: 'Morocco',
        line: 'Medina nights · Atlas day trip',
        price: 68000,
        image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80',
        to: '/destinations/marrakech-riad',
      },
      {
        id: 'g3',
        place: 'Utah parks',
        line: 'Zion · Bryce · small group max 12',
        price: 55000,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
        to: '/destinations?q=Zion',
      },
      {
        id: 'g4',
        place: 'Vietnam',
        line: 'Halong · Hoi An · street food crawl',
        price: 62000,
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
        to: '/destinations?q=Vietnam',
      },
    ],
  },
  {
    id: 'religiousRetreat',
    label: 'Religious Retreat',
    featured: {
      title: 'Religious Retreat',
      subtitle: 'Sacred steps, mindful pace',
      ctaLabel: 'View full collection',
      ctaTo: '/contact',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'r1',
        place: 'Varanasi',
        line: 'Ganga aarti · heritage walks',
        price: 28500,
        image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
        to: '/destinations?q=Varanasi',
      },
      {
        id: 'r2',
        place: 'Jerusalem',
        line: 'Old City guided days',
        price: 98000,
        image: 'https://images.unsplash.com/photo-1544984243-ec57ea156fe0?w=800&q=80',
        to: '/destinations?q=Jerusalem',
      },
      {
        id: 'r3',
        place: 'Kyoto temples',
        line: 'Morning bells & moss gardens',
        price: 88000,
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
        to: '/destinations/kyoto-heritage',
      },
      {
        id: 'r4',
        place: 'Saudi · Umrah+',
        line: 'Supportive group departures',
        price: 145000,
        image: 'https://images.unsplash.com/photo-1591604129939-f1efa4f918f7?w=800&q=80',
        to: '/contact',
      },
    ],
  },
  {
    id: 'relaxRejuvenate',
    label: 'Relax & Rejuvenate',
    featured: {
      title: 'Relax & Rejuvenate',
      subtitle: 'Unwind and recharge your soul',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1470252649379-9b62148fcc64?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'rr1',
        place: 'Kerala',
        line: 'Munnar · Thekkady · Cochin',
        price: 10500,
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80',
        to: '/destinations?q=Kerala',
      },
      {
        id: 'rr2',
        place: 'Tamil Nadu',
        line: 'Explore Pondicherry in 2N3D',
        price: 14999,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
        to: '/destinations?q=Pondicherry',
      },
      {
        id: 'rr3',
        place: 'Rajasthan',
        line: 'Udaipur · Kumbhalgarh tour',
        price: 17000,
        image: 'https://images.unsplash.com/photo-1477587458883-6b8b0d8cefd2?w=800&q=80',
        to: '/destinations?q=Udaipur',
      },
      {
        id: 'rr4',
        place: 'Meghalaya',
        line: 'Enchanting Shillong — scenic beauty & living roots',
        price: 17000,
        image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
        to: '/destinations?q=Shillong',
      },
    ],
  },
  {
    id: 'explorationBundle',
    label: 'Exploration Bundle',
    featured: {
      title: 'Exploration Bundle',
      subtitle: 'Pack more wonder per mile',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'x1',
        place: 'Peru combo',
        line: 'Cusco · Sacred Valley · brief Lima',
        price: 118000,
        image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
        to: '/destinations?q=Peru',
      },
      {
        id: 'x2',
        place: 'Balkans loop',
        line: 'Split · Dubrovnik · Kotor',
        price: 92000,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
        to: '/destinations?q=Balkans',
      },
      {
        id: 'x3',
        place: 'Andes to salt flats',
        line: 'La Paz · Uyuni extension',
        price: 135000,
        image: 'https://images.unsplash.com/photo-1531065208531-40348d9036e3?w=800&q=80',
        to: '/destinations?q=Bolivia',
      },
      {
        id: 'x4',
        place: 'East Africa',
        line: 'Serengeti nights · Zanzibar wind-down',
        price: 210000,
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
        to: '/destinations?q=Serengeti',
      },
    ],
  },
  {
    id: 'educational',
    label: 'Educational',
    featured: {
      title: 'Educational',
      subtitle: 'Curious minds, open roads',
      ctaLabel: 'View full collection',
      ctaTo: '/contact',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'ed1',
        place: 'Rome & Athens',
        line: 'Classics tour with historian guides',
        price: 142000,
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd771b5?w=800&q=80',
        to: '/destinations?q=Rome',
      },
      {
        id: 'ed2',
        place: 'London museums',
        line: 'Family-friendly private tours',
        price: 88000,
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
        to: '/destinations?q=London',
      },
      {
        id: 'ed3',
        place: 'Egypt',
        line: 'Pyramids · Nile felucca · Luxor',
        price: 95000,
        image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
        to: '/destinations?q=Egypt',
      },
      {
        id: 'ed4',
        place: 'Washington DC',
        line: 'Capitol · Smithsonian deep dive',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1617588855987-b3a73491540d?w=800&q=80',
        to: '/destinations?q=Washington',
      },
    ],
  },
  {
    id: 'romanticGetaways',
    label: 'Romantic Getaways',
    featured: {
      title: 'Romantic Getaways',
      subtitle: 'Toes in the sand, hearts in sync',
      ctaLabel: 'View full collection',
      ctaTo: '/packages',
      slides: [
        {
          image:
            'https://images.unsplash.com/photo-1516815231560-8f41ec3c74d6?w=1200&q=80',
        },
        {
          image:
            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
        },
      ],
    },
    grid: [
      {
        id: 'ro1',
        place: 'Santorini',
        line: 'Caldera suites · sunset dinner',
        price: 185000,
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
        to: '/destinations/santorini-glow',
      },
      {
        id: 'ro2',
        place: 'Maldives',
        line: 'Water villa · starlit deck',
        price: 210000,
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        to: '/destinations?q=Maldives',
      },
      {
        id: 'ro3',
        place: 'Tuscany',
        line: 'Villa week · wine & slow drives',
        price: 165000,
        image: 'https://images.unsplash.com/photo-1528114039593-43664da2761a?w=800&q=80',
        to: '/destinations?q=Tuscany',
      },
      {
        id: 'ro4',
        place: 'Maui',
        line: 'Cliffside dinners & sunrise',
        price: 138000,
        image: 'https://images.unsplash.com/photo-1542256393-7d2d7250ffd5?w=800&q=80',
        to: '/destinations?q=Maui',
      },
    ],
  },
]

export function getThemeById(id) {
  return (
    curatedThemes.find((t) => t.id === id) ??
    curatedThemes.find((t) => t.id === 'relaxRejuvenate')
  )
}
