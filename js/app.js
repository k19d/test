(function(){
  const { auth, productsQueryByCategory, createOrder } = window._fb;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in-on-view').forEach(el => io.observe(el));

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) header?.classList.add('header-shadow'); else header?.classList.remove('header-shadow');
  });

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const checkoutModal = document.getElementById('checkout-modal');
  const paymentForm = document.getElementById('payment-form');
  const checkoutProductEl = document.getElementById('checkout-product');
  const methodSelect = document.getElementById('payment-method');
  const transferNumberEl = document.getElementById('transfer-number');
  const senderNumberInput = document.getElementById('sender-number');
  const contactNumberInput = document.getElementById('contact-number');
  const amountInput = document.getElementById('amount');
  const paymentStatus = document.getElementById('payment-status');

  const transferNumbersByMethod = {
    vodafone_cash: '01200651813',
    instapay: 'insta@your-handle',
    binance: 'BINANCE_UID_XXXX'
  };

  function openModal(el){ el.classList.remove('hidden'); el.setAttribute('aria-hidden','false'); }
  function closeModal(el){ el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); }

  methodSelect?.addEventListener('change', () => {
    transferNumberEl.textContent = transferNumbersByMethod[methodSelect.value] || '—';
  });

  let selectedProduct = null;

  function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <div class="card-body">
        <div class="card-title">${product.name}</div>
        <div class="card-price">${product.price} <span class="muted">EGP</span></div>
        <button class="btn btn-primary">شراء</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => {
      selectedProduct = product;
      checkoutProductEl.innerHTML = `<div class="row"><strong>${product.name}</strong><span class="muted">${product.price} EGP</span></div>`;
      methodSelect.value = 'vodafone_cash';
      transferNumberEl.textContent = transferNumbersByMethod['vodafone_cash'];
      senderNumberInput.value = '';
      contactNumberInput.value = '';
      amountInput.value = product.price;
      paymentStatus.textContent = '';
      openModal(checkoutModal);
    });
    return card;
  }

  function mountProducts(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    productsQueryByCategory(category).onSnapshot((snap) => {
      container.innerHTML = '';
      snap.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        container.appendChild(renderProductCard(data));
      })
    });
  }

  mountProducts('android', 'grid-android');
  mountProducts('pc', 'grid-pc');
  mountProducts('ios', 'grid-ios');

  document.querySelectorAll('#checkout-modal [data-close]')?.forEach(b => b.addEventListener('click', () => closeModal(checkoutModal)));

  let submitting = false;

  paymentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    paymentStatus.textContent = '...';

    try {
      const user = auth.currentUser;
      if (!user) { paymentStatus.textContent = 'يرجى تسجيل الدخول أولاً.'; submitting = false; return; }
      if (!selectedProduct) { paymentStatus.textContent = 'لا يوجد منتج محدد.'; submitting = false; return; }

      const method = methodSelect.value;
      const senderNumber = senderNumberInput.value.trim();
      const contactNumber = contactNumberInput.value.trim();
      const amount = amountInput.value;

      await createOrder({
        userId: user.uid,
        product: selectedProduct,
        method, senderNumber, contactNumber, amount
      });

      paymentStatus.textContent = 'تم إرسال بيانات الدفع بنجاح. سيتم التواصل معك قريبًا.';
      setTimeout(() => closeModal(checkoutModal), 800);
    } catch (e){
      paymentStatus.textContent = e.message || 'تعذر إرسال الطلب';
    } finally {
      setTimeout(()=>{ submitting = false; }, 600);
    }
  });
})();