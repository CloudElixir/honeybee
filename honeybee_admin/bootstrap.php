<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

// Writable session storage for CSRF + login. Prefer project dir; fall back when
// `storage/sessions` is missing, unwritable, or owned by another user (common with sudo).
$sessionCandidates = [
    __DIR__ . '/storage/sessions',
    rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
        . 'admin-panel-sessions-' . md5(__DIR__),
];
foreach ($sessionCandidates as $sessionDir) {
    if (!is_dir($sessionDir)) {
        if (!@mkdir($sessionDir, 0770, true) && !is_dir($sessionDir)) {
            continue;
        }
    }
    if (is_writable($sessionDir)) {
        session_save_path($sessionDir);
        break;
    }
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

date_default_timezone_set('Asia/Kolkata');

if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0775, true);
}

if (DEMO_MODE && !is_dir(dirname(DEMO_SQLITE_PATH))) {
    mkdir(dirname(DEMO_SQLITE_PATH), 0775, true);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    if (DEMO_MODE) {
        $pdo = new PDO('sqlite:' . DEMO_SQLITE_PATH, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->sqliteCreateFunction('NOW', static fn(): string => date('Y-m-d H:i:s'), 0);
        ensure_demo_schema($pdo);
    } else {
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (Throwable $e) {
            // Gracefully fallback for local setups where MySQL isn't reachable.
            if (!extension_loaded('pdo_sqlite')) {
                throw $e;
            }
            if (!is_dir(dirname(DEMO_SQLITE_PATH))) {
                mkdir(dirname(DEMO_SQLITE_PATH), 0775, true);
            }
            $pdo = new PDO('sqlite:' . DEMO_SQLITE_PATH, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON');
            $pdo->sqliteCreateFunction('NOW', static fn(): string => date('Y-m-d H:i:s'), 0);
            ensure_demo_schema($pdo);
        }
    }

    ensure_runtime_schema($pdo);
    return $pdo;
}

function ensure_runtime_schema(PDO $pdo): void
{
    static $checked = false;
    if ($checked) {
        return;
    }
    $checked = true;

    $driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    if ($driver === 'sqlite') {
        $pdo->exec('CREATE TABLE IF NOT EXISTS hotel_images (id INTEGER PRIMARY KEY AUTOINCREMENT, hotel_id INTEGER NOT NULL, image_path TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
        $pdo->exec('CREATE TABLE IF NOT EXISTS destination_images (id INTEGER PRIMARY KEY AUTOINCREMENT, destination_id INTEGER NOT NULL, image_path TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
        $pdo->exec('CREATE TABLE IF NOT EXISTS blog_images (id INTEGER PRIMARY KEY AUTOINCREMENT, blog_id INTEGER NOT NULL, image_path TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
        $pdo->exec('
            CREATE TABLE IF NOT EXISTS itinerary_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                itinerary_id INTEGER NOT NULL,
                image_path TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ');
        $pdo->exec('
            CREATE TABLE IF NOT EXISTS cms_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                section TEXT NOT NULL,
                scope TEXT NOT NULL DEFAULT "global",
                title TEXT NOT NULL,
                subtitle TEXT,
                image_url TEXT,
                link_url TEXT,
                price REAL NOT NULL DEFAULT 0,
                duration TEXT,
                badge TEXT,
                tags TEXT,
                extra_json TEXT,
                sort_order INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT "active",
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT
            )
        ');
        ensure_column_exists($pdo, 'packages', 'important_notes', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'terms', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'faq', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'blog_content', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'is_featured', 'INTEGER NOT NULL DEFAULT 0');
        ensure_column_exists($pdo, 'packages', 'is_curated', 'INTEGER NOT NULL DEFAULT 0');
        ensure_column_exists($pdo, 'packages', 'is_trending', 'INTEGER NOT NULL DEFAULT 0');
        ensure_column_exists($pdo, 'packages', 'is_underrated', 'INTEGER NOT NULL DEFAULT 0');
        ensure_column_exists($pdo, 'packages', 'cover_image', 'TEXT');
        ensure_column_exists($pdo, 'itineraries', 'image_path', 'TEXT');
        ensure_column_exists($pdo, 'package_hotels', 'hotel_type', 'TEXT');
        ensure_column_exists($pdo, 'package_hotels', 'image_path', 'TEXT');
        ensure_column_exists($pdo, 'package_hotels', 'star_rating', 'REAL');
        ensure_column_exists($pdo, 'package_hotels', 'amenities', 'TEXT');
        ensure_column_exists($pdo, 'package_hotels', 'description', 'TEXT');
        ensure_column_exists($pdo, 'destinations', 'continent', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'tier_price_3_star', 'REAL');
        ensure_column_exists($pdo, 'packages', 'tier_price_4_star', 'REAL');
        ensure_column_exists($pdo, 'packages', 'tier_price_5_star', 'REAL');
        ensure_column_exists($pdo, 'packages', 'ideal_for', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'best_time_visit', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'covered_destinations', 'TEXT');
        ensure_column_exists($pdo, 'packages', 'cancellation_policy', 'TEXT');
        ensure_bali_romantic_itinerary_seed($pdo);
        ensure_bali_romantic_hotel_types($pdo);
        return;
    }

    // Keep critical runtime table available even if schema.sql wasn't re-imported.
    $pdo->exec('CREATE TABLE IF NOT EXISTS hotel_images (id INT AUTO_INCREMENT PRIMARY KEY, hotel_id INT NOT NULL, image_path VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES package_hotels(id) ON DELETE CASCADE)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS destination_images (id INT AUTO_INCREMENT PRIMARY KEY, destination_id INT NOT NULL, image_path VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_destination_images_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS blog_images (id INT AUTO_INCREMENT PRIMARY KEY, blog_id INT NOT NULL, image_path VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_blog_images_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE)');
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS itinerary_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          itinerary_id INT NOT NULL,
          image_path VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_itinerary_images_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
        )
    ');
    $pdo->exec('
        CREATE TABLE IF NOT EXISTS cms_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          section VARCHAR(120) NOT NULL,
          scope VARCHAR(80) NOT NULL DEFAULT "global",
          title VARCHAR(255) NOT NULL,
          subtitle TEXT NULL,
          image_url VARCHAR(255) NULL,
          link_url VARCHAR(255) NULL,
          price DECIMAL(12,2) NOT NULL DEFAULT 0,
          duration VARCHAR(80) NULL,
          badge VARCHAR(80) NULL,
          tags TEXT NULL,
          extra_json LONGTEXT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          status ENUM("active","inactive") NOT NULL DEFAULT "active",
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NULL,
          INDEX idx_cms_section_scope (section, scope),
          INDEX idx_cms_status (status)
        )
    ');
    ensure_column_exists($pdo, 'packages', 'important_notes', 'TEXT NULL');
    ensure_column_exists($pdo, 'packages', 'terms', 'TEXT NULL');
    ensure_column_exists($pdo, 'packages', 'faq', 'LONGTEXT NULL');
    ensure_column_exists($pdo, 'packages', 'blog_content', 'LONGTEXT NULL');
    ensure_column_exists($pdo, 'packages', 'is_featured', 'TINYINT(1) NOT NULL DEFAULT 0');
    ensure_column_exists($pdo, 'packages', 'is_curated', 'TINYINT(1) NOT NULL DEFAULT 0');
    ensure_column_exists($pdo, 'packages', 'is_trending', 'TINYINT(1) NOT NULL DEFAULT 0');
    ensure_column_exists($pdo, 'packages', 'is_underrated', 'TINYINT(1) NOT NULL DEFAULT 0');
    ensure_column_exists($pdo, 'packages', 'cover_image', 'VARCHAR(512) NULL');
    ensure_column_exists($pdo, 'itineraries', 'image_path', 'VARCHAR(255) NULL');
    ensure_column_exists($pdo, 'package_hotels', 'hotel_type', 'ENUM("3-star","4-star","5-star") NOT NULL DEFAULT "3-star"');
    ensure_column_exists($pdo, 'package_hotels', 'image_path', 'VARCHAR(255) NULL');
    ensure_column_exists($pdo, 'package_hotels', 'star_rating', 'DECIMAL(2,1) NULL');
    ensure_column_exists($pdo, 'package_hotels', 'amenities', 'TEXT NULL');
    ensure_column_exists($pdo, 'package_hotels', 'description', 'TEXT NULL');
    ensure_column_exists($pdo, 'destinations', 'continent', 'VARCHAR(120) NULL');
    ensure_column_exists($pdo, 'packages', 'tier_price_3_star', 'DECIMAL(12,2) NULL');
    ensure_column_exists($pdo, 'packages', 'tier_price_4_star', 'DECIMAL(12,2) NULL');
    ensure_column_exists($pdo, 'packages', 'tier_price_5_star', 'DECIMAL(12,2) NULL');
    ensure_column_exists($pdo, 'packages', 'ideal_for', 'VARCHAR(255) NULL');
    ensure_column_exists($pdo, 'packages', 'best_time_visit', 'VARCHAR(255) NULL');
    ensure_column_exists($pdo, 'packages', 'covered_destinations', 'VARCHAR(500) NULL');
    ensure_column_exists($pdo, 'packages', 'cancellation_policy', 'TEXT NULL');
    ensure_bali_romantic_itinerary_seed($pdo);
    ensure_bali_romantic_hotel_types($pdo);
}

/** Copy star tier from legacy `notes` (e.g. "3-star") into `hotel_type` when missing. */
function ensure_bali_romantic_hotel_types(PDO $pdo): void
{
    try {
        $baliPkg = $pdo->query("SELECT id FROM packages WHERE title = 'Bali Romantic Escape' LIMIT 1")->fetch();
        if (!$baliPkg) {
            return;
        }
        $baliId = (int) $baliPkg['id'];
        $driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver === 'sqlite') {
            $pdo->prepare(
                "UPDATE package_hotels SET hotel_type = LOWER(TRIM(notes))
                 WHERE package_id = ? AND (hotel_type IS NULL OR TRIM(hotel_type) = '')
                 AND LOWER(TRIM(notes)) IN ('3-star','4-star','5-star')"
            )->execute([$baliId]);
            return;
        }
        $pdo->prepare(
            "UPDATE package_hotels SET hotel_type = LOWER(TRIM(notes))
             WHERE package_id = ? AND (hotel_type IS NULL OR TRIM(hotel_type) = '')
             AND LOWER(TRIM(notes)) IN ('3-star','4-star','5-star')"
        )->execute([$baliId]);
    } catch (Throwable $e) {
        // Non-fatal.
    }
}

/** Canonical 5-day Bali Romantic Escape itinerary (Bayard-style day-wise activities). */
function bali_romantic_escape_itinerary_days(): array
{
    return [
        [
            1,
            0,
            'Arrival in Bali',
            <<<'TXT'
Arrival: Land at Ngurah Rai International Airport and complete immigration procedures.
Check-in: Arrive at your resort/hotel and check in for your stay.
Note: Standard check-in time is 2:00 PM.
Leisure Time: Enjoy the rest of the day at leisure.
Local area: Relax at the hotel or by the beach — explore the local area at your own pace.
Accommodation: Overnight stay in Kuta.
Meals included on the day: Nil
TXT,
        ],
        [
            2,
            1,
            'Half Day Water sports + Uluwatu Temple + Kecak Dance',
            <<<'TXT'
Breakfast at Hotel: Start the day with a hearty meal.
Water Sports at Benoa Beach: Engage in thrilling activities such as Parasailing (weather permitting), Banana Boat Rides, and Jet Skiing.
Visit Uluwatu Temple: Explore this iconic cliffside sea temple, renowned for its stunning ocean views.
Kecak & Fire Dance Performance: Experience this captivating cultural dance at sunset, set against the breathtaking backdrop of Uluwatu Temple.
Accommodation: Overnight stay in Kuta.
Meals included on the day: Breakfast
TXT,
        ],
        [
            3,
            2,
            'Nusa Penida Island Tour',
            <<<'TXT'
Breakfast: Enjoy breakfast at the hotel.
7 AM Pick Up: Depart from the hotel to the Ferry Terminal for transfers to Nusa Penida Island via speedboat.
Angel's Billabong: Swim in a stunning natural infinity pool with crystal-clear waters surrounded by dramatic cliffs.
Broken Beach: Visit this picturesque cove featuring an arched rock formation that creates a natural bridge over turquoise waters.
Kelingking Cliff: Experience breathtaking views from this iconic viewpoint resembling a T-Rex, perfect for memorable photos.
Crystal Bay: Natural bay (area may be temporarily closed due to landslides — subject to local conditions).
Important Notes: Bring cash for entry donations — IDR 25,000 per adult and IDR 15,000 per child for Nusa Penida.
TXT,
        ],
        [
            4,
            3,
            'Kintamani Village Tour',
            <<<'TXT'
Early Breakfast: Prepare for an exciting day with a hearty meal.
Visit Kintamani Viewpoint: Experience the breathtaking views of Batur Caldera and the serene Lake Batur — perfect for nature lovers and photographers.
Mas and Celuk Village & Ubud Art Market: Explore villages known for silver production. Witness the craftsmanship behind exquisite silver jewellery, plus Ubud Art Market.
Bali Coffee Plantation: Discover tropical plants including coffee robusta and cacao. Experience traditional coffee-making and taste fresh Balinese coffee or ginger tea with river valley views. See the civet cat, known for Coffee Luwak.
Tegallalang Rice Terraces: Visit famous rice paddies showcasing the traditional subak irrigation system and stunning terraced landscapes.
Accommodation: Overnight stay in Kuta.
TXT,
        ],
        [
            5,
            4,
            'Departure',
            <<<'TXT'
Morning at Leisure: Enjoy a relaxing morning with breakfast at the hotel. Complete check-out formalities by 12:00 PM, allowing you to savor your last moments in Bali.
Airport Transfer: After check-out, transfer to Bali Airport for your return flight — ensuring a smooth and timely departure with wonderful memories of your trip.
Meals included on the day: Breakfast
TXT,
        ],
    ];
}

/** Bump when canonical Bali Romantic Escape copy changes (triggers one-time re-sync). */
const BALI_ROMANTIC_ITINERARY_SEED_VERSION = 'bayard-v2-full-slug';

/** Sync day-wise itinerary for Bali Romantic Escape only (upsert by day number). */
function ensure_bali_romantic_itinerary_seed(PDO $pdo): void
{
    try {
        $baliPkg = $pdo->query("SELECT id FROM packages WHERE title = 'Bali Romantic Escape' LIMIT 1")->fetch();
        if (!$baliPkg) {
            return;
        }
        $stored = null;
        try {
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE key = 'bali_romantic_itinerary_seed' LIMIT 1");
            $stmt->execute();
            $stored = $stmt->fetchColumn();
        } catch (Throwable $e) {
            // settings table may not exist yet on very old DBs
        }
        $baliId = (int) $baliPkg['id'];
        try {
            $pdo->prepare("UPDATE packages SET slug = 'bali-romantic-escape' WHERE id = ?")
                ->execute([$baliId]);
        } catch (Throwable $e) {
            // Non-fatal.
        }
        $stmtCount = $pdo->prepare('SELECT COUNT(*) FROM itineraries WHERE package_id = ?');
        $stmtCount->execute([$baliId]);
        $hasRows = (int) $stmtCount->fetchColumn() > 0;
        if ($hasRows && $stored === BALI_ROMANTIC_ITINERARY_SEED_VERSION) {
            return;
        }
        $days = bali_romantic_escape_itinerary_days();
        $select = $pdo->prepare('SELECT id FROM itineraries WHERE package_id = ? AND day_number = ? LIMIT 1');
        $insert = $pdo->prepare(
            'INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (?,?,?,?,?,NOW())'
        );
        $update = $pdo->prepare(
            'UPDATE itineraries SET title = ?, description = ?, sort_order = ? WHERE id = ?'
        );
        foreach ($days as [$dayNum, $sort, $title, $desc]) {
            $select->execute([$baliId, $dayNum]);
            $row = $select->fetch();
            $desc = trim($desc);
            if ($row) {
                $update->execute([$title, $desc, $sort, (int) $row['id']]);
            } else {
                $insert->execute([$baliId, $dayNum, $title, $desc, $sort]);
            }
        }
        try {
            $driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
            if ($driver === 'sqlite') {
                $pdo->prepare(
                    "INSERT INTO settings (key, value) VALUES ('bali_romantic_itinerary_seed', ?)
                     ON CONFLICT(key) DO UPDATE SET value = excluded.value"
                )->execute([BALI_ROMANTIC_ITINERARY_SEED_VERSION]);
            } else {
                $pdo->prepare(
                    "INSERT INTO settings (`key`, value) VALUES ('bali_romantic_itinerary_seed', ?)
                     ON DUPLICATE KEY UPDATE value = VALUES(value)"
                )->execute([BALI_ROMANTIC_ITINERARY_SEED_VERSION]);
            }
        } catch (Throwable $e) {
            // Non-fatal version marker.
        }
    } catch (Throwable $e) {
        // Non-fatal demo seed.
    }
}

function ensure_column_exists(PDO $pdo, string $table, string $column, string $definition): void
{
    $driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    try {
        if ($driver === 'sqlite') {
            $stmt = $pdo->query("PRAGMA table_info({$table})");
            $columns = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
            foreach ($columns as $col) {
                if (strcasecmp((string) ($col['name'] ?? ''), $column) === 0) {
                    return;
                }
            }
            $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
            return;
        }

        $stmt = $pdo->prepare('SHOW COLUMNS FROM `' . $table . '` LIKE :column');
        $stmt->execute([':column' => $column]);
        $exists = (bool) $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$exists) {
            $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
        }
    } catch (Throwable $e) {
        // Non-fatal runtime schema guard.
    }
}

function ensure_demo_schema(PDO $pdo): void
{
    static $bootstrapped = false;
    if ($bootstrapped) {
        return;
    }
    $bootstrapped = true;

    $pdo->exec('
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT "International",
            location TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0,
            duration TEXT NOT NULL,
            short_desc TEXT,
            full_desc TEXT,
            highlights TEXT,
            inclusions TEXT,
            exclusions TEXT,
            important_notes TEXT,
            terms TEXT,
            faq TEXT,
            featured INTEGER NOT NULL DEFAULT 0,
            blog_content TEXT,
            is_featured INTEGER NOT NULL DEFAULT 0,
            is_curated INTEGER NOT NULL DEFAULT 0,
            is_trending INTEGER NOT NULL DEFAULT 0,
            is_underrated INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT "active",
            slug TEXT,
            meta_title TEXT,
            meta_description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS package_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS itineraries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package_id INTEGER NOT NULL,
            day_number INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            image_path TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS itinerary_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itinerary_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS package_hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS hotel_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS destinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            continent TEXT,
            country TEXT NOT NULL,
            description TEXT,
            cover_image TEXT,
            slug TEXT,
            meta_title TEXT,
            meta_description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS destination_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            destination_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS destination_package (
            destination_id INTEGER NOT NULL,
            package_id INTEGER NOT NULL,
            PRIMARY KEY (destination_id, package_id)
        );
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            package_id INTEGER,
            travel_date TEXT,
            status TEXT NOT NULL DEFAULT "new",
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT "new",
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            mime_type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT
        );
        CREATE TABLE IF NOT EXISTS seo_meta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scope TEXT NOT NULL,
            slug TEXT NOT NULL DEFAULT "",
            meta_title TEXT,
            meta_description TEXT,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(scope, slug)
        );
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS cms_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL,
            scope TEXT NOT NULL DEFAULT "global",
            title TEXT NOT NULL,
            subtitle TEXT,
            image_url TEXT,
            link_url TEXT,
            price REAL NOT NULL DEFAULT 0,
            duration TEXT,
            badge TEXT,
            tags TEXT,
            extra_json TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT "active",
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            route TEXT NOT NULL,
            text TEXT NOT NULL,
            rating REAL NOT NULL DEFAULT 5,
            status TEXT NOT NULL DEFAULT "active",
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            excerpt TEXT,
            content TEXT NOT NULL,
            cover_image TEXT,
            status TEXT NOT NULL DEFAULT "active",
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS blog_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blog_id INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    ');

    $count = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    if ($count === 0) {
        $hash = password_hash('test@123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO admins (name, email, password_hash, created_at) VALUES (:name,:email,:hash,NOW())');
        $stmt->execute([':name' => 'Testing Admin', ':email' => 'testing@gmail.com', ':hash' => $hash]);
    }

    $pkgCount = (int) $pdo->query('SELECT COUNT(*) FROM packages')->fetchColumn();
    if ($pkgCount === 0) {
        $pdo->exec("INSERT INTO packages (title, category, location, price, duration, short_desc, status, featured, created_at)
            VALUES
            ('Bali Romantic Escape','International','Bali, Indonesia',129999,'6D/5N','Private villas and curated island moments.','active',1,NOW()),
            ('Swiss Alpine Bliss','International','Switzerland',189999,'8D/7N','Scenic train routes and mountain luxury stays.','active',1,NOW()),
            ('Kerala Backwater Retreat','Domestic','Kerala, India',55999,'5D/4N','Houseboat + beach + wellness itinerary.','active',0,NOW())");
    }

    $reviewCount = (int) $pdo->query('SELECT COUNT(*) FROM reviews')->fetchColumn();
    if ($reviewCount === 0) {
        $pdo->exec("INSERT INTO reviews (name, route, text, rating, status, created_at)
            VALUES
            ('Ritika Sharma','Bali + Gili Islands','Team Honeybee planned every transfer so smoothly. We just enjoyed the trip without any stress.',4.8,'active',NOW()),
            ('Aman Verma','Switzerland + Italy','Hotels were excellent, daily pacing felt perfect, and support was super quick whenever we needed help.',4.9,'active',NOW()),
            ('Neha Iyer','Kerala Couple Retreat','Great value and premium experience. The itinerary was balanced, beautiful, and easy to follow.',4.7,'active',NOW())");
    }

    $blogCount = (int) $pdo->query('SELECT COUNT(*) FROM blogs')->fetchColumn();
    if ($blogCount === 0) {
        $pdo->exec("INSERT INTO blogs (title, slug, excerpt, content, status, created_at)
            VALUES
            ('How to Plan a 7-Day Europe Itinerary','how-to-plan-7-day-europe-itinerary','A practical checklist for building a stress-free Europe week.','Start with one base city, then add two nearby regions. Keep transfer time under 4 hours per hop and pre-book key attractions.','active',NOW()),
            ('Bali vs Thailand for Honeymoon','bali-vs-thailand-honeymoon','Compare costs, vibe, and best seasons for couples.','Bali is ideal for villas and wellness, while Thailand offers diverse islands and nightlife. Your choice depends on travel style and month.','active',NOW())");
    }
}

function app_path(string $path): string
{
    if (preg_match('#^https?://#i', $path) === 1) {
        return $path;
    }
    if ($path === '') {
        return APP_BASE_PATH ?: '';
    }
    $path = $path[0] === '/' ? $path : ('/' . $path);
    $base = rtrim((string) (defined('APP_BASE_PATH') ? APP_BASE_PATH : ''), '/');
    return $base === '' ? $path : ($base . $path);
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function current_admin(): ?array
{
    return $_SESSION['admin'] ?? null;
}

function is_logged_in(): bool
{
    return current_admin() !== null;
}

function require_login(): void
{
    if (!is_logged_in()) {
        header('Location: ' . app_path('/admin/login.php'));
        exit;
    }
}

function redirect(string $path): void
{
    header('Location: ' . app_path($path));
    exit;
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function verify_csrf(): void
{
    $token = $_POST['_csrf'] ?? '';
    if (!hash_equals($_SESSION['_csrf'] ?? '', $token)) {
        http_response_code(419);
        exit('CSRF token mismatch.');
    }
}

function flash(string $type, string $message): void
{
    $_SESSION['_flash'] = ['type' => $type, 'message' => $message];
}

function get_flash(): ?array
{
    $flash = $_SESSION['_flash'] ?? null;
    unset($_SESSION['_flash']);
    return $flash;
}

function admin_nav_items(): array
{
    return [
        'dashboard' => ['label' => 'Dashboard', 'href' => app_path('/admin/dashboard.php')],
        'packages' => ['label' => 'Packages', 'href' => app_path('/admin/packages.php')],
        'itineraries' => ['label' => 'Itineraries', 'href' => app_path('/admin/itineraries.php')],
        'hotels' => ['label' => 'Hotels', 'href' => app_path('/admin/hotels.php')],
        'destinations' => ['label' => 'Destinations', 'href' => app_path('/admin/destinations.php')],
        'bookings' => ['label' => 'Bookings & Leads', 'href' => app_path('/admin/bookings.php')],
        'enquiries' => ['label' => 'Enquiries', 'href' => app_path('/admin/enquiries.php')],
        'media' => ['label' => 'Media Manager', 'href' => app_path('/admin/media.php')],
        'reviews' => ['label' => 'Reviews', 'href' => app_path('/admin/reviews.php')],
        'blogs' => ['label' => 'Blogs', 'href' => app_path('/admin/blogs.php')],
        'website_sections' => ['label' => 'Website Sections', 'href' => app_path('/admin/website_sections.php')],
        'cms' => ['label' => 'Homepage CMS', 'href' => app_path('/admin/cms.php')],
        'system_health' => ['label' => 'System Health', 'href' => app_path('/admin/system_health.php')],
        'settings' => ['label' => 'Settings + SEO', 'href' => app_path('/admin/settings.php')],
    ];
}

function render_layout_start(string $title, string $active = 'dashboard'): void
{
    $flash = get_flash();
    $admin = current_admin();
    $navItems = admin_nav_items();
    ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= e($title) ?> | <?= e(APP_NAME) ?></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <style>[x-cloak]{display:none!important}</style>
</head>
<body class="bg-slate-100 text-slate-900" x-data="{ sidebarOpen: false }">
  <div class="min-h-screen lg:flex">
    <aside class="fixed inset-y-0 left-0 z-40 w-72 -translate-x-full border-r border-slate-200 bg-slate-950 text-slate-100 transition lg:translate-x-0" :class="sidebarOpen ? 'translate-x-0' : ''">
      <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-amber-300">HoneyBee Trips</p>
          <h1 class="mt-1 text-lg font-semibold">CRM + CMS</h1>
        </div>
        <button class="rounded-md p-1 text-slate-400 lg:hidden" @click="sidebarOpen=false">✕</button>
      </div>
      <nav class="space-y-1 p-3">
        <?php foreach ($navItems as $key => $item): ?>
          <a href="<?= e($item['href']) ?>" class="block rounded-lg px-3 py-2 text-sm font-medium <?= $key === $active ? 'bg-amber-400 text-slate-900' : 'text-slate-300 hover:bg-slate-800 hover:text-white' ?>">
            <?= e($item['label']) ?>
          </a>
        <?php endforeach; ?>
      </nav>
      <div class="absolute bottom-0 w-full border-t border-slate-800 p-3">
        <a href="<?= e(app_path('/admin/logout.php')) ?>" class="block rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700">Logout</a>
      </div>
    </aside>

    <div class="flex-1 lg:ml-72">
      <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="flex items-center justify-between px-4 py-3 sm:px-6">
          <div class="flex items-center gap-3">
            <button class="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm lg:hidden" @click="sidebarOpen=true">Menu</button>
            <h2 class="text-lg font-semibold"><?= e($title) ?></h2>
          </div>
          <p class="text-sm text-slate-500">Hello, <?= e($admin['name'] ?? 'Admin') ?></p>
        </div>
        <?php if (defined('DEMO_MODE') && DEMO_MODE): ?>
          <div class="border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:px-6">
            <span class="font-semibold">DEMO MODE is ON</span>
            <span class="text-amber-800">— admin is using SQLite demo data, not your MySQL database.</span>
          </div>
        <?php endif; ?>
      </header>
      <main class="p-4 sm:p-6">
        <?php if ($flash): ?>
          <div x-data="{open:true}" x-show="open" x-transition class="mb-4 rounded-lg border px-4 py-3 text-sm <?= $flash['type'] === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800' ?>">
            <div class="flex items-center justify-between">
              <span><?= e($flash['message']) ?></span>
              <button class="font-semibold" @click="open=false">✕</button>
            </div>
          </div>
        <?php endif; ?>
<?php
}

function render_layout_end(): void
{
    ?>
      </main>
    </div>
  </div>
</body>
</html>
<?php
}

function log_activity(string $type, string $message): void
{
    $stmt = db()->prepare('INSERT INTO activity_logs (type, message, created_at) VALUES (:type, :message, NOW())');
    $stmt->execute([':type' => $type, ':message' => $message]);
}

function upload_image(array $file): ?string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowed, true)) {
        return null;
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $name = uniqid('hb_', true) . '.' . strtolower($ext ?: 'jpg');
    $target = UPLOADS_DIR . '/' . $name;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        return null;
    }
    $path = rtrim(UPLOADS_URL, '/') . '/' . $name;
    $stmt = db()->prepare('INSERT INTO media (file_name, file_path, mime_type, created_at) VALUES (:name,:path,:mime,NOW())');
    $stmt->execute([':name' => $file['name'], ':path' => $path, ':mime' => $file['type']]);
    return $path;
}

