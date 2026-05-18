/**
 * Default 5-day itinerary when CMS has no rows yet (GitHub Pages / fresh Hostinger DB).
 * Admin data overrides this when package_itineraries returns rows.
 */
export function baliRomanticEscapeFallbackItinerary(packageId = 1) {
  const pid = Number(packageId) || 1
  const days = [
    [
      1,
      0,
      'Arrival in Bali',
      `Arrival: Land at Ngurah Rai International Airport and complete immigration procedures.
Check-in: Arrive at your resort/hotel and check in for your stay.
Note: Standard check-in time is 2:00 PM.
Leisure Time: Enjoy the rest of the day at leisure.
Local area: Relax at the hotel or by the beach — explore the local area at your own pace.
Accommodation: Overnight stay in Kuta.
Meals included on the day: Nil`,
    ],
    [
      2,
      1,
      'Half Day Water sports + Uluwatu Temple + Kecak Dance',
      `Breakfast at Hotel: Start the day with a hearty meal.
Water Sports at Benoa Beach: Engage in thrilling activities such as Parasailing (weather permitting), Banana Boat Rides, and Jet Skiing.
Visit Uluwatu Temple: Explore this iconic cliffside sea temple, renowned for its stunning ocean views.
Kecak & Fire Dance Performance: Experience this captivating cultural dance at sunset, set against the breathtaking backdrop of Uluwatu Temple.
Accommodation: Overnight stay in Kuta.
Meals included on the day: Breakfast`,
    ],
    [
      3,
      2,
      'Nusa Penida Island Tour',
      `Breakfast: Enjoy breakfast at the hotel.
7 AM Pick Up: Depart from the hotel to the Ferry Terminal for transfers to Nusa Penida Island via speedboat.
Angel's Billabong: Swim in a stunning natural infinity pool with crystal-clear waters surrounded by dramatic cliffs.
Broken Beach: Visit this picturesque cove featuring an arched rock formation that creates a natural bridge over turquoise waters.
Kelingking Cliff: Experience breathtaking views from this iconic viewpoint resembling a T-Rex, perfect for memorable photos.
Crystal Bay: Natural bay (area may be temporarily closed due to landslides — subject to local conditions).
Important Notes: Bring cash for entry donations — IDR 25,000 per adult and IDR 15,000 per child for Nusa Penida.`,
    ],
    [
      4,
      3,
      'Kintamani Village Tour',
      `Early Breakfast: Prepare for an exciting day with a hearty meal.
Visit Kintamani Viewpoint: Experience the breathtaking views of Batur Caldera and the serene Lake Batur — perfect for nature lovers and photographers.
Mas and Celuk Village & Ubud Art Market: Explore villages known for silver production. Witness the craftsmanship behind exquisite silver jewellery, plus Ubud Art Market.
Bali Coffee Plantation: Discover tropical plants including coffee robusta and cacao. Experience traditional coffee-making and taste fresh Balinese coffee or ginger tea with river valley views. See the civet cat, known for Coffee Luwak.
Tegallalang Rice Terraces: Visit famous rice paddies showcasing the traditional subak irrigation system and stunning terraced landscapes.
Accommodation: Overnight stay in Kuta.`,
    ],
    [
      5,
      4,
      'Departure',
      `Morning at Leisure: Enjoy a relaxing morning with breakfast at the hotel. Complete check-out formalities by 12:00 PM, allowing you to savor your last moments in Bali.
Airport Transfer: After check-out, transfer to Bali Airport for your return flight — ensuring a smooth and timely departure with wonderful memories of your trip.
Meals included on the day: Breakfast`,
    ],
  ]

  return days.map(([dayNum, sortOrder, title, description], idx) => ({
    id: `bali-fallback-${dayNum}-${idx}`,
    package_id: pid,
    day_number: dayNum,
    sort_order: sortOrder,
    title,
    description,
  }))
}
