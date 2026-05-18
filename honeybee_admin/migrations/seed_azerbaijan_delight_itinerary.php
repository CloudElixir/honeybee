<?php
declare(strict_types=1);
/**
 * Replace day-wise itinerary for package "Azerbaijan Delight" (matches by title).
 *
 * Usage (from admin-panel directory):
 *   php migrations/seed_azerbaijan_delight_itinerary.php
 */
require_once __DIR__ . '/../bootstrap.php';

$packageTitle = 'Azerbaijan Delight';

$days = [
    [
        'day_number' => 1,
        'sort_order' => 0,
        'title' => 'Arrival In Baku',
        'description' => <<<'TXT'
Arrival: Upon landing at Heydar Aliyev International Airport, travellers must clear immigration and customs.
Check-in: Arrive at hotel and check-in
Leisure: Enjoy the rest of the day at leisure, by exploring hotel facilities.
TXT,
    ],
    [
        'day_number' => 2,
        'sort_order' => 0,
        'title' => 'Baku City Tour',
        'description' => <<<'TXT'
Morning Breakfast: Fuel your Baku adventure with a hearty hotel meal, ensuring you're ready to explore everything from the Flame Towers to the Caspian Sea waterfront.
City Tour Experience: Explore the ancient walls of Icheri sheher, Baku's Old City, home to the legendary Maiden Tower and the majestic Palace of the Shirvanshahs.
City Tour Highlights (photo stop): Baku Boulevard, Azerbaijan National Carpet Museum, Maiden Tower, Shrivanshah’s Palace, Museum of Miniature books, Little Vience, Baku eye, Flames Tower, Deniz Mall, Heydar Aliyev center and Nizami street.
Overnight: Hotel stay in Baku
TXT,
    ],
    [
        'day_number' => 3,
        'sort_order' => 0,
        'title' => 'Shahdag Tour',
        'description' => <<<'TXT'
Shahdag Mountain Experience: Experience the raw beauty of Azerbaijan at Shahdag Mountain, a premier high-altitude destination known for its crisp air and dramatic Caucasian landscapes.
Shahdag Coaster: Take control of your adrenaline on the Shahdag Coaster—a high-speed alpine slide featuring sharp turns and over 2.5 kilometers of mountain track.
Gudiyalchay River: Visit the Gudiyalchay River and Shahdag National Park to experience the breathtaking glacial valleys and serene nature of the Greater Caucasus.
Overnight: Hotel stay In Baku.
TXT,
    ],
    [
        'day_number' => 4,
        'sort_order' => 0,
        'title' => 'Gobustan - Mud Volcano + Absheron Tour',
        'description' => <<<'TXT'
Tour Highlights: Begin your journey through time at the Gobustan Rock Art Cultural Landscape, a UNESCO World Heritage site that serves as a vast open-air museum of prehistoric life. Located about 60 km southwest of Baku, this archaeological reserve offers a rare glimpse into the evolution of human expression across 40,000 years of history.
Mud Volcanos: Visit the mud volcanoes in Azerbaijan—the world's largest concentration of this natural wonder—and explore the bubbling craters of the Gobustan region
Yanar Dag: Visit Yanar Dag, the famous “Fire Mountain” where natural flames continuously burn across the hillside, showcasing why Azerbaijan is known as the “Land of Fire.”
Ateshgah Temple: Explore the historic Ateshgah Fire Temple, an ancient pilgrimage site known for its “Eternal Flame” and rich blend of Zoroastrian, Hindu, and Sikh heritage.
Overnight: Stay in Baku
TXT,
    ],
    [
        'day_number' => 5,
        'sort_order' => 0,
        'title' => 'Departure',
        'description' => <<<'TXT'
Morning: Enjoy breakfast at the hotel before departing from Azerbaijan with unforgettable memories of your journey.
Transfer: On your way to the airport, cherish the unforgettable experiences, scenic landscapes, and rich cultural heritage explored during your journey.
Departure: Arrive at the airport for your onward journey with wonderful memories of your unforgettable Azerbaijan adventure with Honeybee Tours.
TXT,
    ],
];

$pdo = db();
$stmt = $pdo->prepare('SELECT id FROM packages WHERE title = :t LIMIT 1');
$stmt->execute([':t' => $packageTitle]);
$packageId = (int) ($stmt->fetchColumn() ?: 0);

if ($packageId <= 0) {
    fwrite(STDERR, "Package not found: {$packageTitle}\n");
    exit(1);
}

$pdo->beginTransaction();
try {
    $idsStmt = $pdo->prepare('SELECT id FROM itineraries WHERE package_id = :pid');
    $idsStmt->execute([':pid' => $packageId]);
    $itIds = array_map('intval', array_column($idsStmt->fetchAll(PDO::FETCH_ASSOC), 'id'));

    if ($itIds !== []) {
        $in = implode(',', array_fill(0, count($itIds), '?'));
        $pdo->prepare("DELETE FROM itinerary_images WHERE itinerary_id IN ({$in})")->execute($itIds);
    }

    $pdo->prepare('DELETE FROM itineraries WHERE package_id = :pid')->execute([':pid' => $packageId]);

    $insert = $pdo->prepare(
        'INSERT INTO itineraries (package_id, day_number, title, description, image_path, sort_order, created_at) VALUES (:package_id, :day_number, :title, :description, NULL, :sort_order, NOW())'
    );
    $isSqlite = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';
    if ($isSqlite) {
        $insert = $pdo->prepare(
            'INSERT INTO itineraries (package_id, day_number, title, description, image_path, sort_order, created_at) VALUES (:package_id, :day_number, :title, :description, NULL, :sort_order, CURRENT_TIMESTAMP)'
        );
    }

    foreach ($days as $row) {
        $insert->execute([
            ':package_id' => $packageId,
            ':day_number' => (int) $row['day_number'],
            ':title' => $row['title'],
            ':description' => trim($row['description']),
            ':sort_order' => (int) $row['sort_order'],
        ]);
    }

    $pdo->commit();
    fwrite(STDOUT, "OK: Replaced itinerary for package #{$packageId} ({$packageTitle}) — " . count($days) . " days.\n");
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, 'Error: ' . $e->getMessage() . "\n");
    exit(1);
}
