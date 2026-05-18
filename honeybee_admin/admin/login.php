<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

if (is_logged_in()) {
    redirect('/admin/dashboard.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = trim((string) ($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    $stmt = db()->prepare('SELECT id, name, email, password_hash FROM admins WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin'] = ['id' => $admin['id'], 'name' => $admin['name'], 'email' => $admin['email']];
        log_activity('auth', 'Admin logged in: ' . $admin['email']);
        redirect('/admin/dashboard.php');
    }

    flash('error', 'Invalid credentials.');
    redirect('/admin/login.php');
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login | HoneyBee Trips Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100">
  <div class="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
    <div class="grid w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl lg:grid-cols-2">
      <div class="hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-10 text-slate-900 lg:block">
        <p class="text-xs font-semibold uppercase tracking-[0.2em]">HoneyBee Trips</p>
        <h1 class="mt-4 text-4xl font-black leading-tight">Premium Travel CRM</h1>
        <p class="mt-4 text-sm font-medium">Manage packages, bookings, content, media, and SEO from one dashboard.</p>
      </div>
      <div class="p-8 sm:p-10">
        <h2 class="text-2xl font-semibold">Admin Sign In</h2>
        <p class="mt-1 text-sm text-slate-400">Use your admin email and password.</p>
        <?php $flash = get_flash(); if ($flash): ?>
          <div class="mt-4 rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><?= e($flash['message']) ?></div>
        <?php endif; ?>
        <form method="post" class="mt-6 space-y-4">
          <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
          <label class="block text-sm">
            <span class="mb-1 block text-slate-300">Email</span>
            <input name="email" type="email" required class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-amber-400">
          </label>
          <label class="block text-sm">
            <span class="mb-1 block text-slate-300">Password</span>
            <input name="password" type="password" required class="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-amber-400">
          </label>
          <button type="submit" class="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-300">
            Login
          </button>
        </form>
      </div>
    </div>
  </div>
</body>
</html>

