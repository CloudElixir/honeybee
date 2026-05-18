-- Generated placeholder hotels from frontend destinations
START TRANSACTION;

-- Bhutan Signature
SET @pkg_id := (SELECT id FROM packages WHERE slug='bhutan-signature' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Bhutan Signature Signature Stay', 'Bhutan', 'Placeholder hotel entry for Bhutan Signature. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Santorini Glow
SET @pkg_id := (SELECT id FROM packages WHERE slug='santorini-glow' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Santorini Glow Signature Stay', 'Greece', 'Placeholder hotel entry for Santorini Glow. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Kyoto Heritage
SET @pkg_id := (SELECT id FROM packages WHERE slug='kyoto-heritage' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Kyoto Heritage Signature Stay', 'Japan', 'Placeholder hotel entry for Kyoto Heritage. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Amalfi Riviera
SET @pkg_id := (SELECT id FROM packages WHERE slug='amalfi-riviera' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Amalfi Riviera Signature Stay', 'Italy', 'Placeholder hotel entry for Amalfi Riviera. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Patagonia Wild
SET @pkg_id := (SELECT id FROM packages WHERE slug='patagonia-wild' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Patagonia Wild Signature Stay', 'Chile & Argentina', 'Placeholder hotel entry for Patagonia Wild. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Marrakech Riad
SET @pkg_id := (SELECT id FROM packages WHERE slug='marrakech-riad' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Marrakech Riad Signature Stay', 'Morocco', 'Placeholder hotel entry for Marrakech Riad. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Bali Serenity
SET @pkg_id := (SELECT id FROM packages WHERE slug='bali-serenity' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Bali Serenity Signature Stay', 'Indonesia', 'Placeholder hotel entry for Bali Serenity. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Swiss Alpine
SET @pkg_id := (SELECT id FROM packages WHERE slug='swiss-alps' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Swiss Alpine Signature Stay', 'Switzerland', 'Placeholder hotel entry for Swiss Alpine. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

-- Costa Rica Pura Vida
SET @pkg_id := (SELECT id FROM packages WHERE slug='costa-rica-pura' LIMIT 1);
DELETE FROM package_hotels WHERE package_id=@pkg_id;
INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, 'Costa Rica Pura Vida Signature Stay', 'Costa Rica', 'Placeholder hotel entry for Costa Rica Pura Vida. Update with final stay details in Admin > Hotels.', NOW() WHERE @pkg_id IS NOT NULL;

COMMIT;
