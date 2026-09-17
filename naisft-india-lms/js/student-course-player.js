(function () {
  const API = ['localhost','127.0.0.1'].includes(location.hostname) ? 'http://localhost:5000/api' : `${location.origin}/api`;
  const token = localStorage.getItem('naisft_token');
  const params = new URLSearchParams(window.location.search);
  const courseId = Number(params.get('courseId') || params.get('id') || 0);
  const initialLessonId = Number(params.get('lessonId') || 0);
  const isDevMode = Boolean(window.NAISFT_STUDENT_PLAYER_DEV);
  let courseData = null;
  let selectedLessonId = null;

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showAlert(message, type) {
    const alert = qs('playerAlert');
    if (!alert) return;
    alert.textContent = message || '';
    alert.className = 'dash-alert';
    if (message) alert.classList.add('active', type || 'error');
  }

  function statusClass(value) {
    return String(value || 'Pending').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function setLoading(isLoading) {
    if (qs('playerLoading')) qs('playerLoading').hidden = !isLoading;
    if (qs('playerContent')) qs('playerContent').hidden = isLoading;
  }

  function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  async function fetchJson(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res;
    let data;

    try {
      res = await fetch(url, { ...(options || {}), signal: controller.signal });
      data = await res.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('The server is taking too long to respond. Please try again, or open demo mode for local testing.');
      }
      throw new Error('Could not connect to the server. Please check the API deployment and try again.');
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 401) {
      if (!isDevMode) window.location.href = 'student-login.html';
      return null;
    }
    if (!res.ok || data.success === false) throw new Error(data.message || 'Request failed.');
    return data;
  }

  function devPayload() {
    return {
      course: {
        id: 1,
        name: 'Diploma in Industrial Safety',
        modules: [{
          id: 101,
          title: 'Safety Fundamentals',
          lessons: [
            { id: 201, title: 'Introduction to Workplace Safety', lessonType: 'Video', contentUrl: '', contentText: 'Understand the basic responsibilities of workers, supervisors and safety officers inside an industrial workplace.', materials: [{ title: 'Safety checklist PDF', fileUrl: '#', materialType: 'PDF' }], progress: [{ status: 'Completed', progressPercent: 100 }] },
            { id: 202, title: 'Hazard Identification Basics', lessonType: 'Text', contentUrl: '', contentText: 'Learn to identify unsafe acts, unsafe conditions and common workplace hazards before they create incidents.', materials: [], progress: [] },
          ],
          liveClasses: [],
          assignments: [],
        }],
        liveClasses: [{ title: 'Weekly Safety Doubt Class', platform: 'Google Meet', startsAt: '2026-07-04T10:00:00.000Z', endsAt: '2026-07-04T11:00:00.000Z', joinUrl: 'https://meet.google.com/demo-class', recordingUrl: 'https://example.com/demo-recording', description: 'Bring your PPE checklist and incident observation doubts.', teacherName: 'NAISFT Faculty', status: 'Scheduled' }],
        assignments: [{ id: 301, title: 'Safety Observation Report', instructions: 'Submit a short workplace safety observation note.', attachmentUrl: 'https://example.com/safety-observation-brief.pdf', dueAt: '2026-07-10T18:00:00.000Z', submissions: [] }],
      },
      progress: { totalLessons: 2, completedLessons: 1, progressPercent: 50 },
    };
  }

  function allLessons() {
    return (courseData.course.modules || []).flatMap((module) =>
      (module.lessons || []).map((lesson) => ({ ...lesson, moduleTitle: module.title }))
    );
  }

  function originalLesson(lessonId) {
    for (const module of (courseData.course.modules || [])) {
      const lesson = (module.lessons || []).find((item) => Number(item.id) === Number(lessonId));
      if (lesson) return lesson;
    }
    return null;
  }

  function updateProgressUi() {
    const lessons = allLessons();
    const completed = lessons.filter((lesson) => lesson.progress && lesson.progress[0] && lesson.progress[0].status === 'Completed').length;
    const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
    courseData.progress = { totalLessons: lessons.length, completedLessons: completed, progressPercent: percent };
    qs('playerProgressPercent').textContent = percent + '%';
    qs('playerProgressBar').style.width = percent + '%';
  }

  function completionBanner() {
    const progress = courseData && courseData.progress ? courseData.progress : {};
    if (Number(progress.progressPercent || 0) < 100) return '';
    return `
      <div class="course-player-complete-banner">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <strong>Course learning completed</strong>
          <span>Your lesson progress is 100%. The center will review assignments and payment status before issuing the certificate.</span>
        </div>
      </div>
    `;
  }

  function selectLesson(lessonId) {
    selectedLessonId = lessonId;
    const lesson = allLessons().find((item) => Number(item.id) === Number(lessonId)) || allLessons()[0];
    if (!lesson) return;
    selectedLessonId = lesson.id;
    const progress = lesson.progress && lesson.progress[0];
    const isComplete = progress && progress.status === 'Completed';
    const materialCount = (lesson.materials || []).length;

    qs('playerLesson').innerHTML = `
      ${completionBanner()}
      <div class="course-player-lesson-top">
        <div>
          <span>${escapeHtml(lesson.moduleTitle || 'Course lesson')}</span>
          <h2>${escapeHtml(lesson.title)}</h2>
          <div class="course-player-meta">
            <b><i class="fa-solid fa-book-open"></i> ${escapeHtml(lesson.lessonType || 'Lesson')}</b>
            <b><i class="fa-solid fa-paperclip"></i> ${materialCount} material${materialCount === 1 ? '' : 's'}</b>
            <b class="${isComplete ? 'is-complete' : ''}"><i class="fa-solid ${isComplete ? 'fa-circle-check' : 'fa-circle-play'}"></i> ${isComplete ? 'Completed' : 'In progress'}</b>
          </div>
        </div>
        <button class="course-player-complete ${isComplete ? 'completed' : ''}" type="button" id="markLessonComplete" ${isComplete ? 'disabled' : ''}>
          <i class="fa-solid ${isComplete ? 'fa-circle-check' : 'fa-check'}"></i> ${isComplete ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
      <div class="course-player-copy">
        <p>${escapeHtml(lesson.contentText || 'Lesson content will appear here once uploaded by admin.')}</p>
      </div>
      <div class="course-player-resource-head">
        <strong>Lesson Resources</strong>
        ${lesson.contentUrl ? `<a class="course-player-primary" href="${escapeHtml(lesson.contentUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open lesson</a>` : ''}
      </div>
      <div class="course-player-materials">
        ${(lesson.materials || []).map((material) => `<a href="${escapeHtml(material.fileUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-file-arrow-down"></i><span>${escapeHtml(material.title)}</span><small>${escapeHtml(material.materialType || 'File')}</small></a>`).join('') || '<em>No materials added yet.</em>'}
      </div>
    `;

    qs('markLessonComplete')?.addEventListener('click', markSelectedLessonComplete);
    renderModules();
  }

  function renderModules() {
    const modules = courseData.course.modules || [];
    qs('playerModuleList').innerHTML = modules.map((module, moduleIndex) => `
      <article>
        <strong><span>${String(moduleIndex + 1).padStart(2, '0')}</span>${escapeHtml(module.title)}</strong>
        ${(module.lessons || []).map((lesson, lessonIndex) => {
          const progress = lesson.progress && lesson.progress[0];
          const complete = progress && progress.status === 'Completed';
          return `<button class="${Number(lesson.id) === Number(selectedLessonId) ? 'active' : ''} ${complete ? 'complete' : ''}" type="button" data-lesson-id="${lesson.id}">
            <i>${lessonIndex + 1}</i>
            <span>${escapeHtml(lesson.title)}</span>
            <small>${complete ? 'Done' : 'Start'}</small>
          </button>`;
        }).join('') || '<span>No lessons yet.</span>'}
      </article>
    `).join('') || '<div class="sd-empty">No modules available yet.</div>';

    document.querySelectorAll('[data-lesson-id]').forEach((button) => {
      button.addEventListener('click', () => selectLesson(Number(button.dataset.lessonId)));
    });
  }

  function renderLiveClasses() {
    const liveClasses = [
      ...(courseData.course.liveClasses || []),
      ...(courseData.course.modules || []).flatMap((module) => module.liveClasses || []),
    ];
    if (qs('liveClassCount')) qs('liveClassCount').textContent = liveClasses.length + ' scheduled';
    qs('playerLiveClasses').innerHTML = liveClasses.map((item) => `
      <article>
        <i class="fa-solid fa-video"></i>
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.platform || 'Live Class')} / ${escapeHtml(item.teacherName || 'Faculty')}</span>
          <small>${escapeHtml(formatDate(item.startsAt))}${item.endsAt ? ' - ' + escapeHtml(formatDate(item.endsAt)) : ''}</small>
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        </div>
        <div class="course-player-live-actions">
          <em class="${escapeHtml(statusClass(item.status || 'Scheduled'))}">${escapeHtml(item.status || 'Scheduled')}</em>
          ${item.joinUrl ? `<a href="${escapeHtml(item.joinUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Join</a>` : ''}
          ${item.recordingUrl ? `<a href="${escapeHtml(item.recordingUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-circle-play"></i> Recording</a>` : ''}
        </div>
      </article>
    `).join('') || '<div class="sd-empty">No live classes scheduled yet.</div>';
  }

  function renderAssignments() {
    const assignments = [
      ...(courseData.course.assignments || []),
      ...(courseData.course.modules || []).flatMap((module) => module.assignments || []),
    ];
    if (qs('assignmentCount')) qs('assignmentCount').textContent = assignments.length + ' active';
    qs('playerAssignments').innerHTML = assignments.map((item) => {
      const submission = item.submissions && item.submissions[0];
      return `
        <article class="course-player-assignment">
          <i class="fa-solid fa-clipboard-check"></i>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.instructions || 'Assignment instructions will appear here.')}</span>
            <small>Due: ${escapeHtml(formatDate(item.dueAt))}</small>
            ${item.attachmentUrl ? `<a class="course-player-assignment-attachment" href="${escapeHtml(item.attachmentUrl)}" target="_blank" rel="noopener"><i class="fa-solid fa-paperclip"></i> Open assignment brief</a>` : ''}
          </div>
          <em class="${escapeHtml(statusClass(submission ? submission.status : 'Not submitted'))}">${escapeHtml(submission ? submission.status : 'Not submitted')}</em>
          <form data-assignment-submit="${item.id}">
            <textarea name="submissionText" placeholder="Write your answer or note">${escapeHtml(submission ? (submission.submissionText || '') : '')}</textarea>
            <input name="fileUrl" placeholder="Optional file/link URL" value="${escapeHtml(submission ? (submission.fileUrl || '') : '')}">
            <button type="submit"><i class="fa-solid fa-paper-plane"></i> ${submission ? 'Resubmit' : 'Submit'}</button>
          </form>
          ${submission ? `
            <div class="course-player-submission-state">
              <span><i class="fa-solid fa-clock-rotate-left"></i> Submitted ${escapeHtml(formatDate(submission.submittedAt))}</span>
              ${submission.marks !== null && submission.marks !== undefined ? `<span><i class="fa-solid fa-star"></i> Marks: ${escapeHtml(submission.marks)}</span>` : ''}
              ${submission.feedback ? `<p><strong>Faculty feedback:</strong> ${escapeHtml(submission.feedback)}</p>` : ''}
            </div>
          ` : ''}
        </article>
      `;
    }).join('') || '<div class="sd-empty">No assignments yet.</div>';

    document.querySelectorAll('[data-assignment-submit]').forEach((form) => {
      form.addEventListener('submit', submitAssignment);
    });
  }

  function renderLoadFailure(message) {
    setLoading(false);
    showAlert(message || 'Could not load course content.');
    const isLocked = /access|active|enrollment|payment/i.test(message || '');
    const courseName = qs('playerCourseName');
    if (courseName) courseName.textContent = isLocked ? 'Course locked' : 'Course unavailable';
    const content = qs('playerContent');
    if (!content) return;
    content.hidden = false;
    content.innerHTML = `
      <article class="course-player-empty ${isLocked ? 'locked' : ''}">
        <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-triangle-exclamation'}"></i>
        <h2>${isLocked ? 'Learning access is not active yet' : 'Course content could not load'}</h2>
        <p>${escapeHtml(isLocked ? 'This course is linked to your account, but the learning area opens only after payment confirmation and admin activation.' : (message || 'Please try again after checking the student login, API deployment and database migration.'))}</p>
        <div class="course-player-actions">
          <a href="student-login.html"><i class="fa-solid fa-right-to-bracket"></i> Student login</a>
          <a href="student-dashboard.html"><i class="fa-solid fa-table-columns"></i> Dashboard</a>
          <a href="course-checkout.html${courseId ? '?courseId=' + encodeURIComponent(courseId) : ''}"><i class="fa-solid fa-credit-card"></i> Complete payment</a>
          ${isDevMode ? '<a href="student-course-player.html?dev=1"><i class="fa-solid fa-flask"></i> Open demo mode</a>' : ''}
        </div>
      </article>
    `;
  }

  function renderPage() {
    qs('playerCourseName').textContent = courseData.course.name;
    qs('playerProgressPercent').textContent = courseData.progress.progressPercent + '%';
    qs('playerProgressBar').style.width = courseData.progress.progressPercent + '%';
    renderModules();
    selectLesson(selectedLessonId || (allLessons()[0] && allLessons()[0].id));
    renderLiveClasses();
    renderAssignments();
    setLoading(false);
  }

  async function markSelectedLessonComplete() {
    if (!selectedLessonId) return;
    try {
      if (!isDevMode) {
        await fetchJson(API + '/student/lessons/' + selectedLessonId + '/progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ status: 'Completed', progressPercent: 100 }),
        });
      }
      const lesson = originalLesson(selectedLessonId);
      if (lesson) lesson.progress = [{ status: 'Completed', progressPercent: 100 }];
      updateProgressUi();
      selectLesson(selectedLessonId);
      showAlert(courseData.progress.progressPercent >= 100 ? 'Course learning completed. Certificate will appear after center review.' : 'Lesson marked complete.', 'success');
    } catch (err) {
      showAlert(err.message || 'Could not update progress.');
    }
  }

  function findAssignment(assignmentId) {
    const assignments = [
      ...(courseData.course.assignments || []),
      ...(courseData.course.modules || []).flatMap((module) => module.assignments || []),
    ];
    return assignments.find((item) => Number(item.id) === Number(assignmentId));
  }

  async function submitAssignment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const assignmentId = Number(form.dataset.assignmentSubmit || 0);
    const submissionText = form.elements.submissionText.value.trim();
    const fileUrl = form.elements.fileUrl.value.trim();
    if (!submissionText && !fileUrl) {
      showAlert('Add an answer or file/link URL before submitting.');
      return;
    }

    const button = form.querySelector('button');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';

    try {
      let submission = { status: 'Submitted', submissionText, fileUrl, submittedAt: new Date().toISOString() };
      if (!isDevMode) {
        const data = await fetchJson(API + '/student/assignments/' + assignmentId + '/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ submissionText, fileUrl }),
        });
        submission = data.submission || submission;
      }
      const assignment = findAssignment(assignmentId);
      if (assignment) assignment.submissions = [submission];
      renderAssignments();
      showAlert('Assignment submitted for review.', 'success');
    } catch (err) {
      showAlert(err.message || 'Could not submit assignment.');
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }

  async function loadPage() {
    if (!token && !isDevMode) {
      window.location.href = 'student-login.html';
      return;
    }
    if (!courseId && !isDevMode) {
      showAlert('Course is missing. Please open this page from your dashboard.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      courseData = isDevMode
        ? devPayload()
        : await fetchJson(API + '/student/courses/' + courseId + '/lms', {
          headers: { Authorization: 'Bearer ' + token },
        });
      if (!courseData) return;
      if (initialLessonId) selectedLessonId = initialLessonId;
      renderPage();
    } catch (err) {
      renderLoadFailure(err.message || 'Could not load course content.');
    }
  }

  loadPage();
})();
