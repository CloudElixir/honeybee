-- Generated from frontend static content
-- Seeds: reviews, blogs, settings, cms_items
START TRANSACTION;

-- Reviews
DELETE FROM reviews WHERE route='HoneyBee Trips';
INSERT INTO reviews (name, route, text, rating, status, created_at)
VALUES ('Aarya Mehta','HoneyBee Trips','Our Bali trip felt effortless. The Ubud driver was on time, Nusa Penida was planned smart (not rushed), and every hotel check-in was smooth. The small suggestions made all the difference.',4.8,'active',NOW());
INSERT INTO reviews (name, route, text, rating, status, created_at)
VALUES ('Karthik Rao','HoneyBee Trips','From Seminyak beach time to the golden-hour viewpoints, everything matched our vibe. Support on WhatsApp was quick when our schedule shifted, and the itinerary stayed perfectly paced.',4.8,'active',NOW());
INSERT INTO reviews (name, route, text, rating, status, created_at)
VALUES ('Sana Ibrahim','HoneyBee Trips','We loved how seamless the logistics were. Private transfers, clear guidance for each stop, and thoughtful recommendations for temples and cafés. It felt curated, not complicated.',4.8,'active',NOW());

-- Blogs
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Bhutan Signature Travel Guide','bhutan-signature-travel-guide','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.','Monasteries in the clouds, valley drives, and peaceful Himalayan culture at a gentle pace.

Highlights: Tiger’s Nest viewpoint, Paro & Thimphu route, Monastic heritage

Sample plan:
Arrival in Paro: Airport pickup, scenic transfer, and a relaxed walk through the old town.
Thimphu exploration: Buddha Dordenma, local markets, and cultural landmarks at a comfortable pace.
Dochula to Punakha: Mountain pass viewpoints and valley transfer with riverside monastery visits.','https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Santorini Glow Travel Guide','santorini-glow-travel-guide','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.','Whitewashed cliffs, Aegean blues, and sunset dinners crafted for two.

Highlights: Caldera suites, Private yacht morning, Wine & archaeology

Sample plan:
Arrival in Fira: Private transfer to your cliffside suite. Welcome sparkling wine and orientation with your concierge.
Oia & golden hour: Guided stroll through Oia, boutique shopping, and a reserved terrace for sunset.
Volcano & hot springs: Catamaran sail with swim stops, volcanic islets, and onboard lunch with local wines.','https://images.unsplash.com/photo-1613395877344-13d4c79e4284?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Kyoto Heritage Travel Guide','kyoto-heritage-travel-guide','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.','Temple gardens, kaiseki artistry, and quiet ryokan evenings in the old capital.

Highlights: Ryokan stay, Tea ceremony, Arashiyama bamboo

Sample plan:
Welcome to Kyoto: Bullet train or private car from KIX. Check-in to a heritage ryokan with kaiseki dinner.
Gion & temples: Morning walk through Gion, Kennin-ji, and a private tea workshop.
Arashiyama: Bamboo grove at dawn, riverboat option, and temple moss gardens.','https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Amalfi Riviera Travel Guide','amalfi-riviera-travel-guide','Cliffside drives, limoncello terraces, and Positano nights under the stars.','Cliffside drives, limoncello terraces, and Positano nights under the stars.

Highlights: Ravello concert, Capri boat, Michelin dining

Sample plan:
Naples to coast: Chauffeured transfer; settle in Positano with aperitivo.
Path of the Gods: Guided hike with picnic, afternoon at a beach club.
Capri: Private gozzo around the island, Blue Grotto weather permitting.','https://images.unsplash.com/photo-1533105076920-e74f341290a9?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Patagonia Wild Travel Guide','patagonia-wild-travel-guide','Glacier trekking, estancia hospitality, and endless southern skies.','Glacier trekking, estancia hospitality, and endless southern skies.

Highlights: Torres trek, Perito Moreno, Lodge stays

Sample plan:
Punta Arenas: Arrival, briefing, cozy lodge dinner.
Torres del Paine: Scenic drive, base hikes, photography stops.
Grey Lake: Boat or kayak among icebergs, lodge spa.','https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Marrakech Riad Travel Guide','marrakech-riad-travel-guide','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.','Souks, hammam rituals, and Atlas views — sensory luxury at a gentle pace.

Highlights: Medina insider tour, Atlas day trip, Cooking class

Sample plan:
Arrival: Riad welcome, mint tea, dinner under the stars.
Medina deep dive: Hidden courtyards, artisan studios, lunch in a garden.
Atlas villages: Scenic drive, Berber hospitality, optional light hike.','https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Bali Serenity Travel Guide','bali-serenity-travel-guide','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.','Rice terraces, temple mornings, and beach sunsets — restorative island rhythm.

Highlights: Ubud wellness, Temple sunrise, Snorkel day

Sample plan:
Ubud: Arrival, villa check-in, welcome massage.
Tegallalang: Sunrise terraces, craft villages, organic lunch.
Spiritual morning: Water temple purification, free afternoon.','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Swiss Alpine Travel Guide','swiss-alps-travel-guide','Glacier Express vistas, lakeside promenades, and fondue by the fire.','Glacier Express vistas, lakeside promenades, and fondue by the fire.

Highlights: Scenic rail, Zermatt views, Chocolate atelier

Sample plan:
Zürich to Lucerne: Lake cruise, old town walk, alpine lodge check-in.
Pilatus or Rigi: Cog railway day, picnic with panoramic views.
Glacier Express: Premium class seats, lunch service en route to Zermatt.','https://images.unsplash.com/photo-1530122037265-a5f1f91d8b99?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();
INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('Costa Rica Pura Vida Travel Guide','costa-rica-pura-travel-guide','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.','Cloud forests, sloth spotting, and Pacific surf — nature-forward adventure.

Highlights: Arenal volcano, Monteverde, Manual Antonio

Sample plan:
San José: Arrival, boutique hotel, orientation.
Arenal: Hot springs, hanging bridges, volcano views.
Lake activities: Kayak or SUP, optional zip-line.','https://images.unsplash.com/photo-1518252267499-012bafbea00b?w=1200&q=80','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();

-- Settings
INSERT INTO settings (`key`, `value`) VALUES ('site_phone','+91-90000-00000')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('site_email','hello@honeybeetrips.com')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('site_address','India')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('instagram','https://instagram.com/honeybeetrips')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('facebook','https://facebook.com/honeybeetrips')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('youtube','https://youtube.com/@honeybeetrips')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('footer_international','Australia, Austria, Azerbaijan, Bali, Belgium, Bhutan, Cambodia, Egypt, France, Germany, Greece, Italy, Japan, Maldives, Morocco, Portugal, Thailand, Vietnam')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('footer_domestic','Andaman, Goa, Gujarat, Himachal, Karnataka, Kashmir, Kerala, Ladakh, Maharashtra, Meghalaya, Rajasthan, Sikkim, Tamil Nadu, Uttarakhand')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);
INSERT INTO settings (`key`, `value`) VALUES ('footer_themes','Romantic getaways, Group departure, Family funventure, Educational, Religious retreat, Solo expedition, Exploration bundle, Relax & rejuvenate, Elite escape')
ON DUPLICATE KEY UPDATE `value`=VALUES(`value`);

-- CMS Items (trending sections)
DELETE FROM cms_items WHERE section='trending_international';
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Baku Escape','/destinations?q=Baku','https://images.unsplash.com/photo-1590072847031-3a0b55e902df?w=800&q=80','/destinations?q=Baku',0,'','','','',1,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Bali Glow','/destinations/bali-serenity','https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80','/destinations/bali-serenity',0,'','','','',2,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Bhutan Trails','/destinations?q=Bhutan','https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80','/destinations?q=Bhutan',0,'','','','',3,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Angkor Moments','/destinations?q=Angkor','https://images.unsplash.com/photo-1553603227-2358aabe821e?w=800&q=80','/destinations?q=Angkor',0,'','','','',4,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Marrakech Vibes','/destinations/marrakech-riad','https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80','/destinations/marrakech-riad',0,'','','','',5,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_international','global','Kyoto Stories','/destinations/kyoto-heritage','https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80','/destinations/kyoto-heritage',0,'','','','',6,'active',NOW(),NOW());
DELETE FROM cms_items WHERE section='trending_domestic';
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Aspen Peaks','/destinations?q=Aspen','https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80','/destinations?q=Aspen',0,'','','','',1,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Maui Breeze','/destinations?q=Maui','https://images.unsplash.com/photo-1542256393-7d2d7250ffd5?w=800&q=80','/destinations?q=Maui',0,'','','','',2,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Charleston Charm','/destinations?q=Charleston','https://images.unsplash.com/photo-1569163139304-0b3857f58414?w=800&q=80','/destinations?q=Charleston',0,'','','','',3,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Alaska Wild','/destinations?q=Alaska','https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80','/destinations?q=Alaska',0,'','','','',4,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Big Sur Drive','/destinations?q=Big%20Sur','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80','/destinations?q=Big%20Sur',0,'','','','',5,'active',NOW(),NOW());
INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('trending_domestic','global','Sonoma Sips','/destinations?q=Napa','https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80','/destinations?q=Napa',0,'','','','',6,'active',NOW(),NOW());

COMMIT;
