const { Resend } = require("resend");

const resend = new Resend(process.env.KEY_RESEND_EMAIL);


async function sendDeadlineReminderEmail({ to, userName, taskTitle, deadline, daysLeft }) {
  const deadlineFormatted = new Date(deadline).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const urgencyLabel = daysLeft === 0
    ? "⚠️ HARI INI!"
    : daysLeft === 1
    ? "⚠️ Besok!"
    : `${daysLeft} hari lagi`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Pengingat Deadline Task</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background-color:#ef4444;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                    🔔 Pengingat Deadline Task
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                    Halo, <strong>${userName}</strong>!
                  </p>
                  <p style="margin:0 0 24px;font-size:15px;color:#374151;">
                    Task kamu berikut ini mendekati batas waktu penyelesaian:
                  </p>

                  <!-- Task Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:24px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Judul Task</p>
                        <p style="margin:0 0 16px;font-size:17px;font-weight:700;color:#111827;">${taskTitle}</p>
                        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Deadline</p>
                        <p style="margin:0 0 12px;font-size:15px;color:#374151;">${deadlineFormatted}</p>
                        <span style="display:inline-block;background-color:#ef4444;color:#ffffff;font-size:13px;font-weight:700;padding:4px 12px;border-radius:9999px;">
                          ${urgencyLabel}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 24px;font-size:15px;color:#374151;">
                    Segera selesaikan task ini sebelum deadline! Kamu bisa login ke aplikasi untuk memperbarui statusnya.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:#3b82f6;border-radius:6px;">
                        <a href="${process.env.FRONTEND_URL || "#"}"
                           style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                          Buka Aplikasi
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">
                    Email ini dikirim otomatis oleh Task Management System. Harap tidak membalas email ini.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Jika EMAIL_TEST_OVERRIDE diset, semua email diarahkan ke alamat tersebut
  // (berguna saat development tanpa domain terverifikasi di Resend)
  const recipient = process.env.EMAIL_TEST_OVERRIDE || to;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: recipient,
    subject: `🔔 Deadline Task "${taskTitle}" ${urgencyLabel}`,
    html,
  });

  if (error) {
    throw new Error(`Gagal mengirim email ke ${to}: ${error.message}`);
  }

  return data;
}

module.exports = { sendDeadlineReminderEmail };
