CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM('International','Domestic') NOT NULL DEFAULT 'International',
  location VARCHAR(190) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  duration VARCHAR(60) NOT NULL,
  short_desc TEXT NULL,
  full_desc LONGTEXT NULL,
  highlights TEXT NULL,
  inclusions TEXT NULL,
  exclusions TEXT NULL,
  important_notes TEXT NULL,
  terms TEXT NULL,
  faq LONGTEXT NULL,
  blog_content LONGTEXT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_curated TINYINT(1) NOT NULL DEFAULT 0,
  is_trending TINYINT(1) NOT NULL DEFAULT 0,
  is_underrated TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  slug VARCHAR(255) NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  INDEX idx_package_category (category),
  INDEX idx_package_status (status)
);

CREATE TABLE IF NOT EXISTS package_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_package_images_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itineraries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_path VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_itineraries_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itinerary_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_itinerary_images_itinerary FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS package_hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  hotel_type ENUM('3-star','4-star','5-star') NOT NULL DEFAULT '3-star',
  image_path VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hotels_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hotel_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hotel_images_hotel FOREIGN KEY (hotel_id) REFERENCES package_hotels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  continent VARCHAR(120) NULL,
  country VARCHAR(190) NOT NULL,
  description TEXT NULL,
  cover_image VARCHAR(255) NULL,
  slug VARCHAR(255) NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS destination_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_destination_images_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS destination_package (
  destination_id INT NOT NULL,
  package_id INT NOT NULL,
  PRIMARY KEY(destination_id, package_id),
  CONSTRAINT fk_dp_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_dp_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(190) NULL,
  package_id INT NULL,
  travel_date DATE NULL,
  status ENUM('new','contacted','converted') NOT NULL DEFAULT 'new',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  CONSTRAINT fk_bookings_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(60) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('new','contacted','converted') NOT NULL DEFAULT 'new',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(190) NOT NULL UNIQUE,
  `value` LONGTEXT NULL
);

CREATE TABLE IF NOT EXISTS seo_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scope VARCHAR(60) NOT NULL,
  slug VARCHAR(255) NOT NULL DEFAULT '',
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_scope_slug (scope, slug)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(60) NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(120) NOT NULL,
  scope VARCHAR(80) NOT NULL DEFAULT 'global',
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
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  INDEX idx_cms_section_scope (section, scope),
  INDEX idx_cms_status (status)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  route VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NOT NULL,
  cover_image VARCHAR(255) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS blog_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_blog_images_blog FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

-- NOTE:
-- Some existing installs may already have an `admins` table with different columns.
-- For that reason, we do not auto-insert a default admin here.
-- Use `create_admin.php` (recommended) or insert an admin row manually after import.

