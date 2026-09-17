(function () {
  const params = new URLSearchParams(location.search);
  const localApi = params.get('api');
  const API = ['localhost','127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '') ? localApi : (['localhost','127.0.0.1'].includes(location.hostname) ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api') : `${location.origin}/api`);
  const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
  const localTestEmail = 'local.student@naisft.test';
  const localTestPassword = 'LocalStudent@123';
  const dashboardUrl = localApi ? `student-dashboard.html?api=${encodeURIComponent(API)}` : 'student-dashboard.html';
  const localDashboardUrl = localApi
    ? `student-dashboard.html?dev=1&api=${encodeURIComponent(API)}`
    : 'student-dashboard.html?dev=1';
  const form = document.getElementById('studentLoginForm');
  const alertBox = document.getElementById('studentLoginAlert');
  const button = document.getElementById('studentLoginBtn');
  let recoveryPhone = '';

  function showAlert(message, type) {
    alertBox.textContent = message;
    if (!message) {
      alertBox.className = 'qa-alert portal-alert';
      return;
    }
    alertBox.className = 'qa-alert portal-alert ' + (type || 'error');
  }

  function setBusy(isBusy) {
    button.disabled = isBusy;
    button.querySelector('span').textContent = isBusy ? 'Logging in...' : 'Login to Dashboard';
  }

  function showLoginPanel(showLogin) {
    const loginPanel = document.getElementById('studentLoginPanel');
    const recoveryPanel = document.getElementById('studentRecoveryPanel');
    const newLine = document.getElementById('studentNewLine');
    const forgotLine = document.getElementById('studentForgotLine');
    if (loginPanel) loginPanel.classList.toggle('hidden', !showLogin);
    if (recoveryPanel) recoveryPanel.classList.toggle('active', !showLogin);
    if (newLine) newLine.classList.toggle('hidden', false);
    if (forgotLine) forgotLine.classList.toggle('hidden', !showLogin);
    showAlert(
      showLogin ? '' : 'Recover your account using your registered email or mobile number.',
      showLogin ? '' : 'success'
    );
  }

  async function postJson(path, body) {
    const res = await fetchWithTimeout(API + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    }, 60000);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Request failed.');
    return data;
  }

  async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  const existingToken = localStorage.getItem('naisft_token');
  if (existingToken && new URLSearchParams(window.location.search).get('fresh') !== '1') {
    window.location.href = existingToken === 'NAISFT-LOCAL-DEV-TOKEN' ? localDashboardUrl : dashboardUrl;
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showAlert('', '');

    const email = document.getElementById('studentEmail').value.trim();
    const password = document.getElementById('studentPassword').value;

    if (!email || !password) {
      showAlert('Email and password are required.', 'error');
      return;
    }

    if (isLocalHost && email.toLowerCase() === localTestEmail && password === localTestPassword) {
      localStorage.setItem('naisft_token', 'NAISFT-LOCAL-DEV-TOKEN');
      localStorage.setItem('naisft_student', JSON.stringify({
        fullName: 'Local Test Student',
        email: localTestEmail,
        enrollmentNo: 'NAISFT-LOCAL-0001',
      }));
      window.location.href = localDashboardUrl;
      return;
    }

    setBusy(true);
    showAlert('', '');

    const warmupTimer = setTimeout(() => {
      showAlert('Server is starting up — this can take up to 30 seconds on first use. Please wait…', 'info');
    }, 6000);

    try {
      const res = await fetchWithTimeout(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 60000);

      clearTimeout(warmupTimer);

      let data = {};
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error('Login server returned an invalid response. Please try again.');
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your details.');
      }

      localStorage.setItem('naisft_token', data.token);
      localStorage.setItem('naisft_student', JSON.stringify(data.student || {}));
      window.location.href = dashboardUrl;
    } catch (err) {
      clearTimeout(warmupTimer);
      const message = err.name === 'AbortError'
        ? 'Server took too long to respond. Please try again in a moment.'
        : err.message || 'Network error. Please try again.';
      showAlert(message, 'error');
      setBusy(false);
    }
  });

  document.getElementById('studentShowForgotBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    showLoginPanel(false);
  });
  document.getElementById('studentBackToLoginBtn')?.addEventListener('click', () => showLoginPanel(true));

  document.getElementById('studentRecoveryStartBtn')?.addEventListener('click', async () => {
    showAlert('', '');
    const btn = document.getElementById('studentRecoveryStartBtn');
    const identifier = document.getElementById('studentRecoveryIdentifier')?.value || '';
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';
    try {
      const data = await postJson('/checkout/forgot-password/start', { identifier });
      recoveryPhone = data.resetToken || identifier;
      showAlert((data.message || 'OTP sent if the account exists.') + (data.devOtp ? ' Test OTP: ' + data.devOtp : ''), 'success');
    } catch (err) {
      showAlert(err.message || 'Could not send recovery OTP.', 'error');
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send OTP';
    }
  });

  document.getElementById('studentRecoveryResetBtn')?.addEventListener('click', async () => {
    showAlert('', '');
    const btn = document.getElementById('studentRecoveryResetBtn');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Changing...';
    try {
      const data = await postJson('/checkout/forgot-password/reset', {
        phone: recoveryPhone || document.getElementById('studentRecoveryIdentifier')?.value || '',
        otp: document.getElementById('studentRecoveryOtp')?.value || '',
        newPassword: document.getElementById('studentRecoveryPassword')?.value || '',
      });
      showAlert(data.message || 'Password changed. Please login.', 'success');
      showLoginPanel(true);
    } catch (err) {
      showAlert(err.message || 'Could not change password.', 'error');
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Change Password';
    }
  });
})();
