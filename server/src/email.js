const { Resend } = require('resend');
const { config } = require('./config');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendPasswordResetOtp(email, otp) {
  if (!resend) {
    console.log(`[dev] Password reset code for ${email}: ${otp} (expires in ${config.passwordResetOtp.expiresMinutes} min)`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Default testing domain provided by Resend
      to: email,
      subject: 'Your Thinkhealth password reset code',
      html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:600;letter-spacing:0.1em;">${otp}</p><p>It expires in ${config.passwordResetOtp.expiresMinutes} minutes. If you didn't request this, ignore this email.</p>`,
    });
  } catch (error) {
    console.error('[Resend Error] Failed to send password reset email:', error);
    throw error;
  }
}

async function sendSignupOtp(email, otp) {
  if (!resend) {
    console.log(`[dev] Signup verification code for ${email}: ${otp} (expires in ${config.signupOtp.expiresMinutes} min)`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your email — Thinkhealth Hotel Database',
      html: `<p>Your verification code is:</p><p style="font-size:28px;font-weight:600;letter-spacing:0.1em;">${otp}</p><p>Enter it to finish creating your account. It expires in ${config.signupOtp.expiresMinutes} minutes. If you didn't request this, ignore this email.</p>`,
    });
  } catch (error) {
    console.error('[Resend Error] Failed to send signup email:', error);
    throw error;
  }
}

module.exports = { sendPasswordResetOtp, sendSignupOtp };