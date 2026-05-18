<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

/**
 * Usage:
 * php migrations/import_existing_data.php --source=/absolute/path/legacy-data.json
 *
 * JSON format:
 * {
 *   "packages": [
 *     {
 *       "title": "...",
 *       "category": "International",
 *       "location": "...",
 *       "price": 120000,
 *       "duration": "6D/5N",
 *       "short_desc": "...",
 *       "full_desc": "...",
 *       "highlights": "a,b,c",
 *       "inclusions": "...",
 *       "exclusions": "...",
 *       "featured": true,
 *       "status": "active",
 *       "slug": "bali-romantic-escape",
 *       "images": ["/uploads/a.jpg"],
 *       "itinerary": [{"day_number":1,"title":"...","description":"...","sort_order":1}],
 *       "destinations": [{"name":"Bali","country":"Indonesia","slug":"bali"}]
 *     }
 *   ]
 * }
 */

$sourceArg = null;
foreach ($argv as $arg) {
    if (str_starts_with($arg, '--source=')) {
        $sourceArg = substr($arg, 9);
    }
}

if (!$sourceArg || !is_file($sourceArg)) {
    fwrite(STDERR, "Missing or invalid --source path\n");
    exit(1);
}

$raw = file_get_contents($sourceArg);
$payload = json_decode((string) $raw, true);
if (!is_array($payload)) {
    fwrite(STDERR, "Invalid JSON\n");
    exit(1);
}

$packages = is_array($payload['packages'] ?? null) ? $payload['packages'] : [];
if (empty($packages)) {
    fwrite(STDOUT, "No packages to import.\n");
    exit(0);
}

$pdo = db();
$pdo->beginTransaction();
try {
    foreach ($packages as $item) {
        $title = trim((string) ($item['title'] ?? ''));
        if ($title === '') {
            continue;
        }
        $slug = trim((string) ($item['slug'] ?? ''));
        $status = trim((string) ($item['status'] ?? 'active')) ?: 'active';
        $category = trim((string) ($item['category'] ?? 'International')) ?: 'International';
        $lookupStmt = $slug !== ''
            ? $pdo->prepare('SELECT id FROM packages WHERE slug=:slug LIMIT 1')
            : $pdo->prepare('SELECT id FROM packages WHERE title=:title LIMIT 1');
        $lookupStmt->execute($slug !== '' ? [':slug' => $slug] : [':title' => $title]);
        $existingId = (int) ($lookupStmt->fetchColumn() ?: 0);

        $row = [
            ':title' => $title,
            ':category' => $category,
            ':location' => trim((string) ($item['location'] ?? '')),
            ':price' => (float) ($item['price'] ?? 0),
            ':duration' => trim((string) ($item['duration'] ?? '')),
            ':short_desc' => trim((string) ($item['short_desc'] ?? '')),
            ':full_desc' => trim((string) ($item['full_desc'] ?? '')),
            ':highlights' => trim((string) ($item['highlights'] ?? '')),
            ':inclusions' => trim((string) ($item['inclusions'] ?? '')),
            ':exclusions' => trim((string) ($item['exclusions'] ?? '')),
            ':featured' => !empty($item['featured']) ? 1 : 0,
            ':status' => $status,
            ':slug' => $slug,
            ':meta_title' => trim((string) ($item['meta_title'] ?? '')),
            ':meta_description' => trim((string) ($item['meta_description'] ?? '')),
        ];

        if ($existingId > 0) {
            $row[':id'] = $existingId;
            $pdo->prepare('UPDATE packages SET title=:title, category=:category, location=:location, price=:price, duration=:duration, short_desc=:short_desc, full_desc=:full_desc, highlights=:highlights, inclusions=:inclusions, exclusions=:exclusions, featured=:featured, status=:status, slug=:slug, meta_title=:meta_title, meta_description=:meta_description, updated_at=NOW() WHERE id=:id')
                ->execute($row);
            $packageId = $existingId;
        } else {
            $pdo->prepare('INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at) VALUES (:title,:category,:location,:price,:duration,:short_desc,:full_desc,:highlights,:inclusions,:exclusions,:featured,:status,:slug,:meta_title,:meta_description,NOW(),NOW())')
                ->execute($row);
            $packageId = (int) $pdo->lastInsertId();
        }

        $pdo->prepare('DELETE FROM itineraries WHERE package_id=:pid')->execute([':pid' => $packageId]);
        foreach ((array) ($item['itinerary'] ?? []) as $day) {
            $pdo->prepare('INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (:pid,:day,:title,:description,:sort_order,NOW())')
                ->execute([
                    ':pid' => $packageId,
                    ':day' => (int) ($day['day_number'] ?? 1),
                    ':title' => trim((string) ($day['title'] ?? 'Day')),
                    ':description' => trim((string) ($day['description'] ?? '')),
                    ':sort_order' => (int) ($day['sort_order'] ?? 0),
                ]);
        }

        foreach ((array) ($item['images'] ?? []) as $imgPath) {
            $imgPath = trim((string) $imgPath);
            if ($imgPath === '') {
                continue;
            }
            $exists = $pdo->prepare('SELECT 1 FROM package_images WHERE package_id=:pid AND image_path=:path LIMIT 1');
            $exists->execute([':pid' => $packageId, ':path' => $imgPath]);
            if (!$exists->fetchColumn()) {
                $pdo->prepare('INSERT INTO package_images (package_id, image_path, created_at) VALUES (:pid,:path,NOW())')
                    ->execute([':pid' => $packageId, ':path' => $imgPath]);
            }
        }

        $pdo->prepare('DELETE FROM destination_package WHERE package_id=:pid')->execute([':pid' => $packageId]);
        foreach ((array) ($item['destinations'] ?? []) as $dest) {
            $name = trim((string) ($dest['name'] ?? ''));
            if ($name === '') {
                continue;
            }
            $country = trim((string) ($dest['country'] ?? $name));
            $destSlug = trim((string) ($dest['slug'] ?? ''));

            $dLookup = $destSlug !== ''
                ? $pdo->prepare('SELECT id FROM destinations WHERE slug=:slug LIMIT 1')
                : $pdo->prepare('SELECT id FROM destinations WHERE name=:name LIMIT 1');
            $dLookup->execute($destSlug !== '' ? [':slug' => $destSlug] : [':name' => $name]);
            $destId = (int) ($dLookup->fetchColumn() ?: 0);
            if ($destId <= 0) {
                $pdo->prepare('INSERT INTO destinations (name,country,description,slug,created_at,updated_at) VALUES (:name,:country,:description,:slug,NOW(),NOW())')
                    ->execute([
                        ':name' => $name,
                        ':country' => $country,
                        ':description' => trim((string) ($dest['description'] ?? '')),
                        ':slug' => $destSlug,
                    ]);
                $destId = (int) $pdo->lastInsertId();
            }
            $pdo->prepare('INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (:did,:pid)')
                ->execute([':did' => $destId, ':pid' => $packageId]);
        }
    }

    $pdo->commit();
    fwrite(STDOUT, "Migration complete.\n");
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fwrite(STDERR, "Migration failed: {$e->getMessage()}\n");
    exit(1);
}

