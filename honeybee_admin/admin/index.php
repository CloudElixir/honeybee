<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
if (is_logged_in()) {
    redirect('/admin/dashboard.php');
}
redirect('/admin/login.php');

