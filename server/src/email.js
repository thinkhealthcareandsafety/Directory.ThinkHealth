const nodemailer = require('nodemailer');
const { config } = require('./config');

let transporter = null;

function getTransporter() {
  if (!config.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

// In development without SMTP configured, the code is logged instead of
// emailed so the reset flow is still testable locally. validateConfig()
// makes this fatal in production, so this branch never runs there.
async function sendPasswordResetOtp(email, otp) {
  const t = getTransporter();
  if (!t) {
    console.log(`[dev] Password reset code for ${email}: ${otp} (expires in ${config.passwordResetOtp.expiresMinutes} min)`);
    return;
  }

  await t.sendMail({
    from: config.smtp.from,
    to: email,
    subject: 'Your Thinkhealth password reset code',
    text: `Your password reset code is ${otp}. It expires in ${config.passwordResetOtp.expiresMinutes} minutes. If you didn't request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:600;letter-spacing:0.1em;">${otp}</p><p>It expires in ${config.passwordResetOtp.expiresMinutes} minutes. If you didn't request this, ignore this email.</p>`,
  });
}

module.exports = { sendPasswordResetOtp };
