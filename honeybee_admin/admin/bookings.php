<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$search = trim((string) ($_GET['q'] ?? ''));
$sql = 'SELECT b.*, p.title AS package_title FROM bookings b LEFT JOIN packages p ON p.id=b.package_id';
if ($search !== '') {
    $stmt = db()->prepare($sql . ' WHERE b.name LIKE :q OR b.email LIKE :q OR b.phone LIKE :q ORDER BY b.id DESC');
    $stmt->execute([':q' => "%{$search}%"]);
    $bookings = $stmt->fetchAll();
} else {
    $bookings = db()->query($sql . ' ORDER BY b.id DESC')->fetchAll();
}

render_layout_start('Bookings & Leads', 'bookings');
?>
<form class="mb-4">
  <input name="q" value="<?= e($search) ?>" placeholder="Search name, email, phone" class="w-full max-w-sm rounded-lg border px-3 py-2">
</form>

<div class="space-y-3">
  <?php foreach ($bookings as $row): ?>
    <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 class="font-semibold"><?= e($row['name']) ?> <span class="text-sm font-normal text-slate-500"><?= e($row['phone']) ?></span></h3>
          <p class="text-sm text-slate-600"><?= e($row['email']) ?> • Package: <?= e($row['package_title'] ?: 'N/A') ?> • Travel: <?= e($row['travel_date']) ?></p>
        </div>
      </div>
      <form method="post" action="<?= e(app_path('/api/admin.php')) ?>" class="mt-3 grid gap-2 sm:grid-cols-3">
        <input type="hidden" name="_csrf" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="action" value="booking_update">
        <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
        <select name="status" class="rounded-lg border px-3 py-2">
          <?php foreach (['new','contacted','converted'] as $s): ?>
            <option value="<?= $s ?>" <?= $row['status'] === $s ? 'selected' : '' ?>><?= ucfirst($s) ?></option>
          <?php endforeach; ?>
        </select>
        <input name="notes" value="<?= e($row['notes']) ?>" placeholder="Notes" class="rounded-lg border px-3 py-2 sm:col-span-2">
        <button class="w-fit rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Update</button>
      </form>
    </article>
  <?php endforeach; ?>
</div>
<?php render_layout_end(); ?>

