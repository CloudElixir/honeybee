<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

verify_csrf();
$action = (string) ($_POST['action'] ?? '');
$isSqlite = db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

$upsertSetting = static function (string $key, string $value) use ($isSqlite): void {
    if ($isSqlite) {
        db()->prepare('INSERT INTO settings ("key", "value") VALUES (:k,:v) ON CONFLICT("key") DO UPDATE SET "value"=excluded."value"')
            ->execute([':k' => $key, ':v' => $value]);
        return;
    }
    db()->prepare('INSERT INTO settings (`key`,`value`) VALUES (:k,:v) ON DUPLICATE KEY UPDATE value=:v2')
        ->execute([':k' => $key, ':v' => $value, ':v2' => $value]);
};

$upsertSeo = static function (string $scope, string $slug, string $title, string $description) use ($isSqlite): void {
    if ($isSqlite) {
        db()->prepare('INSERT INTO seo_meta (scope, slug, meta_title, meta_description, updated_at) VALUES (:scope,:slug,:title,:desc,NOW()) ON CONFLICT(scope, slug) DO UPDATE SET meta_title=excluded.meta_title, meta_description=excluded.meta_description, updated_at=NOW()')
            ->execute([':scope' => $scope, ':slug' => $slug, ':title' => $title, ':desc' => $description]);
        return;
    }
    db()->prepare('INSERT INTO seo_meta (scope, slug, meta_title, meta_description, updated_at) VALUES (:scope,:slug,:title,:desc,NOW()) ON DUPLICATE KEY UPDATE meta_title=:title2, meta_description=:desc2, updated_at=NOW()')
        ->execute([':scope' => $scope, ':slug' => $slug, ':title' => $title, ':desc' => $description, ':title2' => $title, ':desc2' => $description]);
};

$runSqlSeedFile = static function (string $path) use ($isSqlite): int {
    if (!is_file($path)) {
        throw new RuntimeException('Seed file not found: ' . $path);
    }
    $sql = (string) file_get_contents($path);
    if (trim($sql) === '') {
        throw new RuntimeException('Seed file is empty.');
    }

    $lines = preg_split("/\r?\n/", $sql) ?: [];
    $statements = [];
    $buffer = '';

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
            continue;
        }
        $buffer .= $line . "\n";
        if (str_ends_with(rtrim($line), ';')) {
            $statement = trim($buffer);
            $buffer = '';
            if ($statement !== '') {
                $statements[] = $statement;
            }
        }
    }
    if (trim($buffer) !== '') {
        $statements[] = trim($buffer);
    }

    if (empty($statements)) {
        throw new RuntimeException('No executable SQL statements found in seed file.');
    }

    $vars = [];
    $normalizedStatements = [];
    if ($isSqlite) {
        foreach ($statements as $statement) {
            $trimmed = trim($statement);
            if ($trimmed === '' || strcasecmp($trimmed, 'START TRANSACTION;') === 0 || strcasecmp($trimmed, 'COMMIT;') === 0) {
                continue;
            }

            if (preg_match('/^SET\s+@([a-zA-Z0-9_]+)\s*:=\s*\(SELECT\s+id\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+slug=\'([^\']+)\'\s+LIMIT\s+1\);$/i', $trimmed, $m)) {
                $varName = '@' . $m[1];
                $table = $m[2];
                $slug = $m[3];
                $stmt = db()->prepare("SELECT id FROM {$table} WHERE slug=:slug LIMIT 1");
                $stmt->execute([':slug' => $slug]);
                $vars[$varName] = (int) ($stmt->fetchColumn() ?: 0);
                continue;
            }

            foreach ($vars as $varName => $value) {
                $trimmed = str_replace($varName, (string) $value, $trimmed);
            }
            $trimmed = str_replace('INSERT IGNORE INTO', 'INSERT OR IGNORE INTO', $trimmed);
            $trimmed = preg_replace('/\s+ON\s+DUPLICATE\s+KEY\s+UPDATE\s+.+$/is', '', $trimmed) ?? $trimmed;
            $trimmed = str_replace('NOW()', "datetime('now')", $trimmed);
            $trimmed = trim($trimmed);
            if ($trimmed === '') {
                continue;
            }
            if (!str_ends_with($trimmed, ';')) {
                $trimmed .= ';';
            }
            $normalizedStatements[] = $trimmed;
        }
    } else {
        $normalizedStatements = $statements;
    }

    if (empty($normalizedStatements)) {
        throw new RuntimeException('No normalized SQL statements available for seed.');
    }

    $executed = 0;
    db()->beginTransaction();
    try {
        foreach ($normalizedStatements as $statement) {
            db()->exec($statement);
            $executed++;
        }
        db()->commit();
    } catch (Throwable $e) {
        if (db()->inTransaction()) {
            db()->rollBack();
        }
        throw $e;
    }

    return $executed;
};

$seedHotelsForPackages = static function (): int {
    $packages = db()->query('SELECT id, title, location FROM packages ORDER BY id ASC')->fetchAll();
    $countStmt = db()->prepare('SELECT COUNT(*) FROM package_hotels WHERE package_id=:package_id');
    $insertStmt = db()->prepare('INSERT INTO package_hotels (package_id, name, location, notes, created_at) VALUES (:package_id,:name,:location,:notes,NOW())');
    $inserted = 0;

    foreach ($packages as $pkg) {
        $packageId = (int) ($pkg['id'] ?? 0);
        if ($packageId <= 0) {
            continue;
        }
        $countStmt->execute([':package_id' => $packageId]);
        $existing = (int) $countStmt->fetchColumn();
        if ($existing > 0) {
            continue;
        }

        $title = trim((string) ($pkg['title'] ?? 'Signature Package'));
        $location = trim((string) ($pkg['location'] ?? 'Curated Destination'));
        $rows = [
            ['name' => "{$title} Comfort Stay", 'notes' => '3-star'],
            ['name' => "{$title} Premium Stay", 'notes' => '4-star'],
            ['name' => "{$title} Luxury Stay", 'notes' => '5-star'],
        ];

        foreach ($rows as $row) {
            $insertStmt->execute([
                ':package_id' => $packageId,
                ':name' => $row['name'],
                ':location' => $location,
                ':notes' => $row['notes'],
            ]);
            $inserted++;
        }
    }

    return $inserted;
};

$seedHomepageSectionsFromPackages = static function (bool $nonDestructive = false) use ($isSqlite): int {
    $sections = ['signature', 'travel_style', 'luxury_escapes', 'inspire_deals', 'group_departures', 'trending_destinations'];
    $targets = [
        'signature' => 16,
        'travel_style' => 16,
        'luxury_escapes' => 8,
        'inspire_deals' => 6,
        'group_departures' => 9,
        'trending_destinations' => 16,
    ];
    $fallbackImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80';
    $scopeOf = static function (array $pkg): string {
        return stripos((string) ($pkg['category'] ?? ''), 'domestic') !== false ? 'domestic' : 'international';
    };
    $slugify = static function (string $value): string {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? $value;
        return trim($value, '-');
    };

    $rows = db()->query('
        SELECT p.*,
               (
                 SELECT pi.image_path
                 FROM package_images pi
                 WHERE pi.package_id = p.id
                 ORDER BY pi.id ASC
                 LIMIT 1
               ) AS image_path
        FROM packages p
        WHERE p.status = "active"
        ORDER BY p.is_featured DESC, p.is_trending DESC, p.is_curated DESC, p.featured DESC, p.id DESC
    ')->fetchAll();

    if (empty($rows)) {
        return 0;
    }

    db()->beginTransaction();
    try {
        foreach ($sections as $section) {
            if (!$nonDestructive) {
                db()->prepare('DELETE FROM cms_items WHERE section=:section')->execute([':section' => $section]);
            }
        }

        $insert = db()->prepare('
            INSERT INTO cms_items
            (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
            VALUES
            (:section,:scope,:title,:subtitle,:image_url,:link_url,:price,:duration,:badge,:tags,:extra_json,:sort_order,:status,NOW(),NOW())
        ');

        $existingCounts = [];
        $nextSort = [];
        foreach ($sections as $section) {
            $countStmt = db()->prepare('SELECT COUNT(*) FROM cms_items WHERE section=:section');
            $countStmt->execute([':section' => $section]);
            $existingCounts[$section] = (int) $countStmt->fetchColumn();

            $sortStmt = db()->prepare('SELECT COALESCE(MAX(sort_order), -1) FROM cms_items WHERE section=:section');
            $sortStmt->execute([':section' => $section]);
            $nextSort[$section] = (int) $sortStmt->fetchColumn() + 1;
        }

        $inserted = 0;
        foreach ($rows as $idx => $pkg) {
            $scope = $scopeOf($pkg);
            $title = trim((string) ($pkg['title'] ?? 'Untitled Package'));
            if ($title === '') {
                continue;
            }
            $location = trim((string) ($pkg['location'] ?? 'Curated'));
            $duration = trim((string) ($pkg['duration'] ?? 'Custom'));
            $price = (float) ($pkg['price'] ?? 0);
            $image = trim((string) ($pkg['image_path'] ?? ''));
            if ($image === '') {
                $image = $fallbackImage;
            }
            $slug = trim((string) ($pkg['slug'] ?? ''));
            $link = '/packages/' . ($slug !== '' ? $slug : $slugify($title));

            $badge = ((int) ($pkg['is_trending'] ?? 0) === 1) ? 'hot' : (((int) ($pkg['is_curated'] ?? 0) === 1) ? 'signature' : 'value');
            $tags = 'signature';
            $styleBadge = ((int) ($pkg['is_trending'] ?? 0) === 1) ? 'hotRightNow' : (((int) ($pkg['is_curated'] ?? 0) === 1) ? 'signaturePick' : 'valueChoice');
            $styleTags = 'beach';

            if ($idx < 16 && (!$nonDestructive || $existingCounts['signature'] < $targets['signature'])) {
                $insert->execute([
                    ':section' => 'signature',
                    ':scope' => $scope,
                    ':title' => $title,
                    ':subtitle' => $location,
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => $badge,
                    ':tags' => $tags,
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['signature']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['signature']++;

                if (!$nonDestructive || $existingCounts['travel_style'] < $targets['travel_style']) {
                $insert->execute([
                    ':section' => 'travel_style',
                    ':scope' => $scope,
                    ':title' => $title,
                    ':subtitle' => $location,
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => $styleBadge,
                    ':tags' => $styleTags,
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['travel_style']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['travel_style']++;
                }
            }

            if ($idx < 8 && (!$nonDestructive || $existingCounts['luxury_escapes'] < $targets['luxury_escapes'])) {
                $insert->execute([
                    ':section' => 'luxury_escapes',
                    ':scope' => $scope,
                    ':title' => $title,
                    ':subtitle' => $location,
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => 'luxury',
                    ':tags' => 'luxury',
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['luxury_escapes']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['luxury_escapes']++;
            }

            if ($idx < 6 && (!$nonDestructive || $existingCounts['inspire_deals'] < $targets['inspire_deals'])) {
                $insert->execute([
                    ':section' => 'inspire_deals',
                    ':scope' => $scope,
                    ':title' => $title,
                    ':subtitle' => $location,
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => ((int) ($pkg['is_featured'] ?? 0) === 1 || (int) ($pkg['featured'] ?? 0) === 1) ? 'Featured' : 'Deal',
                    ':tags' => 'deal',
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['inspire_deals']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['inspire_deals']++;
            }

            if ($idx < 9 && (!$nonDestructive || $existingCounts['group_departures'] < $targets['group_departures'])) {
                $insert->execute([
                    ':section' => 'group_departures',
                    ':scope' => $scope,
                    ':title' => $title,
                    ':subtitle' => $location,
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => 'group',
                    ':tags' => 'group',
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['group_departures']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['group_departures']++;
            }

            if ($idx < 16 && (!$nonDestructive || $existingCounts['trending_destinations'] < $targets['trending_destinations'])) {
                $insert->execute([
                    ':section' => 'trending_destinations',
                    ':scope' => $scope,
                    ':title' => $location !== '' ? $location : $title,
                    ':subtitle' => 'Trending',
                    ':image_url' => $image,
                    ':link_url' => $link,
                    ':price' => $price,
                    ':duration' => $duration,
                    ':badge' => 'trending',
                    ':tags' => 'trending',
                    ':extra_json' => '',
                    ':sort_order' => $nonDestructive ? $nextSort['trending_destinations']++ : $idx,
                    ':status' => 'active',
                ]);
                $inserted++;
                $existingCounts['trending_destinations']++;
            }
        }
        db()->commit();
    } catch (Throwable $e) {
        if (db()->inTransaction()) {
            db()->rollBack();
        }
        throw $e;
    }

    return $inserted;
};

try {
    switch ($action) {
        case 'package_save':
            $id = (int) ($_POST['id'] ?? 0);
            $data = [
                ':title' => trim((string) ($_POST['title'] ?? '')),
                ':category' => (string) ($_POST['category'] ?? 'International'),
                ':location' => trim((string) ($_POST['location'] ?? '')),
                ':price' => (float) ($_POST['price'] ?? 0),
                ':duration' => trim((string) ($_POST['duration'] ?? '')),
                ':short_desc' => trim((string) ($_POST['short_desc'] ?? '')),
                ':full_desc' => trim((string) ($_POST['full_desc'] ?? '')),
                ':highlights' => trim((string) ($_POST['highlights'] ?? '')),
                ':inclusions' => trim((string) ($_POST['inclusions'] ?? '')),
                ':exclusions' => trim((string) ($_POST['exclusions'] ?? '')),
                ':important_notes' => trim((string) ($_POST['important_notes'] ?? '')),
                ':terms' => trim((string) ($_POST['terms'] ?? '')),
                ':faq' => trim((string) ($_POST['faq'] ?? '')),
                ':blog_content' => trim((string) ($_POST['blog_content'] ?? '')),
                ':featured' => isset($_POST['featured']) ? 1 : 0,
                ':is_featured' => isset($_POST['is_featured']) ? 1 : 0,
                ':is_curated' => isset($_POST['is_curated']) ? 1 : 0,
                ':is_trending' => isset($_POST['is_trending']) ? 1 : 0,
                ':is_underrated' => isset($_POST['is_underrated']) ? 1 : 0,
                ':status' => (string) ($_POST['status'] ?? 'active'),
                ':slug' => trim((string) ($_POST['slug'] ?? '')),
                ':meta_title' => trim((string) ($_POST['meta_title'] ?? '')),
                ':meta_description' => trim((string) ($_POST['meta_description'] ?? '')),
            ];

            if ($id > 0) {
                $data[':id'] = $id;
                $sql = 'UPDATE packages SET title=:title, category=:category, location=:location, price=:price, duration=:duration, short_desc=:short_desc, full_desc=:full_desc, highlights=:highlights, inclusions=:inclusions, exclusions=:exclusions, important_notes=:important_notes, terms=:terms, faq=:faq, blog_content=:blog_content, featured=:featured, is_featured=:is_featured, is_curated=:is_curated, is_trending=:is_trending, is_underrated=:is_underrated, status=:status, slug=:slug, meta_title=:meta_title, meta_description=:meta_description, updated_at=NOW() WHERE id=:id';
                db()->prepare($sql)->execute($data);
                $packageId = $id;
                log_activity('package', "Updated package #{$id}");
            } else {
                $sql = 'INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, important_notes, terms, faq, blog_content, featured, is_featured, is_curated, is_trending, is_underrated, status, slug, meta_title, meta_description, created_at, updated_at) VALUES (:title,:category,:location,:price,:duration,:short_desc,:full_desc,:highlights,:inclusions,:exclusions,:important_notes,:terms,:faq,:blog_content,:featured,:is_featured,:is_curated,:is_trending,:is_underrated,:status,:slug,:meta_title,:meta_description,NOW(),NOW())';
                db()->prepare($sql)->execute($data);
                $packageId = (int) db()->lastInsertId();
                log_activity('package', "Created package #{$packageId}");
            }

            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $name) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = upload_image($file);
                    if ($path) {
                        db()->prepare('INSERT INTO package_images (package_id, image_path, created_at) VALUES (:package_id,:path,NOW())')
                            ->execute([':package_id' => $packageId, ':path' => $path]);
                    }
                }
            }
            flash('success', 'Package saved successfully.');
            redirect('/admin/packages.php');
            break;

        case 'package_delete':
            $id = (int) ($_POST['id'] ?? 0);
            db()->prepare('DELETE FROM package_images WHERE package_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM itineraries WHERE package_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM package_hotels WHERE package_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM packages WHERE id=:id')->execute([':id' => $id]);
            log_activity('package', "Deleted package #{$id}");
            flash('success', 'Package deleted.');
            redirect('/admin/packages.php');
            break;

        case 'package_image_delete':
            $imageId = (int) ($_POST['image_id'] ?? 0);
            $packageId = (int) ($_POST['package_id'] ?? 0);
            if ($imageId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM package_images WHERE id=:id');
                $stmt->execute([':id' => $imageId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
                db()->prepare('DELETE FROM package_images WHERE id=:id')->execute([':id' => $imageId]);
            }
            flash('success', 'Package image deleted.');
            redirect($packageId > 0 ? ('/admin/packages.php?edit=' . $packageId) : '/admin/packages.php');
            break;

        case 'destination_save':
            $id = (int) ($_POST['id'] ?? 0);
            $coverImage = null;
            if (!empty($_FILES['cover_image']['name'])) {
                $coverImage = upload_image($_FILES['cover_image']);
            }
            $payload = [
                ':name' => trim((string) ($_POST['name'] ?? '')),
                ':continent' => trim((string) ($_POST['continent'] ?? '')),
                ':country' => trim((string) ($_POST['country'] ?? '')),
                ':description' => trim((string) ($_POST['description'] ?? '')),
                ':slug' => trim((string) ($_POST['slug'] ?? '')),
                ':meta_title' => trim((string) ($_POST['meta_title'] ?? '')),
                ':meta_description' => trim((string) ($_POST['meta_description'] ?? '')),
            ];

            if ($id > 0) {
                $sql = 'UPDATE destinations SET name=:name,continent=:continent,country=:country,description=:description,slug=:slug,meta_title=:meta_title,meta_description=:meta_description,updated_at=NOW()' . ($coverImage ? ',cover_image=:cover_image' : '') . ' WHERE id=:id';
                if ($coverImage) {
                    $payload[':cover_image'] = $coverImage;
                }
                $payload[':id'] = $id;
                db()->prepare($sql)->execute($payload);
                log_activity('destination', "Updated destination #{$id}");
            } else {
                $payload[':cover_image'] = $coverImage;
                db()->prepare('INSERT INTO destinations (name,continent,country,description,cover_image,slug,meta_title,meta_description,created_at,updated_at) VALUES (:name,:continent,:country,:description,:cover_image,:slug,:meta_title,:meta_description,NOW(),NOW())')->execute($payload);
                $id = (int) db()->lastInsertId();
                log_activity('destination', "Created destination #{$id}");
            }

            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $unusedName) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = upload_image($file);
                    if ($path) {
                        db()->prepare('INSERT INTO destination_images (destination_id, image_path, created_at) VALUES (:destination_id,:path,NOW())')
                            ->execute([':destination_id' => $id, ':path' => $path]);
                    }
                }
            }

            db()->prepare('DELETE FROM destination_package WHERE destination_id=:id')->execute([':id' => $id]);
            foreach ((array) ($_POST['package_ids'] ?? []) as $pkgId) {
                db()->prepare('INSERT INTO destination_package (destination_id, package_id) VALUES (:did,:pid)')->execute([
                    ':did' => $id,
                    ':pid' => (int) $pkgId,
                ]);
            }

            flash('success', 'Destination saved.');
            redirect('/admin/destinations.php');
            break;

        case 'destination_delete':
            $id = (int) ($_POST['id'] ?? 0);
            db()->prepare('DELETE FROM destination_images WHERE destination_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM destination_package WHERE destination_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM destinations WHERE id=:id')->execute([':id' => $id]);
            log_activity('destination', "Deleted destination #{$id}");
            flash('success', 'Destination deleted.');
            redirect('/admin/destinations.php');
            break;

        case 'destination_image_delete':
            $imageId = (int) ($_POST['image_id'] ?? 0);
            if ($imageId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM destination_images WHERE id=:id');
                $stmt->execute([':id' => $imageId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
                db()->prepare('DELETE FROM destination_images WHERE id=:id')->execute([':id' => $imageId]);
            }
            flash('success', 'Destination image deleted.');
            redirect('/admin/destinations.php');
            break;

        case 'itinerary_save':
            $id = (int) ($_POST['id'] ?? 0);
            $imagePath = null;
            if (!empty($_FILES['image']['name'])) {
                $imagePath = upload_image($_FILES['image']);
            }
            $data = [
                ':package_id' => (int) ($_POST['package_id'] ?? 0),
                ':day_number' => (int) ($_POST['day_number'] ?? 1),
                ':title' => trim((string) ($_POST['title'] ?? '')),
                ':description' => trim((string) ($_POST['description'] ?? '')),
                ':sort_order' => (int) ($_POST['sort_order'] ?? 0),
            ];
            if ($id > 0) {
                $data[':id'] = $id;
                $sql = 'UPDATE itineraries SET package_id=:package_id,day_number=:day_number,title=:title,description=:description,sort_order=:sort_order' . ($imagePath ? ',image_path=:image_path' : '') . ' WHERE id=:id';
                if ($imagePath) {
                    $data[':image_path'] = $imagePath;
                }
                db()->prepare($sql)->execute($data);
                log_activity('itinerary', "Updated itinerary #{$id}");
            } else {
                $data[':image_path'] = $imagePath;
                db()->prepare('INSERT INTO itineraries (package_id,day_number,title,description,image_path,sort_order,created_at) VALUES (:package_id,:day_number,:title,:description,:image_path,:sort_order,NOW())')->execute($data);
                $id = (int) db()->lastInsertId();
                log_activity('itinerary', 'Added itinerary item');
            }

            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $unusedName) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = upload_image($file);
                    if ($path) {
                        db()->prepare('INSERT INTO itinerary_images (itinerary_id, image_path, created_at) VALUES (:itinerary_id,:path,NOW())')
                            ->execute([':itinerary_id' => $id, ':path' => $path]);
                    }
                }
            }
            flash('success', 'Itinerary saved.');
            redirect('/admin/itineraries.php');
            break;

        case 'itinerary_delete':
            $id = (int) ($_POST['id'] ?? 0);
            db()->prepare('DELETE FROM itinerary_images WHERE itinerary_id=:id')->execute([':id' => $id]);
            db()->prepare('DELETE FROM itineraries WHERE id=:id')->execute([':id' => $id]);
            flash('success', 'Itinerary deleted.');
            redirect('/admin/itineraries.php');
            break;

        case 'itinerary_image_delete':
            $imageId = (int) ($_POST['image_id'] ?? 0);
            if ($imageId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM itinerary_images WHERE id=:id');
                $stmt->execute([':id' => $imageId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
                db()->prepare('DELETE FROM itinerary_images WHERE id=:id')->execute([':id' => $imageId]);
            }
            flash('success', 'Itinerary image deleted.');
            redirect('/admin/itineraries.php');
            break;

        case 'hotel_save':
            $id = (int) ($_POST['id'] ?? 0);
            $hotelType = (string) ($_POST['hotel_type'] ?? '3-star');
            if (!in_array($hotelType, ['3-star', '4-star', '5-star'], true)) {
                $hotelType = '3-star';
            }

            $imagePath = null;
            if (!empty($_FILES['image']['name'])) {
                $imagePath = upload_image($_FILES['image']);
            }

            $row = [
                ':package_id' => (int) ($_POST['package_id'] ?? 0),
                ':name' => trim((string) ($_POST['name'] ?? '')),
                ':location' => trim((string) ($_POST['location'] ?? '')),
                ':hotel_type' => $hotelType,
                ':notes' => trim((string) ($_POST['notes'] ?? '')),
            ];
            if ($id > 0) {
                $row[':id'] = $id;
                $sql = 'UPDATE package_hotels SET package_id=:package_id,name=:name,location=:location,hotel_type=:hotel_type,notes=:notes'
                    . ($imagePath ? ',image_path=:image_path' : '')
                    . ' WHERE id=:id';
                if ($imagePath) {
                    $row[':image_path'] = $imagePath;
                }
                db()->prepare($sql)->execute($row);
            } else {
                $row[':image_path'] = $imagePath;
                db()->prepare('INSERT INTO package_hotels (package_id,name,location,hotel_type,image_path,notes,created_at) VALUES (:package_id,:name,:location,:hotel_type,:image_path,:notes,NOW())')->execute($row);
                $id = (int) db()->lastInsertId();
            }
            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $unusedName) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = upload_image($file);
                    if ($path) {
                        db()->prepare('INSERT INTO hotel_images (hotel_id, image_path, created_at) VALUES (:hotel_id,:path,NOW())')
                            ->execute([':hotel_id' => $id, ':path' => $path]);
                    }
                }
            }
            flash('success', 'Hotel details saved.');
            redirect('/admin/hotels.php');
            break;

        case 'hotel_delete':
            $hotelId = (int) ($_POST['id'] ?? 0);
            if ($hotelId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM package_hotels WHERE id=:id');
                $stmt->execute([':id' => $hotelId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
            }
            db()->prepare('DELETE FROM hotel_images WHERE hotel_id=:id')->execute([':id' => $hotelId]);
            db()->prepare('DELETE FROM package_hotels WHERE id=:id')->execute([':id' => $hotelId]);
            flash('success', 'Hotel removed.');
            redirect('/admin/hotels.php');
            break;

        case 'hotel_image_delete':
            $imageId = (int) ($_POST['image_id'] ?? 0);
            if ($imageId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM hotel_images WHERE id=:id');
                $stmt->execute([':id' => $imageId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
                db()->prepare('DELETE FROM hotel_images WHERE id=:id')->execute([':id' => $imageId]);
            }
            flash('success', 'Hotel image deleted.');
            redirect('/admin/hotels.php');
            break;

        case 'review_save':
            $id = (int) ($_POST['id'] ?? 0);
            $payload = [
                ':name' => trim((string) ($_POST['name'] ?? '')),
                ':route' => trim((string) ($_POST['route'] ?? '')),
                ':text' => trim((string) ($_POST['text'] ?? '')),
                ':rating' => (float) ($_POST['rating'] ?? 5),
                ':status' => (string) ($_POST['status'] ?? 'active'),
            ];
            if ($id > 0) {
                $payload[':id'] = $id;
                db()->prepare('UPDATE reviews SET name=:name, route=:route, text=:text, rating=:rating, status=:status WHERE id=:id')
                    ->execute($payload);
            } else {
                db()->prepare('INSERT INTO reviews (name, route, text, rating, status, created_at) VALUES (:name,:route,:text,:rating,:status,NOW())')
                    ->execute($payload);
            }
            flash('success', 'Review saved.');
            redirect('/admin/reviews.php');
            break;

        case 'review_delete':
            db()->prepare('DELETE FROM reviews WHERE id=:id')->execute([':id' => (int) ($_POST['id'] ?? 0)]);
            flash('success', 'Review deleted.');
            redirect('/admin/reviews.php');
            break;

        case 'blog_save':
            $id = (int) ($_POST['id'] ?? 0);
            $payload = [
                ':title' => trim((string) ($_POST['title'] ?? '')),
                ':slug' => trim((string) ($_POST['slug'] ?? '')),
                ':excerpt' => trim((string) ($_POST['excerpt'] ?? '')),
                ':content' => trim((string) ($_POST['content'] ?? '')),
                ':cover_image' => trim((string) ($_POST['cover_image'] ?? '')),
                ':status' => (string) ($_POST['status'] ?? 'active'),
            ];
            if ($id > 0) {
                $payload[':id'] = $id;
                db()->prepare('UPDATE blogs SET title=:title, slug=:slug, excerpt=:excerpt, content=:content, cover_image=:cover_image, status=:status, updated_at=NOW() WHERE id=:id')
                    ->execute($payload);
            } else {
                db()->prepare('INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at) VALUES (:title,:slug,:excerpt,:content,:cover_image,:status,NOW(),NOW())')
                    ->execute($payload);
                $id = (int) db()->lastInsertId();
            }
            if (!empty($_FILES['images']['name'][0])) {
                foreach ($_FILES['images']['name'] as $i => $unusedName) {
                    $file = [
                        'name' => $_FILES['images']['name'][$i],
                        'type' => $_FILES['images']['type'][$i],
                        'tmp_name' => $_FILES['images']['tmp_name'][$i],
                        'error' => $_FILES['images']['error'][$i],
                        'size' => $_FILES['images']['size'][$i],
                    ];
                    $path = upload_image($file);
                    if ($path) {
                        db()->prepare('INSERT INTO blog_images (blog_id, image_path, created_at) VALUES (:blog_id,:path,NOW())')
                            ->execute([':blog_id' => $id, ':path' => $path]);
                    }
                }
            }
            flash('success', 'Blog saved.');
            redirect('/admin/blogs.php');
            break;

        case 'blog_delete':
            $blogId = (int) ($_POST['id'] ?? 0);
            db()->prepare('DELETE FROM blog_images WHERE blog_id=:id')->execute([':id' => $blogId]);
            db()->prepare('DELETE FROM blogs WHERE id=:id')->execute([':id' => $blogId]);
            flash('success', 'Blog deleted.');
            redirect('/admin/blogs.php');
            break;

        case 'blog_image_delete':
            $imageId = (int) ($_POST['image_id'] ?? 0);
            if ($imageId > 0) {
                $stmt = db()->prepare('SELECT image_path FROM blog_images WHERE id=:id');
                $stmt->execute([':id' => $imageId]);
                $row = $stmt->fetch();
                if ($row && !empty($row['image_path'])) {
                    $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                    $fullPath = __DIR__ . '/..' . str_replace($base, '', (string) $row['image_path']);
                    if (is_file($fullPath)) {
                        @unlink($fullPath);
                    }
                }
                db()->prepare('DELETE FROM blog_images WHERE id=:id')->execute([':id' => $imageId]);
            }
            flash('success', 'Blog image deleted.');
            redirect('/admin/blogs.php');
            break;

        case 'booking_update':
            db()->prepare('UPDATE bookings SET status=:status, notes=:notes, updated_at=NOW() WHERE id=:id')->execute([
                ':status' => (string) ($_POST['status'] ?? 'new'),
                ':notes' => trim((string) ($_POST['notes'] ?? '')),
                ':id' => (int) ($_POST['id'] ?? 0),
            ]);
            flash('success', 'Booking updated.');
            redirect('/admin/bookings.php');
            break;

        case 'enquiry_update':
            db()->prepare('UPDATE enquiries SET status=:status, notes=:notes, updated_at=NOW() WHERE id=:id')->execute([
                ':status' => (string) ($_POST['status'] ?? 'new'),
                ':notes' => trim((string) ($_POST['notes'] ?? '')),
                ':id' => (int) ($_POST['id'] ?? 0),
            ]);
            flash('success', 'Enquiry updated.');
            redirect('/admin/enquiries.php');
            break;

        case 'media_upload':
            foreach ($_FILES['images']['name'] ?? [] as $i => $unused) {
                $file = [
                    'name' => $_FILES['images']['name'][$i],
                    'type' => $_FILES['images']['type'][$i],
                    'tmp_name' => $_FILES['images']['tmp_name'][$i],
                    'error' => $_FILES['images']['error'][$i],
                    'size' => $_FILES['images']['size'][$i],
                ];
                upload_image($file);
            }
            flash('success', 'Media uploaded.');
            redirect('/admin/media.php');
            break;

        case 'media_delete':
            $id = (int) ($_POST['id'] ?? 0);
            $stmt = db()->prepare('SELECT file_path FROM media WHERE id=:id');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                $base = (defined('APP_BASE_PATH') ? APP_BASE_PATH : '');
                $fullPath = __DIR__ . '/..' . str_replace($base, '', $row['file_path']);
                if (is_file($fullPath)) {
                    @unlink($fullPath);
                }
                db()->prepare('DELETE FROM media WHERE id=:id')->execute([':id' => $id]);
            }
            flash('success', 'Media deleted.');
            redirect('/admin/media.php');
            break;

        case 'cms_save':
            $sections = ['hero_title','hero_subtitle','hero_button_text','hero_button_url','offers_content','testimonials_content','featured_packages_title'];
            foreach ($sections as $key) {
                $upsertSetting($key, (string) ($_POST[$key] ?? ''));
            }
            if (!empty($_FILES['hero_banner']['name'])) {
                $path = upload_image($_FILES['hero_banner']);
                if ($path) {
                    $upsertSetting('hero_banner', $path);
                }
            }
            flash('success', 'Homepage CMS updated.');
            redirect('/admin/cms.php');
            break;

        case 'cms_item_save':
            $id = (int) ($_POST['id'] ?? 0);
            $payload = [
                ':section' => trim((string) ($_POST['section'] ?? '')),
                ':scope' => trim((string) ($_POST['scope'] ?? 'global')),
                ':title' => trim((string) ($_POST['title'] ?? '')),
                ':subtitle' => trim((string) ($_POST['subtitle'] ?? '')),
                ':image_url' => trim((string) ($_POST['image_url'] ?? '')),
                ':link_url' => trim((string) ($_POST['link_url'] ?? '')),
                ':price' => (float) ($_POST['price'] ?? 0),
                ':duration' => trim((string) ($_POST['duration'] ?? '')),
                ':badge' => trim((string) ($_POST['badge'] ?? '')),
                ':tags' => trim((string) ($_POST['tags'] ?? '')),
                ':extra_json' => trim((string) ($_POST['extra_json'] ?? '')),
                ':sort_order' => (int) ($_POST['sort_order'] ?? 0),
                ':status' => (string) ($_POST['status'] ?? 'active'),
            ];
            if ($id > 0) {
                $payload[':id'] = $id;
                db()->prepare('UPDATE cms_items SET section=:section,scope=:scope,title=:title,subtitle=:subtitle,image_url=:image_url,link_url=:link_url,price=:price,duration=:duration,badge=:badge,tags=:tags,extra_json=:extra_json,sort_order=:sort_order,status=:status,updated_at=NOW() WHERE id=:id')
                    ->execute($payload);
            } else {
                db()->prepare('INSERT INTO cms_items (section,scope,title,subtitle,image_url,link_url,price,duration,badge,tags,extra_json,sort_order,status,created_at,updated_at) VALUES (:section,:scope,:title,:subtitle,:image_url,:link_url,:price,:duration,:badge,:tags,:extra_json,:sort_order,:status,NOW(),NOW())')
                    ->execute($payload);
            }
            flash('success', 'CMS section item saved.');
            redirect('/admin/website_sections.php?tab=' . urlencode((string) ($payload[':section'] ?: 'signature')));
            break;

        case 'cms_item_delete':
            $id = (int) ($_POST['id'] ?? 0);
            $section = trim((string) ($_POST['section'] ?? 'signature'));
            db()->prepare('DELETE FROM cms_items WHERE id=:id')->execute([':id' => $id]);
            flash('success', 'CMS section item deleted.');
            redirect('/admin/website_sections.php?tab=' . urlencode($section));
            break;

        case 'cms_items_reorder':
            $section = trim((string) ($_POST['section'] ?? 'signature'));
            $orders = (array) ($_POST['sort_orders'] ?? []);
            $stmt = db()->prepare('UPDATE cms_items SET sort_order=:sort_order, updated_at=NOW() WHERE id=:id');
            foreach ($orders as $id => $sort) {
                $stmt->execute([
                    ':sort_order' => (int) $sort,
                    ':id' => (int) $id,
                ]);
            }
            flash('success', 'Section order updated.');
            redirect('/admin/website_sections.php?tab=' . urlencode($section));
            break;

        case 'settings_save':
            $keys = ['site_phone','site_email','site_address','facebook','instagram','youtube'];
            foreach ($keys as $k) {
                $v = trim((string) ($_POST[$k] ?? ''));
                $upsertSetting($k, $v);
            }
            if (!empty($_POST['admin_email']) && !empty($_POST['admin_password'])) {
                db()->prepare('UPDATE admins SET email=:email, password_hash=:ph, updated_at=NOW() WHERE id=:id')->execute([
                    ':email' => trim((string) $_POST['admin_email']),
                    ':ph' => password_hash((string) $_POST['admin_password'], PASSWORD_DEFAULT),
                    ':id' => current_admin()['id'],
                ]);
            }
            flash('success', 'Settings updated.');
            redirect('/admin/settings.php');
            break;

        case 'seo_save':
            $scope = trim((string) ($_POST['scope'] ?? 'global'));
            $upsertSeo(
                $scope,
                trim((string) ($_POST['slug'] ?? '')),
                trim((string) ($_POST['meta_title'] ?? '')),
                trim((string) ($_POST['meta_description'] ?? ''))
            );
            flash('success', 'SEO details saved.');
            redirect('/admin/settings.php');
            break;

        case 'seed_frontend_data':
            $seedPath = realpath(__DIR__ . '/../migrations/frontend_seed.sql') ?: (__DIR__ . '/../migrations/frontend_seed.sql');
            $count = $runSqlSeedFile($seedPath);
            $hotelsInserted = $seedHotelsForPackages();
            log_activity('seed', "Seeded frontend data using frontend_seed.sql ({$count} statements, {$hotelsInserted} hotels inserted)");
            flash('success', "Frontend data seeded successfully ({$count} SQL statements, {$hotelsInserted} hotel rows).");
            redirect('/admin/website_sections.php');
            break;

        case 'seed_home_sections_from_packages':
            $inserted = $seedHomepageSectionsFromPackages();
            log_activity('seed', "Seeded homepage CMS sections from active packages ({$inserted} rows)");
            flash('success', "Homepage CMS sections seeded from active packages ({$inserted} rows).");
            redirect('/admin/website_sections.php');
            break;

        case 'seed_home_sections_non_destructive':
            $inserted = $seedHomepageSectionsFromPackages(true);
            log_activity('seed', "Filled missing homepage CMS rows from active packages ({$inserted} rows)");
            flash('success', "Missing homepage CMS rows filled from active packages ({$inserted} rows).");
            redirect('/admin/website_sections.php');
            break;

        default:
            flash('error', 'Unknown action.');
            redirect('/admin/dashboard.php');
    }
} catch (Throwable $e) {
    flash('error', 'Action failed: ' . $e->getMessage());
    redirect('/admin/dashboard.php');
}

