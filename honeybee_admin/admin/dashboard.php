<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';
require_login();

$totalPackages = (int) db()->query('SELECT COUNT(*) FROM packages')->fetchColumn();
$totalDestinations = (int) db()->query('SELECT COUNT(*) FROM destinations')->fetchColumn();
$totalBookings = (int) db()->query('SELECT COUNT(*) FROM bookings')->fetchColumn();
$totalEnquiries = (int) db()->query('SELECT COUNT(*) FROM enquiries')->fetchColumn();

$activities = db()->query('SELECT type, message, created_at FROM activity_logs ORDER BY id DESC LIMIT 12')->fetchAll();

render_layout_start('Dashboard', 'dashboard');
?>
<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <?php
  $cards = [
      ['label' => 'Total Packages', 'value' => $totalPackages],
      ['label' => 'Total Destinations', 'value' => $totalDestinations],
      ['label' => 'Total Bookings', 'value' => $totalBookings],
      ['label' => 'Total Enquiries', 'value' => $totalEnquiries],
  ];
  foreach ($cards as $card):
  ?>
  <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-sm text-slate-500"><?= e($card['label']) ?></p>
    <p class="mt-2 text-3xl font-bold"><?= e((string) $card['value']) ?></p>
  </article>
  <?php endforeach; ?>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold">Recent Activity</h3>
    <span class="text-xs text-slate-500">Last updates</span>
  </div>
  <div class="mt-4 overflow-x-auto">
    <table class="min-w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-600">
        <tr>
          <th class="px-3 py-2">Type</th>
          <th class="px-3 py-2">Message</th>
          <th class="px-3 py-2">Date</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($activities as $row): ?>
          <tr class="border-t border-slate-100">
            <td class="px-3 py-2 font-medium uppercase text-xs"><?= e($row['type']) ?></td>
            <td class="px-3 py-2"><?= e($row['message']) ?></td>
            <td class="px-3 py-2 text-slate-500"><?= e((string) $row['created_at']) ?></td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$activities): ?>
          <tr><td colspan="3" class="px-3 py-4 text-slate-500">No recent activity yet.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>
<?php render_layout_end(); ?>

