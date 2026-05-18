<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';

$email = 'testing@gmail.com';
$password = 'test@123';
$name = 'Owner';

$hash = password_hash($password, PASSWORD_DEFAULT);
$pdo = db();
$driver = (string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

if ($driver === 'sqlite') {
    $stmt = $pdo->prepare('
        INSERT INTO admins (name, email, password_hash, created_at, updated_at)
        VALUES (:name, :email, :hash, NOW(), NOW())
        ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            password_hash = excluded.password_hash,
            updated_at = NOW()
    ');
    $stmt->execute([':name' => $name, ':email' => $email, ':hash' => $hash]);
} else {
    $stmt = $pdo->prepare('
        INSERT INTO admins (name, email, password_hash, created_at)
        VALUES (:name,:email,:hash,NOW())
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            password_hash = VALUES(password_hash),
            updated_at = NOW()
    ');
    $stmt->execute([':name' => $name, ':email' => $email, ':hash' => $hash]);
}

echo "Admin user ready.\nEmail: {$email}\nPassword: {$password}\n";

