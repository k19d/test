(function(){
  const { auth, onAuth, signInWithGooglePopup, signUpWithEmail, signInWithEmail, resetPassword, signOut } = window._fb;

  const authModal = document.getElementById('auth-modal');
  const btnOpenAuth = document.getElementById('btn-open-auth');
  const btnGoogle = document.getElementById('btn-google');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const btnEmailLogin = document.getElementById('btn-email-login');
  const btnEmailSignup = document.getElementById('btn-email-signup');
  const btnReset = document.getElementById('btn-reset');
  const authStatus = document.getElementById('auth-status');

  const userInfo = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const btnLogout = document.getElementById('btn-logout');

  function openModal(el){ el.classList.remove('hidden'); el.setAttribute('aria-hidden','false'); }
  function closeModal(el){ el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); }

  document.querySelectorAll('[data-close]')?.forEach(b => b.addEventListener('click', () => {
    const m = b.closest('.modal'); if (m) closeModal(m);
  }));

  btnOpenAuth?.addEventListener('click', () => openModal(authModal));

  let busy = false; function withBusy(fn){
    return async (...args) => { if (busy) return; busy = true; try { await fn(...args); } finally { setTimeout(()=>busy=false, 500); } };
  }

  btnGoogle?.addEventListener('click', withBusy(async () => {
    authStatus.textContent = '...';
    try { await signInWithGooglePopup(); closeModal(authModal); }
    catch (e){ authStatus.textContent = e.message || 'خطأ في تسجيل الدخول'; }
  }));

  btnEmailSignup?.addEventListener('click', withBusy(async () => {
    authStatus.textContent = '...';
    try {
      const email = emailInput.value.trim();
      const password = passInput.value;
      await signUpWithEmail(email, password);
      authStatus.textContent = 'تم إنشاء الحساب. تم إرسال رسالة تأكيد للبريد.';
    } catch (e){ authStatus.textContent = e.message || 'تعذر إنشاء الحساب'; }
  }));

  btnEmailLogin?.addEventListener('click', withBusy(async () => {
    authStatus.textContent = '...';
    try {
      const email = emailInput.value.trim();
      const password = passInput.value;
      const user = await signInWithEmail(email, password);
      if (user && user.emailVerified === false) {
        authStatus.textContent = 'يرجى تأكيد البريد الإلكتروني.';
      } else {
        closeModal(authModal);
      }
    } catch (e){ authStatus.textContent = e.message || 'تعذر تسجيل الدخول'; }
  }));

  btnReset?.addEventListener('click', withBusy(async () => {
    try {
      const email = emailInput.value.trim();
      await resetPassword(email);
      authStatus.textContent = 'تم إرسال رابط الاستعادة إلى بريدك.';
    } catch (e){ authStatus.textContent = e.message || 'تعذر إرسال رابط الاستعادة'; }
  }));

  btnLogout?.addEventListener('click', withBusy(async () => { await signOut(); }));

  onAuth(async (user) => {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    if (user) {
      userInfo?.classList.remove('hidden');
      btnOpenAuth?.classList.add('hidden');
      if (userAvatar) userAvatar.src = user.photoURL || '';
      if (userName) userName.textContent = user.displayName || (user.email ?? '');
    } else {
      userInfo?.classList.add('hidden');
      btnOpenAuth?.classList.remove('hidden');
    }
  });
})();