(function(){
  const { auth, onAuth, requireAdmin, addProduct, db } = window._fb;

  const loginSection = document.getElementById('admin-login');
  const appSection = document.getElementById('admin-app');

  const loginForm = document.getElementById('admin-login-form');
  const adminEmail = document.getElementById('admin-email');
  const adminPassword = document.getElementById('admin-password');
  const loginStatus = document.getElementById('admin-login-status');

  const productForm = document.getElementById('product-form');
  const nameInput = document.getElementById('product-name');
  const priceInput = document.getElementById('product-price');
  const imageInput = document.getElementById('product-image');
  const categorySelect = document.getElementById('product-category');
  const productStatus = document.getElementById('product-status');

  const ordersTableBody = document.querySelector('#orders-table tbody');

  function showAdminApp() { loginSection.classList.add('hidden'); appSection.classList.remove('hidden'); }
  function showLogin() { appSection.classList.add('hidden'); loginSection.classList.remove('hidden'); }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginStatus.textContent = '...';
    try {
      await auth.signInWithEmailAndPassword(adminEmail.value.trim(), adminPassword.value);
    } catch (e) {
      loginStatus.textContent = e.message || 'فشل تسجيل الدخول';
    }
  });

  onAuth(async (user) => {
    if (!user) { showLogin(); return; }
    try {
      await requireAdmin(user);
      showAdminApp();
    } catch {
      showLogin();
      loginStatus.textContent = 'غير مصرح: هذا الحساب ليس أدمن.';
    }
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    productStatus.textContent = '...';
    try {
      await addProduct({
        name: nameInput.value.trim(),
        price: priceInput.value,
        imageUrl: imageInput.value.trim(),
        category: categorySelect.value
      });
      productStatus.textContent = 'تم حفظ المنتج وظهر في الواجهة.';
      productForm.reset();
    } catch (e) {
      productStatus.textContent = e.message || 'تعذر حفظ المنتج';
    }
  });

  db.collection('orders').orderBy('createdAt', 'desc').onSnapshot((snap) => {
    ordersTableBody.innerHTML = '';
    snap.forEach(doc => {
      const o = { id: doc.id, ...doc.data() };
      const tr = document.createElement('tr');
      const created = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : '—';
      tr.innerHTML = `
        <td>${created}</td>
        <td>${o.userId || '—'}</td>
        <td>${o.productName || '—'}</td>
        <td>${o.method || '—'}</td>
        <td>${o.senderNumber || '—'}</td>
        <td>${o.contactNumber || '—'}</td>
        <td>${o.amount ?? '—'}</td>
        <td>${o.status || 'pending'}</td>
      `;
      ordersTableBody.appendChild(tr);
    });
  });
})();