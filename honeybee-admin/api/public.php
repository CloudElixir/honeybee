<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');
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

$resource = (string) ($_GET['resource'] ?? 'packages');
$isSqlite = db()->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';

switch ($resource) {
    case 'packages':
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
            WHERE p.status="active"
            ORDER BY p.featured DESC, p.id DESC
        ')->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'featured_packages':
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
            WHERE p.status="active" AND (p.is_featured=1 OR p.featured=1)
            ORDER BY p.is_featured DESC, p.featured DESC, p.id DESC
        ')->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'destinations':
        $rows = db()->query('SELECT * FROM destinations ORDER BY id DESC')->fetchAll();
        if (!empty($rows)) {
            $destinationIds = array_values(array_filter(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows), static fn($id) => $id > 0));
            if (!empty($destinationIds)) {
                $placeholders = implode(',', array_fill(0, count($destinationIds), '?'));
                $imgStmt = db()->prepare("SELECT destination_id, image_path FROM destination_images WHERE destination_id IN ({$placeholders}) ORDER BY id ASC");
                $imgStmt->execute($destinationIds);
                $imgRows = $imgStmt->fetchAll();
                $imagesByDestination = [];
                foreach ($imgRows as $imgRow) {
                    $destinationId = (int) ($imgRow['destination_id'] ?? 0);
                    if (!isset($imagesByDestination[$destinationId])) {
                        $imagesByDestination[$destinationId] = [];
                    }
                    $imagesByDestination[$destinationId][] = (string) ($imgRow['image_path'] ?? '');
                }
                foreach ($rows as &$row) {
                    $id = (int) ($row['id'] ?? 0);
                    $row['image_paths'] = $imagesByDestination[$id] ?? [];
                }
                unset($row);
            }
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
            $stmt = db()->prepare('
                SELECT p.*,
                       (
                         SELECT pi.image_path
                         FROM package_images pi
                         WHERE pi.package_id = p.id
                         ORDER BY pi.id ASC
                         LIMIT 1
                       ) AS image_path
                FROM packages p
                INNER JOIN destination_package dp ON dp.package_id = p.id
                WHERE dp.destination_id = :id AND p.status = "active"
                ORDER BY p.featured DESC, p.id DESC
            ');
        } else {
            $stmt = db()->prepare('
                SELECT p.*,
                       (
                         SELECT pi.image_path
                         FROM package_images pi
                         WHERE pi.package_id = p.id
                         ORDER BY pi.id ASC
                         LIMIT 1
                       ) AS image_path
                FROM packages p
                INNER JOIN destination_package dp ON dp.package_id = p.id
                WHERE dp.destination_id = :id AND p.status = "active"
                ORDER BY p.featured DESC, p.id DESC
            ');
        }
        $stmt->execute([':id' => $destinationId]);
        $rows = $stmt->fetchAll();
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'related_packages':
        $packageId = (int) ($_GET['package_id'] ?? 0);
        if ($packageId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id is required']);
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
            $sql = '
                SELECT p.*,
                       (
                         SELECT pi.image_path
                         FROM package_images pi
                         WHERE pi.package_id = p.id
                         ORDER BY pi.id ASC
                         LIMIT 1
                       ) AS image_path,
                       COUNT(DISTINCT dp.destination_id) AS shared_destinations
                FROM packages p
                LEFT JOIN destination_package dp ON dp.package_id = p.id
                WHERE p.id <> :package_id
                  AND p.status = "active"
                  AND (p.category = :category OR dp.destination_id IN (' . implode(',', $placeholders) . '))
                GROUP BY p.id
                ORDER BY shared_destinations DESC, p.is_trending DESC, p.is_curated DESC, p.featured DESC, p.id DESC
                LIMIT ' . $limitSql;
            $relatedStmt = db()->prepare($sql);
            $relatedStmt->execute($params);
            $rows = $relatedStmt->fetchAll();
        } else {
            $relatedStmt = db()->prepare('
                SELECT p.*,
                       (
                         SELECT pi.image_path
                         FROM package_images pi
                         WHERE pi.package_id = p.id
                         ORDER BY pi.id ASC
                         LIMIT 1
                       ) AS image_path
                FROM packages p
                WHERE p.id <> :package_id
                  AND p.status = "active"
                  AND p.category = :category
                ORDER BY p.is_trending DESC, p.is_curated DESC, p.featured DESC, p.id DESC
                LIMIT ' . $limitSql);
            $relatedStmt->execute($params);
            $rows = $relatedStmt->fetchAll();
        }

        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
        break;
    case 'package_hotels':
        $singleId = (int) ($_GET['package_id'] ?? 0);
        $idsRaw = trim((string) ($_GET['package_ids'] ?? ''));
        $ids = [];
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
        $ids = array_values(array_unique($ids));
        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id or package_ids is required']);
            break;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = db()->prepare("SELECT * FROM package_hotels WHERE package_id IN ({$placeholders}) ORDER BY id DESC");
        $stmt->execute($ids);
        $rows = $stmt->fetchAll();
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
        $singleId = (int) ($_GET['package_id'] ?? 0);
        $idsRaw = trim((string) ($_GET['package_ids'] ?? ''));
        $ids = [];
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
        $ids = array_values(array_unique($ids));
        if (empty($ids)) {
            http_response_code(400);
            echo json_encode(['error' => 'package_id or package_ids is required']);
            break;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = db()->prepare("SELECT * FROM itineraries WHERE package_id IN ({$placeholders}) ORDER BY package_id ASC, sort_order ASC, day_number ASC, id ASC");
        $stmt->execute($ids);
        $rows = $stmt->fetchAll();
        if (!empty($rows)) {
            $itineraryIds = array_values(array_unique(array_map(static fn($row) => (int) ($row['id'] ?? 0), $rows)));
            $itineraryIds = array_values(array_filter($itineraryIds, static fn($id) => $id > 0));
            if (!empty($itineraryIds)) {
                $imgPlaceholders = implode(',', array_fill(0, count($itineraryIds), '?'));
                $imgStmt = db()->prepare("SELECT itinerary_id, image_path FROM itinerary_images WHERE itinerary_id IN ({$imgPlaceholders}) ORDER BY id ASC");
                $imgStmt->execute($itineraryIds);
                $imgRows = $imgStmt->fetchAll();
                $imagesByItinerary = [];
                foreach ($imgRows as $imgRow) {
                    $itineraryId = (int) ($imgRow['itinerary_id'] ?? 0);
                    if (!isset($imagesByItinerary[$itineraryId])) {
                        $imagesByItinerary[$itineraryId] = [];
                    }
                    $imagesByItinerary[$itineraryId][] = (string) ($imgRow['image_path'] ?? '');
                }
                foreach ($rows as &$row) {
                    $id = (int) ($row['id'] ?? 0);
                    $row['image_paths'] = $imagesByItinerary[$id] ?? [];
                }
                unset($row);
            }
        }
        echo json_encode(['data' => $rows], JSON_UNESCAPED_UNICODE);
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
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Unknown resource']);
}

