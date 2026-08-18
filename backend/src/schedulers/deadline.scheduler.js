const cron = require("node-cron");
const taskRepository = require("../repositories/task.repository");
const { sendDeadlineReminderEmail } = require("../services/email.service");

/**
 * Jalankan pengecekan deadline dan kirim email reminder.
 * Dipanggil oleh cron job maupun bisa dipanggil manual untuk testing.
 */
async function checkAndNotifyDeadlines() {
  console.log("🕐 [Deadline Scheduler] Memeriksa task yang mendekati deadline...");

  try {
    const tasks = await taskRepository.getTasksNearDeadline(2);

    if (tasks.length === 0) {
      console.log("✅ [Deadline Scheduler] Tidak ada task yang mendekati deadline.");
      return;
    }

    console.log(`📋 [Deadline Scheduler] Ditemukan ${tasks.length} task:`);
    tasks.forEach((t) => {
      console.log(`   - "${t.title}" | deadline: ${t.deadline} | ${t.days_left} hari lagi | ke: ${t.user_email}`);
    });

    const results = await Promise.allSettled(
      tasks.map((task) =>
        sendDeadlineReminderEmail({
          to: task.user_email,
          userName: task.user_name,
          taskTitle: task.title,
          deadline: task.deadline,
          daysLeft: task.days_left,
        })
      )
    );

    let successCount = 0;
    let failCount = 0;

    results.forEach((result, index) => {
      const task = tasks[index];
      if (result.status === "fulfilled") {
        successCount++;
        console.log(`  ✉️  Email terkirim → ${task.user_email} | Task: "${task.title}"`);
      } else {
        failCount++;
        console.error(`  ❌  Gagal kirim email → ${task.user_email} | Task: "${task.title}" | Error: ${result.reason?.message}`);
      }
    });

    console.log(`✅ [Deadline Scheduler] Selesai. Berhasil: ${successCount}, Gagal: ${failCount}`);
  } catch (err) {
    console.error("❌ [Deadline Scheduler] Error:", err.message);
  }
}

/**
 * Daftarkan cron job — berjalan setiap hari pukul 21:45 WIB.
 */
function registerDeadlineScheduler() {
  cron.schedule("57 21 * * *", () => {
    checkAndNotifyDeadlines();
  }, {
    timezone: "Asia/Jakarta",
  });

  console.log("📅 [Deadline Scheduler] Scheduler terdaftar — berjalan setiap hari pukul 21:45 WIB.");
}

module.exports = { registerDeadlineScheduler, checkAndNotifyDeadlines };
