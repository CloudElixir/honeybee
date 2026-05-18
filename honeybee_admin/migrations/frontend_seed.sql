-- Generated from frontend/src/data/destinations.js
-- Imports packages + destinations + mapping + itineraries
START TRANSACTION;

-- Bhutan Signature
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Bhutan Signature','Domestic','Bhutan',2450,'6 days','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.','Tiger’s Nest viewpoint, Paro & Thimphu route, Monastic heritage','Curated stays with breakfast, Private transfers, Sightseeing as per route, On-trip planning support','','0','active','bhutan-signature','Bhutan Signature','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='bhutan-signature' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Bhutan','Bhutan','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.','https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80','bhutan','Bhutan Signature','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='bhutan' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Arrival in Paro', 'Airport pickup, scenic transfer, and a relaxed walk through the old town.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Thimphu exploration', 'Buddha Dordenma, local markets, and cultural landmarks at a comfortable pace.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Dochula to Punakha', 'Mountain pass viewpoints and valley transfer with riverside monastery visits.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Punakha experiences', 'Dzong architecture, suspension bridge walk, and curated local encounters.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Paro highlights', 'Heritage sites and optional Tiger’s Nest base hike with scenic rest stops.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Departure', 'Breakfast and assisted transfer to the airport.', 6, NOW());

-- Santorini Glow
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Santorini Glow','International','Greece',2890,'7 days','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.','Caldera suites, Private yacht morning, Wine & archaeology','Boutique caldera-view accommodation, Daily breakfast & two chef dinners, Private transfers & experiences as listed, 24/7 HoneybeeTrips concierge','','0','active','santorini-glow','Santorini Glow','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='santorini-glow' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Greece','Greece','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.','https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=1200&q=80','greece','Santorini Glow','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='greece' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Arrival in Fira', 'Private transfer to your cliffside suite. Welcome sparkling wine and orientation with your concierge.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Oia & golden hour', 'Guided stroll through Oia, boutique shopping, and a reserved terrace for sunset.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Volcano & hot springs', 'Catamaran sail with swim stops, volcanic islets, and onboard lunch with local wines.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Akrotiri & beaches', 'Archaeological site visit, then relaxed afternoon at a secluded beach club.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Wine country', 'Estate tastings across Assyrtiko vineyards with a farm-to-table lunch.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Spa & free time', 'Couples ritual at the spa, optional photography session, farewell dinner.', 6, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 7, 'Departure', 'Leisurely breakfast and transfer to the port or airport.', 7, NOW());

-- Kyoto Heritage
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Kyoto Heritage','Domestic','Japan',3290,'8 days','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.','Ryokan stay, Tea ceremony, Arashiyama bamboo','Mix of ryokan & design hotel, Selected meals & cultural sessions, JR regional passes where applicable, English-speaking guides on key days','','0','active','kyoto-heritage','Kyoto Heritage','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='kyoto-heritage' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Japan','Japan','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.','https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80','japan','Kyoto Heritage','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='japan' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Welcome to Kyoto', 'Bullet train or private car from KIX. Check-in to a heritage ryokan with kaiseki dinner.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Gion & temples', 'Morning walk through Gion, Kennin-ji, and a private tea workshop.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Arashiyama', 'Bamboo grove at dawn, riverboat option, and temple moss gardens.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Nara day trip', 'Todai-ji, deer park stroll, and lunch in a machiya-style restaurant.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Craft & culture', 'Pottery or indigo workshop, free afternoon for galleries.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Fushimi & sake', 'Fushimi Inari at off-peak hours, sake brewery tasting flight.', 6, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 7, 'Philosopher’s Path', 'Quiet canal walk, Nanzen-ji, and farewell omakase.', 7, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 8, 'Departure', 'Breakfast and assisted onward travel.', 8, NOW());

-- Amalfi Riviera
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Amalfi Riviera','International','Italy',3490,'6 days','Cliffside drives, limoncello terraces, and Positano nights under the stars.','Cliffside drives, limoncello terraces, and Positano nights under the stars.','Ravello concert, Capri boat, Michelin dining','Sea-view boutique hotel, Private boat day, Expert guides, HoneybeeTrips dining reservations','','0','active','amalfi-riviera','Amalfi Riviera','Cliffside drives, limoncello terraces, and Positano nights under the stars.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='amalfi-riviera' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1533105076920-e74f341290a9?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Italy','Italy','Cliffside drives, limoncello terraces, and Positano nights under the stars.','https://images.unsplash.com/photo-1533105076920-e74f341290a9?w=1200&q=80','italy','Amalfi Riviera','Cliffside drives, limoncello terraces, and Positano nights under the stars.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='italy' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Naples to coast', 'Chauffeured transfer; settle in Positano with aperitivo.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Path of the Gods', 'Guided hike with picnic, afternoon at a beach club.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Capri', 'Private gozzo around the island, Blue Grotto weather permitting.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Ravello', 'Villa gardens, optional classical concert, dinner in the hills.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Pompeii & wine', 'Archaeologist-led site visit, Vesuvian winery lunch.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Departure', 'Breakfast and transfer to NAP or Rome.', 6, NOW());

-- Patagonia Wild
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Patagonia Wild','International','Chile & Argentina',4190,'9 days','Glacier trekking, estancia hospitality, and endless southern skies.','Glacier trekking, estancia hospitality, and endless southern skies.','Torres trek, Perito Moreno, Lodge stays','Lodge & estancia stays, Park fees & listed activities, Bilingual guides, Ground transfers','','0','active','patagonia-wild','Patagonia Wild','Glacier trekking, estancia hospitality, and endless southern skies.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='patagonia-wild' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Chile & Argentina','Chile & Argentina','Glacier trekking, estancia hospitality, and endless southern skies.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80','chile-argentina','Patagonia Wild','Glacier trekking, estancia hospitality, and endless southern skies.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='chile-argentina' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Punta Arenas', 'Arrival, briefing, cozy lodge dinner.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Torres del Paine', 'Scenic drive, base hikes, photography stops.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Grey Lake', 'Boat or kayak among icebergs, lodge spa.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Crossing south', 'Border crossing into Argentina, El Calafate.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Perito Moreno', 'Boardwalks and optional mini-trek on the ice.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Estancia day', 'Gaucho culture, asado feast, horseback option.', 6, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 7, 'Free exploration', 'Choose kayaking, cycling, or rest.', 7, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 8, 'Upsala navigation', 'Full-day glacier navigation with lunch.', 8, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 9, 'Departure', 'Transfer to FTE airport.', 9, NOW());

-- Marrakech Riad
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Marrakech Riad','International','Morocco',1890,'5 days','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.','Medina insider tour, Atlas day trip, Cooking class','Boutique riad, Private tours, Selected meals, Airport transfers','','0','active','marrakech-riad','Marrakech Riad','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='marrakech-riad' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Morocco','Morocco','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.','https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80','morocco','Marrakech Riad','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='morocco' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Arrival', 'Riad welcome, mint tea, dinner under the stars.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Medina deep dive', 'Hidden courtyards, artisan studios, lunch in a garden.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Atlas villages', 'Scenic drive, Berber hospitality, optional light hike.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Majorelle & spa', 'Gardens visit, hammam ritual, farewell feast.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Departure', 'Breakfast and airport transfer.', 5, NOW());

-- Bali Serenity
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Bali Serenity','Domestic','Indonesia',1650,'7 days','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.','Ubud wellness, Temple sunrise, Snorkel day','Villa & resort mix, Breakfast daily, Listed activities, Private drivers','','0','active','bali-serenity','Bali Serenity','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='bali-serenity' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Indonesia','Indonesia','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80','indonesia','Bali Serenity','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='indonesia' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Ubud', 'Arrival, villa check-in, welcome massage.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Tegallalang', 'Sunrise terraces, craft villages, organic lunch.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Spiritual morning', 'Water temple purification, free afternoon.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'East coast', 'Transfer to coast, beach club, seafood dinner.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Snorkel & islands', 'Outrigger or speedboat to coral gardens.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Village cycling', 'Easy countryside ride, cooking class.', 6, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 7, 'Departure', 'Breakfast and transfer to DPS.', 7, NOW());

-- Swiss Alpine
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Swiss Alpine','International','Switzerland',3850,'6 days','Glacier Express vistas, lakeside promenades, and fondue by the fire.','Glacier Express vistas, lakeside promenades, and fondue by the fire.','Scenic rail, Zermatt views, Chocolate atelier','Swiss Travel Pass tier, Premium rail seats, 4–5★ hotels, Chocolate workshop','','0','active','swiss-alps','Swiss Alpine','Glacier Express vistas, lakeside promenades, and fondue by the fire.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='swiss-alps' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d8b99?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Switzerland','Switzerland','Glacier Express vistas, lakeside promenades, and fondue by the fire.','https://images.unsplash.com/photo-1530122037265-a5f1f91d8b99?w=1200&q=80','switzerland','Swiss Alpine','Glacier Express vistas, lakeside promenades, and fondue by the fire.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='switzerland' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'Zürich to Lucerne', 'Lake cruise, old town walk, alpine lodge check-in.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Pilatus or Rigi', 'Cog railway day, picnic with panoramic views.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Glacier Express', 'Premium class seats, lunch service en route to Zermatt.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Matterhorn', 'Gornergrat or helicopter option, spa evening.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Montreux', 'Lakeside promenade, Chillon Castle, jazz vibe.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Departure', 'Transfer to GVA or ZRH.', 6, NOW());

-- Costa Rica Pura Vida
INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Costa Rica Pura Vida','International','Costa Rica',2100,'8 days','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.','Arenal volcano, Monteverde, Manual Antonio','Eco-lodges, Naturalist guides, Park entries, Breakfast daily','','0','active','costa-rica-pura','Costa Rica Pura Vida','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();

SET @pkg_id := (SELECT id FROM packages WHERE slug='costa-rica-pura' LIMIT 1);
INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, 'https://images.unsplash.com/photo-1518252267499-012bafbea00b?w=1200&q=80', NOW());
INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('Costa Rica','Costa Rica','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.','https://images.unsplash.com/photo-1518252267499-012bafbea00b?w=1200&q=80','costa-rica','Costa Rica Pura Vida','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();
SET @dest_id := (SELECT id FROM destinations WHERE slug='costa-rica' LIMIT 1);
INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);
DELETE FROM itineraries WHERE package_id=@pkg_id;
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 1, 'San José', 'Arrival, boutique hotel, orientation.', 1, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 2, 'Arenal', 'Hot springs, hanging bridges, volcano views.', 2, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 3, 'Lake activities', 'Kayak or SUP, optional zip-line.', 3, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 4, 'Monteverde', 'Cloud forest reserve, night wildlife walk.', 4, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 5, 'Gulf crossing', 'Scenic drive toward the Pacific.', 5, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 6, 'Manual Antonio', 'Park guided hike, beach afternoon.', 6, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 7, 'Catamaran', 'Sunset sail with snorkeling.', 7, NOW());
INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, 8, 'Departure', 'Transfer to SJO.', 8, NOW());

COMMIT;
