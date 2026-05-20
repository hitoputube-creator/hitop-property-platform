(() => {
  const ADMIN_AUTH_KEY = 'hitop_admin_authenticated';
  const ADMIN_PASSWORD = 'hitop2025';

  const setupAdminPage = () => {
    const loginForm = document.getElementById('adminLoginForm');
    const loginWrap = document.getElementById('adminAuthWrap');
    const loginMessage = document.getElementById('adminLoginMessage');
    const panel = document.getElementById('adminPanel');
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const form = document.getElementById('adminForm');
    const listEl = document.getElementById('adminListings');
    if (!loginForm || !loginWrap || !panel || !form || !listEl || !window.HitopData) return;

    const setAuthView = (authed) => {
      loginWrap.classList.toggle('hidden', authed);
      panel.classList.toggle('hidden', !authed);
    };

    const render = () => {
      const listings = window.HitopData.readListings();
      listEl.innerHTML = listings.map((item) => `
      <article class="admin-item">
        <strong>${item.title}</strong>
        <p>${item.propertyType} / ${item.dealType} · ${item.address}</p>
        <p>${window.HitopData.formatPrice(item.price)}만원 · ${item.area}㎡</p>
        <div class="admin-item-actions">
          <button class="btn btn-outline" data-action="edit" data-id="${item.id}" type="button">수정</button>
          <button class="btn btn-primary" data-action="delete" data-id="${item.id}" type="button">삭제</button>
        </div>
      </article>`).join('');
    };

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = new FormData(loginForm).get('password');
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        loginForm.reset();
        loginMessage.classList.add('hidden');
        setAuthView(true);
        render();
        return;
      }
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      loginMessage.classList.remove('hidden');
    });

    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      setAuthView(false);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') return;
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.price = Number(payload.price);
      payload.area = Number(payload.area);
      let listings = window.HitopData.readListings();
      if (payload.id) listings = listings.map((item) => (item.id === payload.id ? payload : item));
      else {
        payload.id = `id_${Date.now()}`;
        listings.unshift(payload);
      }
      window.HitopData.writeListings(listings);
      form.reset();
      form.id.value = '';
      render();
    });

    listEl.addEventListener('click', (e) => {
      if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') return;
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const { action, id } = btn.dataset;
      const listings = window.HitopData.readListings();
      const target = listings.find((item) => item.id === id);
      if (!target) return;
      if (action === 'delete') {
        window.HitopData.writeListings(listings.filter((item) => item.id !== id));
        render();
      }
      if (action === 'edit') {
        Object.entries(target).forEach(([key, value]) => {
          if (form[key]) form[key].value = value;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    const isAuthed = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    setAuthView(isAuthed);
    if (isAuthed) render();
  };

  document.addEventListener('DOMContentLoaded', setupAdminPage);
})();
