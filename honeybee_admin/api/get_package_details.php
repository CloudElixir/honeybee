<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
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

$id = (int) ($_GET['id'] ?? 0);
$slug = trim((string) ($_GET['slug'] ?? ''));
if ($id <= 0 && $slug === '') {
    http_response_code(400);
    echo json_encode(['error' => 'id or slug is required']);
    exit;
}

if ($id > 0) {
    $stmt = db()->prepare('SELECT * FROM packages WHERE id=:id AND status="active" LIMIT 1');
    $stmt->execute([':id' => $id]);
} else {
    $stmt = db()->prepare('SELECT * FROM packages WHERE slug=:slug AND status="active" LIMIT 1');
    $stmt->execute([':slug' => $slug]);
}

$pkg = $stmt->fetch();
if (!$pkg) {
    http_response_code(404);
    echo json_encode(['error' => 'Package not found']);
    exit;
}

$pid = (int) $pkg['id'];
$imgStmt = db()->prepare('SELECT id, image_path FROM package_images WHERE package_id=:pid ORDER BY id ASC');
$imgStmt->execute([':pid' => $pid]);
$images = $imgStmt->fetchAll();

$itStmt = db()->prepare('SELECT id, day_number, title, description, sort_order FROM itineraries WHERE package_id=:pid ORDER BY sort_order ASC, day_number ASC, id ASC');
$itStmt->execute([':pid' => $pid]);
$itinerary = $itStmt->fetchAll();
if (!empty($itinerary)) {
    $itineraryIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $itinerary), static fn($id) => $id > 0));
    if (!empty($itineraryIds)) {
        $placeholders = implode(',', array_fill(0, count($itineraryIds), '?'));
        $itImgStmt = db()->prepare("SELECT itinerary_id, image_path FROM itinerary_images WHERE itinerary_id IN ({$placeholders}) ORDER BY id ASC");
        $itImgStmt->execute($itineraryIds);
        $imageRows = $itImgStmt->fetchAll();
        $imagesByItinerary = [];
        foreach ($imageRows as $row) {
            $itineraryId = (int) ($row['itinerary_id'] ?? 0);
            if (!isset($imagesByItinerary[$itineraryId])) {
                $imagesByItinerary[$itineraryId] = [];
            }
            $imagesByItinerary[$itineraryId][] = (string) ($row['image_path'] ?? '');
        }
        foreach ($itinerary as &$day) {
            $dayId = (int) ($day['id'] ?? 0);
            $day['image_paths'] = $imagesByItinerary[$dayId] ?? [];
        }
        unset($day);
    }
}

$destStmt = db()->prepare('
    SELECT d.id, d.name, d.country, d.slug
    FROM destinations d
    INNER JOIN destination_package dp ON dp.destination_id = d.id
    WHERE dp.package_id = :pid
    ORDER BY d.name ASC
');
$destStmt->execute([':pid' => $pid]);
$destinations = $destStmt->fetchAll();

echo json_encode([
    'data' => [
        'package' => $pkg,
        'images' => $images,
        'itinerary' => $itinerary,
        'destinations' => $destinations,
    ],
], JSON_UNESCAPED_UNICODE);

