<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    $allowed = array_values(array_filter(array_map('trim', explode(',', (string) (defined('APP_CORS_ORIGINS') ? APP_CORS_ORIGINS : '')))));
    if (empty($allowed) || in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Vary: Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '[]', true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$name = trim((string) ($data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$subject = trim((string) ($data['subject'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));

if ($name === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Name is required']);
    exit;
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Valid email is required']);
    exit;
}
if ($phone === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Phone is required']);
    exit;
}
if ($message === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Message is required']);
    exit;
}

$driver = db()->getAttribute(PDO::ATTR_DRIVER_NAME);
try {
    if ($driver === 'sqlite') {
        $stmt = db()->prepare('INSERT INTO enquiries (name, email, phone, subject, message, status) VALUES (:name,:email,:phone,:subject,:message,:status)');
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':subject' => $subject !== '' ? $subject : null,
            ':message' => $message,
            ':status' => 'new',
        ]);
    } else {
        $stmt = db()->prepare('INSERT INTO enquiries (name, email, phone, subject, message, status, created_at) VALUES (:name,:email,:phone,:subject,:message,:status,NOW())');
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':subject' => $subject !== '' ? $subject : null,
            ':message' => $message,
            ':status' => 'new',
        ]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save enquiry']);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
