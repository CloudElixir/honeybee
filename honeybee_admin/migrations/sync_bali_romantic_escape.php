<?php
declare(strict_types=1);

/**
 * One-time sync: Bali Romantic Escape 5-day itinerary + hotel star types.
 * Upload honeybee_admin to Hostinger, then open in browser (logged in as admin is optional):
 *   https://YOUR-ADMIN-HOST/migrations/sync_bali_romantic_escape.php
 */
require_once dirname(__DIR__) . '/bootstrap.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = db();
    ensure_bali_romantic_itinerary_seed($pdo);
    ensure_bali_romantic_hotel_types($pdo);

    $bali = $pdo->query("SELECT id FROM packages WHERE title = 'Bali Romantic Escape' LIMIT 1")->fetch();
    $pid = $bali ? (int) $bali['id'] : 0;
    $itCount = 0;
    $hotelCount = 0;
    if ($pid > 0) {
        $s = $pdo->prepare('SELECT COUNT(*) FROM itineraries WHERE package_id = ?');
        $s->execute([$pid]);
        $itCount = (int) $s->fetchColumn();
        $s = $pdo->prepare('SELECT COUNT(*) FROM package_hotels WHERE package_id = ?');
        $s->execute([$pid]);
        $hotelCount = (int) $s->fetchColumn();
    }

    echo "OK — Bali Romantic Escape sync complete.\n";
    echo "Package id: {$pid}\n";
    echo "Itinerary days: {$itCount}\n";
    echo "Hotels linked: {$hotelCount}\n";
    echo "\nRefresh: https://cloudelixir.github.io/honeybee/packages/bali-romantic-escape\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo 'Sync failed: ' . $e->getMessage();
}
