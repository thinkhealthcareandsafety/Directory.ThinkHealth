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

const ALL_PANELS = ['signin', 'signup', 'signup-otp', 'forgot-request', 'forgot-otp', 'forgot-reset'];
const TABLESS_PANELS = ['signup-otp', 'forgot-request', 'forgot-otp', 'forgot-reset'];

// ------------------------------------------------------------------
// Tabs / panel switching
// ------------------------------------------------------------------
function showPanel(name) {
  document.getElementById('authTabs').hidden = TABLESS_PANELS.includes(name);
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.panel === name);
  });
  ALL_PANELS.forEach((p) => {
    document.getElementById(`panel-${p}`).hidden = p !== name;
  });
  if (name !== 'forgot-otp' && name !== 'forgot-reset') stopOtpTimer();
  if (name !== 'signup-otp') stopSignupOtpTimer();
}

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => showPanel(tab.dataset.panel));
});

// Arriving from about.html's "Create Account" button (?tab=signup) opens
// straight to that tab instead of making the person click it again.
const requestedTab = new URLSearchParams(window.location.search).get('tab');
if (requestedTab === 'signup') showPanel('signup');

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
// Step 1 only requests a code now — the account isn't created until step 2
// verifies it. resetEmail/resetTicket-style module state, but its own
// variables so this can't cross-wire with the forgot-password flow.
let signupEmail = '';
let signupPassword = '';

const SIGNUP_OTP_LIFETIME_SECONDS = 10 * 60;
const signupOtpForm = document.getElementById('signupOtpForm');
const signupOtpError = document.getElementById('signupOtpError');
const signupOtpSuccess = document.getElementById('signupOtpSuccess');
const signupOtpSubmit = document.getElementById('signupOtpSubmit');
const signupOtpNote = document.getElementById('signupOtpNote');
const signupOtpInput = document.getElementById('signupOtp');
const signupOtpTimerEl = document.getElementById('signupOtpTimer');
const signupOtpResend = document.getElementById('signupOtpResend');

let signupOtpTimerInterval = null;
let signupOtpDeadline = 0;

function stopSignupOtpTimer() {
  if (signupOtpTimerInterval) {
    clearInterval(signupOtpTimerInterval);
    signupOtpTimerInterval = null;
  }
}
function startSignupOtpTimer(seconds = SIGNUP_OTP_LIFETIME_SECONDS) {
  stopSignupOtpTimer();
  signupOtpDeadline = Date.now() + seconds * 1000;
  signupOtpTimerEl.classList.remove('is-expired');
  signupOtpResend.disabled = true;
  signupOtpSubmit.disabled = false;

  const tick = () => {
    const remaining = Math.max(0, Math.round((signupOtpDeadline - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    if (remaining > 0) {
      signupOtpTimerEl.textContent = `Expires in ${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
      signupOtpTimerEl.textContent = 'Code expired — request a new one.';
      signupOtpTimerEl.classList.add('is-expired');
      signupOtpResend.disabled = false;
      signupOtpSubmit.disabled = true;
      stopSignupOtpTimer();
    }
  };
  tick();
  signupOtpTimerInterval = setInterval(tick, 1000);
}

async function requestSignupOtp() {
  return postJson('/auth/register/request', { email: signupEmail, password: signupPassword });
}

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

  signupEmail = email;
  signupPassword = password;

  signupSubmit.disabled = true;
  signupSubmit.textContent = 'Sending code...';

  try {
    const data = await requestSignupOtp();
    signupOtpForm.reset();
    signupOtpError.hidden = true;
    signupOtpSuccess.hidden = true;
    signupOtpNote.textContent = `We've sent a 6-digit code to ${email} if that address isn't already registered. Enter it below to finish creating your account.`;
    showPanel('signup-otp');
    startSignupOtpTimer();
    signupOtpInput.focus();
  } catch (err) {
    show(signupError, err.message);
  } finally {
    signupSubmit.disabled = false;
    signupSubmit.textContent = 'Send Verification Code';
  }
});

document.getElementById('signupBackToSignup').addEventListener('click', () => showPanel('signup'));

signupOtpResend.addEventListener('click', async () => {
  signupOtpResend.disabled = true;
  signupOtpError.hidden = true;
  try {
    await requestSignupOtp();
    signupOtpInput.value = '';
    startSignupOtpTimer();
    show(signupOtpSuccess, 'A new code has been sent.');
  } catch (err) {
    show(signupOtpError, err.message);
    signupOtpResend.disabled = false;
  }
});

signupOtpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupOtpError.hidden = true;
  signupOtpSuccess.hidden = true;

  const otp = signupOtpInput.value.trim();

  if (signupOtpDeadline && Date.now() > signupOtpDeadline) {
    show(signupOtpError, 'That code has expired. Request a new one.');
    return;
  }
  if (!/^\d{6}$/.test(otp)) {
    show(signupOtpError, 'Enter the 6-digit code.');
    return;
  }

  signupOtpSubmit.disabled = true;
  signupOtpSubmit.textContent = 'Verifying...';

  try {
    const data = await postJson('/auth/register/verify', { email: signupEmail, otp });
    stopSignupOtpTimer();
    signupForm.reset();
    signupOtpForm.reset();
    const emailForSignin = signupEmail;
    signupEmail = '';
    signupPassword = '';
    showPanel('signin');
    document.getElementById('signinEmail').value = emailForSignin;
    show(signinSuccess, data.message || 'Account created. You can now sign in.');
    document.getElementById('signinPassword').focus();
  } catch (err) {
    show(signupOtpError, err.message);
  } finally {
    signupOtpSubmit.disabled = false;
    signupOtpSubmit.textContent = 'Verify & Create Account';
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

// ------------------------------------------------------------------
// Show/hide password
//
// Built here rather than in the markup so every .pwfield gets one without
// five near-identical blocks of HTML. Revealing is per-field and always
// starts hidden — a reveal that persisted across panels would be a
// shoulder-surfing hazard on a shared screen.
// ------------------------------------------------------------------
const EYE_SHOW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.75"/></svg>';
const EYE_HIDE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5c1.9 0 3.5.6 4.9 1.4M22 12s-3.6 6.5-10 6.5c-1.9 0-3.6-.6-5-1.4"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/><path d="M3 3l18 18"/></svg>';

document.querySelectorAll('.pwfield').forEach((field) => {
  const input = field.querySelector('input[type="password"]');
  if (!input) return;

  const btn = document.createElement('button');
  btn.type = 'button';                   // never submit the form
  btn.className = 'pwtoggle';
  btn.innerHTML = EYE_SHOW;
  btn.setAttribute('aria-label', 'Show password');
  btn.setAttribute('aria-pressed', 'false');

  btn.addEventListener('click', () => {
    const revealed = input.type === 'text';
    input.type = revealed ? 'password' : 'text';
    btn.innerHTML = revealed ? EYE_SHOW : EYE_HIDE;
    btn.setAttribute('aria-label', revealed ? 'Show password' : 'Hide password');
    btn.setAttribute('aria-pressed', String(!revealed));
    // Keep the caret where the person left it rather than jumping to the end.
    const pos = input.selectionStart;
    input.focus();
    try { input.setSelectionRange(pos, pos); } catch (_) { /* type change can reject this */ }
  });

  field.appendChild(btn);
});
