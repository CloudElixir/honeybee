<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');
// Avoid stale package/itinerary data in browsers and intermediaries during CMS edits.
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    // Allow-list origins via config (comma-separated).
    $allowed = array_values(array_filter(array_map('trim', explode(',', (string) (defined('APP_CORS_ORIGINS') ? APP_CORS_ORIGINS : '')))));
    if (empty($allowed) || in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Optional request logging when HB_API_DEBUG=1 in .env or server env.
 */
function hb_api_debug_log(string $message): void
{
    $flag = getenv('HB_API_DEBUG');
    if ($flag === false || $flag === '' || $flag === '0' || strcasecmp((string) $flag, 'false') === 0) {
        return;
    }
    $dir = __DIR__ . '/../storage';
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
    @file_put_contents($dir . '/api.log', date('c') . ' ' . $message . PHP_EOL, FILE_APPEND);
}

function hb_parse_trip_days_from_duration(?string $duration): ?int
{
    if ($duration === null || trim($duration) === '') {
        return null;
    }
    if (preg_match('/(\d+)\s*D\b/i', $duration, $m)) {
        return (int) $m[1];
    }
    if (preg_match('/(\d+)\s*days?\b/i', $duration, $m)) {
        return (int) $m[1];
    }
    return null;
}

/** Match frontend `normalizeSlug` in luxuryHelpers.js (slug / title / URL segment). */
function hb_normalize_slug(string $value): string
{
    $s = strtolower(trim($value));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

/** Ensure `hotel_type` is set when legacy rows only have notes like "3-star". */
function hb_normalize_hotel_row(array &$row): void
{
    $type = strtolower(trim((string) ($row['hotel_type'] ?? '')));
    if ($type === '3-star' || $type === '4-star' || $type === '5-star') {
        $row['hotel_type'] = $type;
        return;
    }
    $notes = strtolower(trim((string) ($row['notes'] ?? '')));
    if ($notes === '3-star' || $notes === '4-star' || $notes === '5-star') {
        $row['hotel_type'] = $notes;
        return;
    }
    if (preg_match('/\b([345])\s*[- ]?\s*star\b/i', (string) ($row['notes'] ?? ''), $m)) {
        $row['hotel_type'] = $m[1] . '-star';
    }
}

/** Resolve numeric package id from URL slug when client id is missing or stale. */
function hb_resolve_package_id_by_slug(PDO $pdo, string $pkgActiveSql, string $slugInput): ?int
{
    $want = hb_normalize_slug($slugInput);
    if ($want === '') {
        return null;
    }
    $stmt = $pdo->query("SELECT id, slug, title FROM packages p WHERE {$pkgActiveSql} ORDER BY p.featured DESC, p.is_featured DESC, p.is_trending DESC, p.is_curated DESC, p.id DESC");
    if (!$stmt) {
        return null;
    }
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $id = (int) ($row['id'] ?? 0);
        if ($id <= 0) {
            continue;
        }
        $rawSlug = trim((string) ($row['slug'] ?? ''));
        $pick = $rawSlug !== '' ? $rawSlug : (string) ($row['title'] ?? '');
        if ($pick === '') {
            $pick = (string) $id;
        }
        if (hb_normalize_slug($pick) === $want) {
            return $id;
        }
    }

    return null;
}

/**
 * Package id list for package_hotels / package_itineraries.
 * Prefer package_id and package_ids from the client (same package the UI already picked).
 * Use slug resolution only when no numeric ids were sent — avoids pulling another package's rows
 * when slug matching order differs from the packages list used on the frontend.
 */
function hb_package_ids_for_scope(PDO $pdo, string $pkgActiveSql, string $slugHint): array
{
    $ids = [];
    $singleId = (int) ($_GET['package_id'] ?? 0);
    $idsRaw = trim((string) ($_GET['package_ids'] ?? ''));
    if ($singleId > 0) {
        $ids[] = $singleId;
    }
    if ($idsRaw !== '') {
        foreach (explode(',', $idsRaw) as $part) {
            $id = (int) trim($part);
            if ($id > 0) {
                $ids[] = $id;
            }
        }
    }
    $ids = array_values(array_unique(array_filter($ids, static fn($x) => (int) $x > 0)));
    if (!empty($ids)) {
        return $ids;
    }
    $hint = trim($slugHint !== '' ? $slugHint : (string) ($_GET['package_slug'] ?? ''));
    if ($hint === '') {
        return [];
    }
    $resolved = hb_resolve_package_id_by_slug($pdo, $pkgActiveSql, $hint);
    if ($resolved !== null && $resolved > 0) {
        return [$resolved];
    }

    return [];
}

$resource = (string) ($_GET['resource'] ?? 'packages');
hb_api_debug_log(($_SERVER['REQUEST_METHOD'] ?? '') . ' resource=' . $resource . ' ' . ($_SERVER['QUERY_STRING'] ?? ''));

$isSqlite = db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

/** Active = trimmed, case-insensitive; allow common variants from imports / older rows. */
$pkgActiveSql = "(
    LOWER(TRIM(COALESCE(p.status, ''))) IN ('active', 'published', 'live')
    OR TRIM(COALESCE(p.status, '')) = '1'
)";
/** Prefer first gallery image; fall back to row cover_image when set in admin. */
$pkgImageSelectSql = 'COALESCE(
    (SELECT pi.image_path FROM package_images pi WHERE pi.package_id = p.id ORDER BY pi.id ASC LIMIT 1),
    NULLIF(TRIM(COALESCE(p.cover_image, \'\')), \'\')
) AS image_path';

switch ($resource) {
    case 'packages':
        $category = trim((string) ($_GET['category'] ?? ''));
        $location = trim((string) ($_GET['location'] ?? ''));
        $q = trim((string) ($_GET['q'] ?? ''));
        $minPrice = $_GET['min_price'] ?? '';
        $maxPrice = $_GET['max_price'] ?? '';
        $minDays = $_GET['min_days'] ?? '';
        $maxDays = $_GET['max_days'] ?? '';
        $honeybee = isset($_GET['honeybee_pick']) ? filter_var($_GET['honeybee_pick'], FILTER_VALIDATE_BOOLEAN) : null;
        $trending = isset($_GET['trending']) ? filter_var($_GET['trending'], FILTER_VALIDATE_BOOLEAN) : null;
        $curated = isset($_GET['curated']) ? filter_var($_GET['curated'], FILTER_VALIDATE_BOOLEAN) : null;

        $sql = "
            SELECT p.*,
                   {$pkgImageSelectSql}
            FROM packages p
            WHERE {$pkgActiveSql}
        ";
        $params = [];
        if ($category === 'International' || $category === 'Domestic') {
            $sql .= ' AND p.category = :category';
            $params[':category'] = $category;
        }
        if ($location !== '') {
            $sql .= ' AND p.location LIKE :location';
            $params[':location'] = '%' . $location . '%';
        }
        if ($q !== '') {
            $sql .= ' AND (p.title LIKE :q OR p.location LIKE :q OR IFNULL(p.short_desc,"") LIKE :q)';
            $params[':q'] = '%' . $q . '%';
        }
        if ($minPrice !== '' && is_numeric($minPrice)) {
            $sql .= ' AND p.price >= :min_price';
            $params[':min_price'] = (float) $minPrice;
        }
        if ($maxPrice !== '' && is_numeric($maxPrice)) {
            $sql .= ' AND p.price <= :max_price';
            $params[':max_price'] = (float) $maxPrice;
        }
        if ($honeybee === true) {
            $sql .= ' AND (p.is_featured = 1 OR p.featured = 1)';
        }
        if ($trending === true) {
            $sql .= ' AND p.is_trending = 1';
        }
        if ($curated === true) {
            $sql .= ' AND p.is_curated = 1';
        }

        $sql .= ' ORDER BY p.featured DESC, p.is_featured DESC, p.is_trending DESC, p.is_curated DESC, p.id DESC';

        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $minD = ($minDays !== '' && is_numeric($minDays)) ? (int) $minDays : null;
        $maxD = ($maxDays !== '' && is_numeric($maxDays)) ? (int) $maxDays : null;
        if ($minD !== null || $maxD !== null) {
            $rows = array_values(array_filter($rows, static function (array $row) use ($minD, $maxD): bool {
                $days = hb_parse_trip_days_from_duration((string) ($row['duration'] ?? ''));
                if ($days === null) {
                    return false;
                }
                if ($minD !== null && $days < $minD) {
                    return false;
                }
                if ($maxD !== null && $days > $maxD) {
                    return false;
                }
                return true;
            }));
        }

        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'featured_packages':
        $rows = db()->query("
            SELECT p.*,
                   {$pkgImageSelectSql}
            FROM packages p
            WHERE {$pkgActiveSql} AND (p.is_featured=1 OR p.featured=1)
            ORDER BY p.is_featured DESC, p.featured DESC, p.id DESC
        ")->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'destinations':
        $rows = db()->query('SELECT * FROM destinations ORDER BY id DESC')->fetchAll();
        $imagesByDestination = [];
        if (!empty($rows)) {
            $destinationIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows), static fn($id) => $id > 0));
            if (!empty($destinationIds)) {
                $placeholders = implode(',', array_fill(0, count($destinationIds), '?'));
                $imgStmt = db()->prepare("SELECT destination_id, image_path FROM destination_images WHERE destination_id IN ({$placeholders}) ORDER BY id ASC");
                $imgStmt->execute($destinationIds);
                $imgRows = $imgStmt->fetchAll();
                foreach ($imgRows as $imgRow) {
                    $destinationId = (int) ($imgRow['destination_id'] ?? 0);
                    if (!isset($imagesByDestination[$destinationId])) {
                        $imagesByDestination[$destinationId] = [];
                    }
                    $imagesByDestination[$destinationId][] = (string) ($imgRow['image_path'] ?? '');
                }
            }
            foreach ($rows as &$row) {
                $id = (int) ($row['id'] ?? 0);
                $paths = $imagesByDestination[$id] ?? [];
                $cover = trim((string) ($row['cover_image'] ?? ''));
                if ($cover !== '') {
                    array_unshift($paths, $cover);
                    $paths = array_values(array_unique($paths));
                }
                $row['image_paths'] = $paths;
            }
            unset($row);
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'settings':
        $rows = $isSqlite
            ? db()->query('SELECT "key","value" FROM settings')->fetchAll()
            : db()->query('SELECT `key`,`value` FROM settings')->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'destination_packages':
        $destinationId = (int) ($_GET['destination_id'] ?? 0);
        if ($destinationId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'destination_id is required']);
            break;
        }
        if ($isSqlite) {
            $stmt = db()->prepare("
                SELECT p.*,
                       {$pkgImageSelectSql}
                FROM packages p
                INNER JOIN destination_package dp ON dp.package_id = p.id
                WHERE dp.destination_id = :id AND {$pkgActiveSql}
                ORDER BY p.featured DESC, p.id DESC
            ");
        } else {
            $stmt = db()->prepare("
                SELECT p.*,
                       {$pkgImageSelectSql}
                FROM packages p
                INNER JOIN destination_package dp ON dp.package_id = p.id
                WHERE dp.destination_id = :id AND {$pkgActiveSql}
                ORDER BY p.featured DESC, p.id DESC
            ");
        }
        $stmt->execute([':id' => $destinationId]);
        $rows = $stmt->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'related_packages':
        $packageId = (int) ($_GET['package_id'] ?? 0);
        $slugHint = trim((string) ($_GET['package_slug'] ?? ''));
        if ($packageId <= 0 && $slugHint !== '') {
            $resolved = hb_resolve_package_id_by_slug(db(), $pkgActiveSql, $slugHint);
            if ($resolved !== null && $resolved > 0) {
                $packageId = $resolved;
            }
        }
        if ($packageId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id or package_slug is required']);
            break;
        }
        $limit = max(1, min(12, (int) ($_GET['limit'] ?? 6)));
        $stmt = db()->prepare('SELECT id, category FROM packages WHERE id=:id LIMIT 1');
        $stmt->execute([':id' => $packageId]);
        $currentPackage = $stmt->fetch();
        if (!$currentPackage) {
            echo json_encode(['data' => []], JSON_UNESCAPED_UNICODE);
            break;
        }

        $destinationStmt = db()->prepare('SELECT destination_id FROM destination_package WHERE package_id=:id');
        $destinationStmt->execute([':id' => $packageId]);
        $destinationIds = array_values(array_filter(array_map('intval', array_column($destinationStmt->fetchAll(), 'destination_id'))));

        $params = [':package_id' => $packageId, ':category' => (string) ($currentPackage['category'] ?? '')];
        $limitSql = (string) $limit;
        if (!empty($destinationIds)) {
            $placeholders = [];
            foreach ($destinationIds as $index => $destinationId) {
                $key = ':destination_' . $index;
                $placeholders[] = $key;
                $params[$key] = $destinationId;
            }
            $sql = "
                SELECT p.*,
                       {$pkgImageSelectSql},
                       COUNT(DISTINCT dp.destination_id) AS shared_destinations
                FROM packages p
                LEFT JOIN destination_package dp ON dp.package_id = p.id
                WHERE p.id <> :package_id
                  AND {$pkgActiveSql}
                  AND (p.category = :category OR dp.destination_id IN (" . implode(',', $placeholders) . "))
                GROUP BY p.id
                ORDER BY shared_destinations DESC, p.is_trending DESC, p.is_curated DESC, p.featured DESC, p.id DESC
                LIMIT {$limitSql}";
            $relatedStmt = db()->prepare($sql);
            $relatedStmt->execute($params);
            $rows = $relatedStmt->fetchAll();
        } else {
            $relatedStmt = db()->prepare("
                SELECT p.*,
                       {$pkgImageSelectSql}
                FROM packages p
                WHERE p.id <> :package_id
                  AND {$pkgActiveSql}
                  AND p.category = :category
                ORDER BY p.is_trending DESC, p.is_curated DESC, p.featured DESC, p.id DESC
                LIMIT {$limitSql}");
            $relatedStmt->execute($params);
            $rows = $relatedStmt->fetchAll();
        }

        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'package_hotels':
        $slugHint = trim((string) ($_GET['package_slug'] ?? ''));
        $ids = hb_package_ids_for_scope(db(), $pkgActiveSql, $slugHint);
        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id, package_ids, or package_slug is required']);
            break;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = db()->prepare("SELECT * FROM package_hotels WHERE package_id IN ({$placeholders}) ORDER BY id DESC");
        $stmt->execute($ids);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['image_paths'] = [];
            hb_normalize_hotel_row($row);
        }
        unset($row);
        if (!empty($rows)) {
            $hotelIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows), static fn($id) => $id > 0));
            if (!empty($hotelIds)) {
                $imgPlaceholders = implode(',', array_fill(0, count($hotelIds), '?'));
                $imgStmt = db()->prepare("SELECT hotel_id, image_path FROM hotel_images WHERE hotel_id IN ({$imgPlaceholders}) ORDER BY id ASC");
                $imgStmt->execute($hotelIds);
                $imgRows = $imgStmt->fetchAll();
                $imagesByHotel = [];
                foreach ($imgRows as $imgRow) {
                    $hotelId = (int) ($imgRow['hotel_id'] ?? 0);
                    if (!isset($imagesByHotel[$hotelId])) {
                        $imagesByHotel[$hotelId] = [];
                    }
                    $imagesByHotel[$hotelId][] = (string) ($imgRow['image_path'] ?? '');
                }
                foreach ($rows as &$row) {
                    $hotelId = (int) ($row['id'] ?? 0);
                    $row['image_paths'] = $imagesByHotel[$hotelId] ?? [];
                }
                unset($row);
            }
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'package_itineraries':
        $slugHint = trim((string) ($_GET['package_slug'] ?? ''));
        $ids = hb_package_ids_for_scope(db(), $pkgActiveSql, $slugHint);
        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id, package_ids, or package_slug is required']);
            break;
        }
        // Single-package detail: equality is clearer than IN (…) and avoids accidental wide queries.
        if (count($ids) === 1) {
            $stmt = db()->prepare('SELECT * FROM itineraries WHERE package_id = :pid ORDER BY sort_order ASC, day_number ASC, id ASC');
            $stmt->execute([':pid' => (int) $ids[0]]);
        } else {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = db()->prepare("SELECT * FROM itineraries WHERE package_id IN ({$placeholders}) ORDER BY package_id ASC, sort_order ASC, day_number ASC, id ASC");
            $stmt->execute($ids);
        }
        $rows = $stmt->fetchAll();
        $imagesByItinerary = [];
        if (!empty($rows)) {
            $itineraryIds = array_values(array_unique(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows)));
            $itineraryIds = array_values(array_filter($itineraryIds, static fn($id) => $id > 0));
            if (!empty($itineraryIds)) {
                $imgPlaceholders = implode(',', array_fill(0, count($itineraryIds), '?'));
                $imgStmt = db()->prepare("SELECT itinerary_id, image_path FROM itinerary_images WHERE itinerary_id IN ({$imgPlaceholders}) ORDER BY id ASC");
                $imgStmt->execute($itineraryIds);
                $imgRows = $imgStmt->fetchAll();
                foreach ($imgRows as $imgRow) {
                    $itineraryId = (int) ($imgRow['itinerary_id'] ?? 0);
                    if (!isset($imagesByItinerary[$itineraryId])) {
                        $imagesByItinerary[$itineraryId] = [];
                    }
                    $imagesByItinerary[$itineraryId][] = (string) ($imgRow['image_path'] ?? '');
                }
            }
            foreach ($rows as &$row) {
                $id = (int) ($row['id'] ?? 0);
                $paths = $imagesByItinerary[$id] ?? [];
                $single = trim((string) ($row['image_path'] ?? ''));
                if ($single !== '') {
                    array_unshift($paths, $single);
                    $paths = array_values(array_unique($paths));
                }
                $row['image_paths'] = $paths;
            }
            unset($row);
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'package_gallery':
        $packageId = (int) ($_GET['package_id'] ?? 0);
        $slugHint = trim((string) ($_GET['package_slug'] ?? ''));
        if ($packageId <= 0 && $slugHint !== '') {
            $resolved = hb_resolve_package_id_by_slug(db(), $pkgActiveSql, $slugHint);
            if ($resolved !== null && $resolved > 0) {
                $packageId = $resolved;
            }
        }
        if ($packageId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id or package_slug is required']);
            break;
        }
        $stmt = db()->prepare('SELECT image_path FROM package_images WHERE package_id = :id ORDER BY id ASC');
        $stmt->execute([':id' => $packageId]);
        $paths = array_values(array_filter(array_map(static fn($r) => (string) ($r['image_path'] ?? ''), $stmt->fetchAll())));
        echo json_encode(['data' => $paths], JSON_UNESCAPED_UNICODE);
        break;
    case 'reviews':
        $rows = db()->query('SELECT id, name, route, text, rating FROM reviews WHERE status="active" ORDER BY id DESC')->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'blogs':
        $rows = db()->query('SELECT id, title, slug, excerpt, content, cover_image, created_at FROM blogs WHERE status="active" ORDER BY id DESC')->fetchAll();
        if (!empty($rows)) {
            $blogIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows), static fn($id) => $id > 0));
            if (!empty($blogIds)) {
                $placeholders = implode(',', array_fill(0, count($blogIds), '?'));
                $imgStmt = db()->prepare("SELECT blog_id, image_path FROM blog_images WHERE blog_id IN ({$placeholders}) ORDER BY id ASC");
                $imgStmt->execute($blogIds);
                $imgRows = $imgStmt->fetchAll();
                $imagesByBlog = [];
                foreach ($imgRows as $imgRow) {
                    $blogId = (int) ($imgRow['blog_id'] ?? 0);
                    if (!isset($imagesByBlog[$blogId])) {
                        $imagesByBlog[$blogId] = [];
                    }
                    $imagesByBlog[$blogId][] = (string) ($imgRow['image_path'] ?? '');
                }
                foreach ($rows as &$row) {
                    $id = (int) ($row['id'] ?? 0);
                    $row['image_paths'] = $imagesByBlog[$id] ?? [];
                }
                unset($row);
            }
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'cms_items':
        $section = trim((string) ($_GET['section'] ?? ''));
        $scope = trim((string) ($_GET['scope'] ?? ''));
        $sql = 'SELECT * FROM cms_items WHERE status="active"';
        $params = [];
        if ($section !== '') {
            $sql .= ' AND section=:section';
            $params[':section'] = $section;
        }
        if ($scope !== '') {
            $sql .= ' AND scope=:scope';
            $params[':scope'] = $scope;
        }
        $sql .= ' ORDER BY sort_order ASC, id DESC';
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'hotels_catalog':
        $rows = db()->query("
            SELECT h.*,
                   p.title AS package_title,
                   p.slug AS package_slug,
                   p.category AS package_category,
                   p.status AS package_status
            FROM package_hotels h
            INNER JOIN packages p ON p.id = h.package_id
            WHERE {$pkgActiveSql}
            ORDER BY h.id DESC
        ")->fetchAll();
        if (!empty($rows)) {
            $hotelIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows), static fn($id) => $id > 0));
            if (!empty($hotelIds)) {
                $imgPlaceholders = implode(',', array_fill(0, count($hotelIds), '?'));
                $imgStmt = db()->prepare("SELECT hotel_id, image_path FROM hotel_images WHERE hotel_id IN ({$imgPlaceholders}) ORDER BY id ASC");
                $imgStmt->execute($hotelIds);
                $imgRows = $imgStmt->fetchAll();
                $imagesByHotel = [];
                foreach ($imgRows as $imgRow) {
                    $hotelId = (int) ($imgRow['hotel_id'] ?? 0);
                    if (!isset($imagesByHotel[$hotelId])) {
                        $imagesByHotel[$hotelId] = [];
                    }
                    $imagesByHotel[$hotelId][] = (string) ($imgRow['image_path'] ?? '');
                }
                foreach ($rows as &$row) {
                    $hid = (int) ($row['id'] ?? 0);
                    $row['image_paths'] = $imagesByHotel[$hid] ?? [];
                }
                unset($row);
            }
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Unknown resource']);
}

