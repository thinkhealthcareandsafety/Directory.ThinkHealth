// Standalone auth page logic. Loaded only by login.html — index.html never
// includes this. Depends on config.js for API_BASE and the storage keys.

// Already signed in? Skip the form entirely.
if (localStorage.getItem(AUTH_TOKEN_KEY)) {
  window.location.replace('index.html');
}

const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const signinError = document.getElementById('signinError');
const signinSuccess = document.getElementById('signinSuccess');
const signupError = document.getElementById('signupError');
const signupSuccess = document.getElementById('signupSuccess');
const signinSubmit = document.getElementById('signinSubmit');
const signupSubmit = document.getElementById('signupSubmit');

const ALL_PANELS = ['signin', 'signup', 'forgot-request', 'forgot-otp', 'forgot-reset'];
const FORGOT_PANELS = ['forgot-request', 'forgot-otp', 'forgot-reset'];

// ------------------------------------------------------------------
// Tabs / panel switching
// ------------------------------------------------------------------
function showPanel(name) {
  document.getElementById('authTabs').hidden = FORGOT_PANELS.includes(name);
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.panel === name);
  });
  ALL_PANELS.forEach((p) => {
    document.getElementById(`panel-${p}`).hidden = p !== name;
  });
  if (name !== 'forgot-otp' && name !== 'forgot-reset') stopOtpTimer();
}

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => showPanel(tab.dataset.panel));
});

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function hideMessages() {
  [signinError, signinSuccess, signupError, signupSuccess].forEach((el) => { el.hidden = true; });
}

function show(el, text) {
  el.textContent = text;
  el.hidden = false;
}

async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(`Could not reach the server at ${API_BASE}. Is the API running?`);
  }

  let payload = {};
  try { payload = await res.json(); } catch (_) { /* body wasn't JSON */ }

  if (!res.ok) {
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload;
}

// ------------------------------------------------------------------
// Sign in
// ------------------------------------------------------------------
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const email = document.getElementById('signinEmail').value.trim();
  const password = document.getElementById('signinPassword').value;

  if (!email || !password) {
    show(signinError, 'Enter your email and password.');
    return;
  }

  signinSubmit.disabled = true;
  signinSubmit.textContent = 'Signing in...';

  try {
    const { token, user } = await postJson('/auth/login', { email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    // replace() so Back doesn't return to the login screen post-authentication.
    window.location.replace('index.html');
  } catch (err) {
    show(signinError, err.message);
    signinSubmit.disabled = false;
    signinSubmit.textContent = 'Sign In';
  }
});

// ------------------------------------------------------------------
// Create account
// ------------------------------------------------------------------
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    show(signupError, 'Passwords do not match.');
    return;
  }

  signupSubmit.disabled = true;
  signupSubmit.textContent = 'Creating account...';

  try {
    const data = await postJson('/auth/register', { email, password });
    signupForm.reset();
    showPanel('signin');
    document.getElementById('signinEmail').value = email;
    show(signinSuccess, data.message || 'Account created. You can now sign in.');
    document.getElementById('signinPassword').focus();
  } catch (err) {
    show(signupError, err.message);
  } finally {
    signupSubmit.disabled = false;
    signupSubmit.textContent = 'Create Account';
  }
});

// ------------------------------------------------------------------
// Forgot password — three steps: request code -> verify code -> set
// password. The server only hands out a reset ticket once the code has
// actually been checked, so the password fields don't even appear until
// that round-trip has succeeded.
// ------------------------------------------------------------------
const OTP_LIFETIME_SECONDS = 5 * 60;

const forgotRequestForm = document.getElementById('forgotRequestForm');
const forgotRequestError = document.getElementById('forgotRequestError');
const forgotRequestSuccess = document.getElementById('forgotRequestSuccess');
const forgotRequestSubmit = document.getElementById('forgotRequestSubmit');
const forgotEmailInput = document.getElementById('forgotEmail');

const forgotOtpForm = document.getElementById('forgotOtpForm');
const forgotOtpError = document.getElementById('forgotOtpError');
const forgotOtpSuccess = document.getElementById('forgotOtpSuccess');
const forgotOtpSubmit = document.getElementById('forgotOtpSubmit');
const forgotOtpNote = document.getElementById('forgotOtpNote');
const forgotOtpInput = document.getElementById('forgotOtp');
const otpTimerEl = document.getElementById('otpTimer');
const otpResendBtn = document.getElementById('otpResend');

const forgotResetForm = document.getElementById('forgotResetForm');
const forgotResetError = document.getElementById('forgotResetError');
const forgotResetSubmit = document.getElementById('forgotResetSubmit');
const resetTimerEl = document.getElementById('resetTimer');

let resetEmail = '';
let resetTicket = '';
let otpTimerInterval = null;
let otpDeadline = 0;

function stopOtpTimer() {
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
    otpTimerInterval = null;
  }
}

// `seconds` lets the timer continue an existing budget (e.g. after
// check-otp reports how much of the original 5 minutes is left) instead of
// always restarting a fresh 5:00 — verifying the code doesn't buy more time.
function startOtpTimer(seconds = OTP_LIFETIME_SECONDS) {
  stopOtpTimer();
  otpDeadline = Date.now() + seconds * 1000;
  [otpTimerEl, resetTimerEl].forEach((el) => el.classList.remove('is-expired'));
  otpResendBtn.disabled = true;
  forgotOtpSubmit.disabled = false;
  forgotResetSubmit.disabled = false;

  const tick = () => {
    const remaining = Math.max(0, Math.round((otpDeadline - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    if (remaining > 0) {
      const label = `Expires in ${mins}:${secs.toString().padStart(2, '0')}`;
      otpTimerEl.textContent = label;
      resetTimerEl.textContent = label;
    } else {
      const label = 'Expired — request a new code.';
      [otpTimerEl, resetTimerEl].forEach((el) => { el.textContent = label; el.classList.add('is-expired'); });
      otpResendBtn.disabled = false;
      forgotOtpSubmit.disabled = true;
      forgotResetSubmit.disabled = true;
      stopOtpTimer();
    }
  };
  tick();
  otpTimerInterval = setInterval(tick, 1000);
}

function goToForgotPassword() {
  hideMessages();
  [forgotRequestError, forgotRequestSuccess, forgotOtpError, forgotOtpSuccess, forgotResetError].forEach((el) => { el.hidden = true; });
  forgotRequestForm.reset();
  showPanel('forgot-request');
  forgotEmailInput.focus();
}

document.getElementById('forgotPasswordLink').addEventListener('click', goToForgotPassword);
document.getElementById('forgotBackToSignin1').addEventListener('click', () => showPanel('signin'));
document.getElementById('forgotBackToSignin2').addEventListener('click', () => showPanel('signin'));
document.getElementById('forgotBackToSignin3').addEventListener('click', () => showPanel('signin'));

async function requestOtp() {
  return postJson('/auth/password-reset/request', { email: resetEmail });
}

// ---- Step 1: request the code ----
forgotRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  forgotRequestError.hidden = true;

  const email = forgotEmailInput.value.trim();
  if (!email) {
    show(forgotRequestError, 'Enter your email.');
    return;
  }
  resetEmail = email;

  forgotRequestSubmit.disabled = true;
  forgotRequestSubmit.textContent = 'Sending...';

  try {
    const data = await requestOtp();
    forgotOtpForm.reset();
    forgotOtpError.hidden = true;
    forgotOtpSuccess.hidden = true;
    forgotOtpNote.textContent = `We've sent a 6-digit code to ${email} if that address is registered. Enter it below.`;
    showPanel('forgot-otp');
    startOtpTimer();
    forgotOtpInput.focus();
    show(forgotRequestSuccess, data.message);
  } catch (err) {
    show(forgotRequestError, err.message);
  } finally {
    forgotRequestSubmit.disabled = false;
    forgotRequestSubmit.textContent = 'Send Code';
  }
});

otpResendBtn.addEventListener('click', async () => {
  otpResendBtn.disabled = true;
  forgotOtpError.hidden = true;
  try {
    await requestOtp();
    forgotOtpInput.value = '';
    startOtpTimer();
    show(forgotOtpSuccess, 'A new code has been sent.');
  } catch (err) {
    show(forgotOtpError, err.message);
    otpResendBtn.disabled = false;
  }
});

// ---- Step 2: verify the code (no password fields exist yet) ----
forgotOtpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  forgotOtpError.hidden = true;
  forgotOtpSuccess.hidden = true;

  const otp = forgotOtpInput.value.trim();

  if (otpDeadline && Date.now() > otpDeadline) {
    show(forgotOtpError, 'That code has expired. Request a new one.');
    return;
  }
  if (!/^\d{6}$/.test(otp)) {
    show(forgotOtpError, 'Enter the 6-digit code.');
    return;
  }

  forgotOtpSubmit.disabled = true;
  forgotOtpSubmit.textContent = 'Verifying...';

  try {
    const data = await postJson('/auth/password-reset/check-otp', { email: resetEmail, otp });
    resetTicket = data.resetTicket;
    forgotResetForm.reset();
    forgotResetError.hidden = true;
    showPanel('forgot-reset');
    // Continue the same countdown rather than restarting it — the server
    // reports exactly how much of the original 5 minutes is left.
    startOtpTimer(data.secondsRemaining ?? OTP_LIFETIME_SECONDS);
    document.getElementById('forgotNewPassword').focus();
  } catch (err) {
    show(forgotOtpError, err.message);
  } finally {
    forgotOtpSubmit.disabled = false;
    forgotOtpSubmit.textContent = 'Verify Code';
  }
});

// ---- Step 3: set the new password, using the ticket from step 2 ----
forgotResetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  forgotResetError.hidden = true;

  const newPassword = document.getElementById('forgotNewPassword').value;
  const confirm = document.getElementById('forgotConfirmPassword').value;

  if (otpDeadline && Date.now() > otpDeadline) {
    show(forgotResetError, 'This reset has expired. Request a new code.');
    return;
  }
  if (newPassword !== confirm) {
    show(forgotResetError, 'Passwords do not match.');
    return;
  }

  forgotResetSubmit.disabled = true;
  forgotResetSubmit.textContent = 'Resetting...';

  try {
    const data = await postJson('/auth/password-reset/complete', { email: resetEmail, resetTicket, newPassword });
    stopOtpTimer();
    forgotResetForm.reset();
    resetTicket = '';
    showPanel('signin');
    document.getElementById('signinEmail').value = resetEmail;
    show(signinSuccess, data.message || 'Password updated. You can now sign in.');
    document.getElementById('signinPassword').focus();
  } catch (err) {
    show(forgotResetError, err.message);
  } finally {
    forgotResetSubmit.disabled = false;
    forgotResetSubmit.textContent = 'Reset Password';
  }
});
