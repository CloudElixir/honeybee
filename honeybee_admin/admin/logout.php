<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

if (is_logged_in()) {
    log_activity('auth', 'Admin logged out: ' . (current_admin()['email'] ?? 'unknown'));
}

$_SESSION = [];
session_destroy();
redirect('/admin/login.php');

