const STORAGE_KEY = 'hitop_listings_v1';

const sampleListings = [
  { id: 's1', propertyType: '공장창고', dealType: '매매', address: '파주시 탄현면', price: 125000, area: 860, title: '대형 물류창고', description: 'IC 접근성 우수, 층고 높음', imageUrl: 'https://picsum.photos/seed/factory/640/360' },
  { id: 's2', propertyType: '상가', dealType: '월세', address: '고양시 일산동구', price: 250, area: 82, title: '대로변 1층 상가', description: '유동인구 풍부, 주차 가능', imageUrl: 'https://picsum.photos/seed/store/640/360' },
  { id: 's3', propertyType: '오피스텔', dealType: '전세', address: '운정신도시', price: 23000, area: 49, title: '신축 오피스텔', description: '역세권, 풀옵션', imageUrl: 'https://picsum.photos/seed/officetel/640/360' },
];

const readListings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings));
    return [...sampleListings];
  }
  try { return JSON.parse(raw); } catch { return [...sampleListings]; }
};

const writeListings = (listings) => localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
const formatPrice = (n) => Number(n).toLocaleString('ko-KR');

const setupMobileNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
};

const setupListingsPage = () => {
  const cardsEl = document.getElementById('listingCards');
  const detailEl = document.getElementById('listingDetail');
  const filterForm = document.getElementById('filterForm');
  if (!cardsEl || !filterForm) return;

  let current = readListings();

  const render = (items) => {
    cardsEl.innerHTML = items.map((item) => `
      <article class="listing-card" data-id="${item.id}">
        <h3>${item.title}</h3>
        <div class="listing-meta">
          <span>${item.propertyType}</span>
          <span>${item.dealType}</span>
          <span>${item.address}</span>
          <span>${formatPrice(item.price)}만원</span>
          <span>${item.area}㎡</span>
        </div>
      </article>
    `).join('');

    cardsEl.querySelectorAll('.listing-card').forEach((card) => {
      card.addEventListener('click', () => {
        const selected = current.find((x) => x.id === card.dataset.id);
        if (!selected) return;
        detailEl.classList.remove('hidden');
        detailEl.innerHTML = `
          <h3>${selected.title}</h3>
          <p><strong>${selected.propertyType} / ${selected.dealType}</strong></p>
          <p>주소: ${selected.address}</p>
          <p>금액: ${formatPrice(selected.price)}만원 | 면적: ${selected.area}㎡</p>
          <p>${selected.description}</p>
          <img src="${selected.imageUrl}" alt="${selected.title}" style="width:100%;max-width:480px;border-radius:10px;" />
        `;
      });
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const formData = new FormData(filterForm);
    const criteria = Object.fromEntries(formData.entries());
    current = readListings().filter((item) => {
      if (criteria.dealType && item.dealType !== criteria.dealType) return false;
      if (criteria.propertyType && item.propertyType !== criteria.propertyType) return false;
      if (criteria.region && !item.address.includes(criteria.region)) return false;
      if (criteria.maxPrice && Number(item.price) > Number(criteria.maxPrice)) return false;
      if (criteria.minArea && Number(item.area) < Number(criteria.minArea)) return false;
      return true;
    });
    render(current);
  };

  filterForm.addEventListener('submit', applyFilters);
  document.querySelectorAll('[data-category]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      filterForm.propertyType.value = link.dataset.category;
      filterForm.requestSubmit();
    });
  });

  render(current);
};

const setupAdminPage = () => {
  const form = document.getElementById('adminForm');
  const listEl = document.getElementById('adminListings');
  if (!form || !listEl) return;

  const render = () => {
    const listings = readListings();
    listEl.innerHTML = listings.map((item) => `
      <article class="admin-item">
        <strong>${item.title}</strong>
        <p>${item.propertyType} / ${item.dealType} · ${item.address}</p>
        <p>${formatPrice(item.price)}만원 · ${item.area}㎡</p>
        <div class="admin-item-actions">
          <button class="btn btn-outline" data-action="edit" data-id="${item.id}" type="button">수정</button>
          <button class="btn btn-primary" data-action="delete" data-id="${item.id}" type="button">삭제</button>
        </div>
      </article>
    `).join('');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.price = Number(payload.price);
    payload.area = Number(payload.area);
    let listings = readListings();

    if (payload.id) {
      listings = listings.map((item) => (item.id === payload.id ? payload : item));
    } else {
      payload.id = `id_${Date.now()}`;
      listings.unshift(payload);
    }

    writeListings(listings);
    form.reset();
    form.id.value = '';
    render();
  });

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const listings = readListings();
    const target = listings.find((item) => item.id === id);
    if (!target) return;

    if (action === 'delete') {
      writeListings(listings.filter((item) => item.id !== id));
      render();
    }

    if (action === 'edit') {
      Object.entries(target).forEach(([key, value]) => {
        if (form[key]) form[key].value = value;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  render();
};

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupListingsPage();
  setupAdminPage();
});
