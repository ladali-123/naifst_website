(function () {
  const params = new URLSearchParams(location.search);
  const localApi = params.get('api');
  const API = ['localhost','127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '') ? localApi : (['localhost','127.0.0.1'].includes(location.hostname) ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api') : `${location.origin}/api`);
  const dashboardUrl = localApi ? `admin-dashboard.html?api=${encodeURIComponent(API)}` : 'admin-dashboard.html';
  const form = document.getElementById('adminLoginForm');
  const alertBox = document.getElementById('adminLoginAlert');
  const button = document.getElementById('adminLoginBtn');

  function showAlert(message) {
    alertBox.textContent = message || '';
    alertBox.classList.toggle('active', Boolean(message));
  }

  function setBusy(isBusy) {
    button.disabled = isBusy;
    button.querySelector('span').textContent = isBusy ? 'Logging in...' : 'Login to Admin';
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

  if (localStorage.getItem('naisft_admin_token') && new URLSearchParams(window.location.search).get('fresh') !== '1') {
    window.location.href = dashboardUrl;
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showAlert('');

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
      showAlert('Email and password are required.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetchWithTimeout(API + '/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 20000);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Admin login failed.');
      }

      localStorage.setItem('naisft_admin_token', data.token);
      localStorage.setItem('naisft_admin', JSON.stringify(data.admin || {}));
      window.location.href = dashboardUrl;
    } catch (err) {
      showAlert(err.name === 'AbortError' ? 'Login is taking too long. Please try again.' : err.message || 'Network error. Please try again.');
      setBusy(false);
    }
  });
})();
