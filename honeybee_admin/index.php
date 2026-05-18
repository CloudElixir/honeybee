<?php
declare(strict_types=1);
/**
 * Site root → same entry as /admin/index.php (Hostinger docroot = this folder).
 */
require_once __DIR__ . '/bootstrap.php';
if (is_logged_in()) {
    redirect('/admin/dashboard.php');
}
redirect('/admin/login.php');
