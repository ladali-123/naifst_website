(function () {
  const params = new URLSearchParams(window.location.search);
  const localApi = params.get('api');
  const API = ['localhost','127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '') ? localApi : (['localhost','127.0.0.1'].includes(location.hostname) ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api') : `${location.origin}/api`);
  const tokenFromUrl = params.get('token') || params.get('id') || params.get('q') || '';
  const soundPreferenceKey = 'naisft_credential_sound';
  const soundEnabled = () => localStorage.getItem(soundPreferenceKey) !== 'off';

  function qs(id) {
    return document.getElementById(id);
  }

  function resultBox() {
    return qs('certificateResult') || qs('verifyResult');
  }

  function tokenInput() {
    return qs('certificateTokenInput') || qs('verifyTokenInput') || document.querySelector('#verifyForm input');
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function verifyUrl(token) {
    const origin = window.location.origin || 'https://naisftindia.com';
    const path = window.location.pathname.replace(/[^/]*$/, 'certificate-record.html');
    return origin + path + '?token=' + encodeURIComponent(token);
  }

  function fallbackQrUrl(token) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=' + encodeURIComponent(verifyUrl(token));
  }

  function certificateQrUrl(certificate) {
    if (certificate.qrCodeUrl) return certificate.qrCodeUrl;
    if (certificate.verifyToken) return API + '/certificates/qr/' + encodeURIComponent(certificate.verifyToken);
    return fallbackQrUrl('NAISFT-CERTIFICATE');
  }

  function certificateDownloadUrl(token) {
    if (!token || String(token).startsWith('DEV-CERT')) return '';
    return API + '/certificates/download/' + encodeURIComponent(token);
  }

  async function playVerifiedSound(force) {
    if (!force && !soundEnabled()) return false;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      const context = new AudioContextClass();
      await context.resume();
      const gain = context.createGain();
      gain.connect(context.destination);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.48);
      [659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start(context.currentTime + index * 0.14);
        oscillator.stop(context.currentTime + 0.5);
      });
      setTimeout(() => context.close(), 700);
      return true;
    } catch (error) {
      return false;
    }
  }

  function demoCertificate(token) {
    return {
      verifyToken: token || 'NAISFT-CERT-2026-000001',
      certificateNumber: token || 'NAISFT-CERT-2026-000001',
      issuedAt: '2026-07-02T10:30:00.000Z',
      status: 'Valid Certificate',
      student: {
        fullName: 'Aarav Kumar',
        enrollmentNo: 'NAISFT-2026-0007',
        email: 'aarav.kumar@example.com',
        phone: '9876543210',
      },
      course: {
        name: 'Diploma in Industrial Safety',
        duration: '12 Months',
        category: { name: 'Safety Courses' },
      },
    };
  }

  function renderLoading(message) {
    const target = resultBox();
    if (!target) return;
    target.style.display = 'block';
    target.innerHTML = `
      <div class="cert-state-card">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <h2>${escapeHtml(message || 'Loading certificate...')}</h2>
      </div>
    `;
  }

  function renderError(message) {
    const target = resultBox();
    if (!target) return;
    target.style.display = 'block';
    target.innerHTML = `
      <div class="cert-state-card error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h2>Certificate not verified</h2>
        <p>${escapeHtml(message || 'Certificate token is invalid or unavailable.')}</p>
      </div>
    `;
  }

  function certificateSvgFontSize(value, preferred, minimum, threshold) {
    return Math.max(minimum, preferred - Math.max(0, String(value || '').length - threshold) * 0.85).toFixed(1);
  }

  async function hydrateCertificateSvg(certificate) {
    const mount = qs('certificateSvgMount');
    if (!mount) return;
    try {
      const response = await fetch('Assets/NAISFT-certificate-template.svg');
      if (!response.ok) throw new Error('Certificate artwork could not be loaded.');
      const documentNode = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      const svg = documentNode.documentElement;
      const student = certificate.student || {};
      const course = certificate.course || {};
      const values = {
        student_name: student.fullName || 'Student Name',
        course_name: course.name || 'Course',
        verification_token: certificate.verifyToken || certificate.certificateNumber || '-',
        registration_number: student.enrollmentNo || '-',
        certificate_number: certificate.certificateNumber || '-',
        date_of_issue: formatDate(certificate.issuedAt),
        place_of_issue: certificate.placeOfIssue || 'New Delhi, India',
      };
      Object.entries(values).forEach(([id, value]) => {
        const node = svg.querySelector(`#${id}`);
        if (node) node.textContent = value;
      });
      svg.querySelector('#student_name')?.setAttribute('font-size', certificateSvgFontSize(values.student_name, 49, 27, 20));
      svg.querySelector('#course_name')?.setAttribute('font-size', certificateSvgFontSize(values.course_name, 40, 22, 28));
      svg.querySelector('#verification_token')?.setAttribute('font-size', certificateSvgFontSize(values.verification_token, 18, 8, 16));
      svg.querySelector('#registration_number')?.setAttribute('font-size', certificateSvgFontSize(values.registration_number, 16, 10, 18));
      svg.querySelector('#certificate_number')?.setAttribute('font-size', certificateSvgFontSize(values.certificate_number, 16, 9, 18));

      const qrGroup = svg.querySelector('#editable_qr_code');
      if (qrGroup) {
        qrGroup.replaceChildren();
        const namespace = 'http://www.w3.org/2000/svg';
        const border = documentNode.createElementNS(namespace, 'rect');
        Object.entries({ x: '139', y: '542', width: '124', height: '124', fill: '#fff', stroke: '#c48a2c', 'stroke-width': '2' })
          .forEach(([name, value]) => border.setAttribute(name, value));
        const image = documentNode.createElementNS(namespace, 'image');
        Object.entries({ x: '145', y: '548', width: '112', height: '112', href: certificateQrUrl(certificate) })
          .forEach(([name, value]) => image.setAttribute(name, value));
        qrGroup.append(border, image);
      }
      svg.classList.add('certificate-template-svg');
      mount.replaceChildren(document.importNode(svg, true));
    } catch (error) {
      mount.innerHTML = `<div class="cert-state-card error"><p>${escapeHtml(error.message)}</p></div>`;
    }
  }

  function printCertificateArtwork() {
    const svg = qs('certificateSvgMount')?.querySelector('svg');
    if (!svg) return;
    const printWindow = window.open('', '_blank', 'width=1200,height=850');
    if (!printWindow) {
      window.alert('Please allow pop-ups for this site to print the certificate.');
      return;
    }
    printWindow.opener = null;
    const artwork = new XMLSerializer().serializeToString(svg);
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>NAISFT Certificate</title><style>
      @page{size:A4 landscape;margin:0}
      html,body{width:297mm;height:210mm;margin:0;padding:0;overflow:hidden;background:#fff}
      svg{display:block;width:297mm;height:210mm}
    </style></head><body>${artwork}<script>
      window.addEventListener('load',()=>setTimeout(()=>{window.print();window.close()},500));
    <\/script></body></html>`);
    printWindow.document.close();
  }

  function renderCertificate(certificate) {
    if (certificate.credentialStatus === 'REVOKED') {
      renderError(certificate.revocationReason || 'This certificate has been revoked and is no longer valid.');
      return;
    }
    const token = certificate.verifyToken;
    const certificateNo = certificate.certificateNumber || certificate.verifyToken;
    const student = certificate.student || {};
    const course = certificate.course || {};
    const link = certificate.verifyUrl || verifyUrl(token);
    const downloadLink = certificateDownloadUrl(token);
    if (tokenInput()) tokenInput().value = token;
    const target = resultBox();
    if (!target) return;
    target.style.display = 'block';

    target.innerHTML = `
      <section class="cert-verified-shell">
        <div class="cert-valid-card">
          <i class="fa-solid fa-shield-check"></i>
          <div>
            <span>Official NAISFT verification</span>
            <h2>${escapeHtml(certificate.status || 'Valid Certificate')}</h2>
            <p>This certificate token belongs to the student and course shown below.</p>
          </div>
        </div>

        <article class="cert-document cert-svg-document" id="printableCertificate">
          <div id="certificateSvgMount" class="certificate-svg-mount" aria-label="Official NAISFT certificate">
            <div class="cert-state-card loading"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Preparing certificate artwork...</p></div>
          </div>
        </article>

        <div class="cert-actions">
          <button type="button" id="printCertificateBtn"><i class="fa-solid fa-print"></i> Print / Save PDF</button>
          ${downloadLink ? `<a href="${escapeHtml(downloadLink)}" target="_blank" rel="noopener"><i class="fa-solid fa-download"></i> Download Certificate</a>` : ''}
          <button type="button" id="copyCertificateLinkBtn"><i class="fa-solid fa-link"></i> Copy Verify Link</button>
          <button type="button" id="playCertificateSoundBtn"><i class="fa-solid fa-volume-high"></i> Play Verified Sound</button>
          <button type="button" id="toggleCertificateSoundBtn"><i class="fa-solid ${soundEnabled() ? 'fa-volume-high' : 'fa-volume-xmark'}"></i> Auto sound: ${soundEnabled() ? 'On' : 'Off'}</button>
          <a href="${escapeHtml(link)}"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Verify Link</a>
        </div>
        <p class="cert-link-note">${escapeHtml(link)}</p>
      </section>
    `;

    hydrateCertificateSvg(certificate);

    qs('printCertificateBtn')?.addEventListener('click', printCertificateArtwork);
    qs('copyCertificateLinkBtn')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(link);
        qs('copyCertificateLinkBtn').innerHTML = '<i class="fa-solid fa-check"></i> Link Copied';
      } catch (err) {
        window.prompt('Copy certificate verification link:', link);
      }
    });
    qs('playCertificateSoundBtn')?.addEventListener('click', () => playVerifiedSound(true));
    qs('toggleCertificateSoundBtn')?.addEventListener('click', (event) => {
      const enabled = !soundEnabled();
      localStorage.setItem(soundPreferenceKey, enabled ? 'on' : 'off');
      event.currentTarget.innerHTML = `<i class="fa-solid ${enabled ? 'fa-volume-high' : 'fa-volume-xmark'}"></i> Auto sound: ${enabled ? 'On' : 'Off'}`;
    });
    playVerifiedSound();
  }

  async function fetchCertificate(token) {
    if (!token) {
      renderError('Enter a certificate token or scan a certificate QR code.');
      return;
    }

    renderLoading('Verifying certificate...');
    try {
      if (token.startsWith('DEV-CERT') || token === 'NAISFT-CERT-2026-000001') {
        renderCertificate(demoCertificate(token));
        return;
      }
      const res = await fetch(API + '/certificates/verify/' + encodeURIComponent(token));
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Certificate verification failed.');
      renderCertificate(data.certificate);
    } catch (err) {
      renderError(err.message || 'Could not verify certificate.');
    }
  }

  function handleVerify(event) {
    event.preventDefault();
    const token = tokenInput()?.value.trim();
    if (token) {
      const url = 'certificate-verify.html?token=' + encodeURIComponent(token);
      window.history.replaceState({}, '', url);
    }
    fetchCertificate(token);
  }

  const form = qs('certificateVerifyForm') || qs('verifyForm');
  form?.addEventListener('submit', handleVerify);
  form?.querySelector('button[type="submit"]')?.addEventListener('click', (event) => {
    event.preventDefault();
    handleVerify(event);
  });

  if (tokenFromUrl) fetchCertificate(tokenFromUrl);

  // Manual verification form handler
  const manualForm = qs('manualVerifyForm');
  const manualMsg = qs('manualFormMessage');
  if (manualForm && manualMsg) {
    manualForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!manualForm.checkValidity()) {
        manualForm.reportValidity();
        return;
      }
      const btn = manualForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Submitting…';
      manualMsg.className = 'form-message';
      manualMsg.textContent = '';
      try {
        const fd = new FormData(manualForm);
        const payload = Object.fromEntries(fd.entries());
        const upload = fd.get('certificateUpload');
        payload.uploadedFileName = upload && upload.name ? upload.name : '';
        if (upload && upload.size) {
          const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
          if (!allowed.includes(upload.type)) throw new Error('Upload a JPG, PNG, WEBP or PDF certificate copy.');
          if (upload.size > 6 * 1024 * 1024) throw new Error('Certificate copy must be smaller than 6 MB.');
          const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read the selected certificate copy.')); reader.readAsDataURL(upload); });
          payload.uploadMimeType = upload.type;
          payload.uploadBase64 = dataUrl.split(',')[1] || '';
        }
        delete payload.certificateUpload;
        const res = await fetch(API + '/enquiry/manual-certificate-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const responseData = await res.json().catch(() => ({}));
        if (res.ok) {
          manualMsg.className = 'form-message success';
          manualMsg.textContent = 'Request submitted' + (responseData.requestNumber ? ' (' + responseData.requestNumber + ')' : '') + '. The verification team will contact you within 2–3 working days.';
          manualForm.reset();
        } else {
          throw new Error(responseData.message || 'Server error. Please try again or contact support.');
        }
      } catch (err) {
        manualMsg.className = 'form-message error';
        manualMsg.textContent = err.message || 'Could not submit request. Please email info@naisftindia.com.';
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Submit Verification Request <span>→</span>';
      }
    });
  }

  // FAQ accordion: native <details> works on its own; no JS needed for toggle.
  // This ensures only one FAQ item is open at a time.
  document.querySelectorAll('.faq-list details').forEach(function (detail) {
    detail.addEventListener('toggle', function () {
      if (detail.open) {
        document.querySelectorAll('.faq-list details').forEach(function (other) {
          if (other !== detail) other.open = false;
        });
      }
    });
  });
})();
