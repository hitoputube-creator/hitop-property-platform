console.log('app.js 로드됨!');
const STORAGE_KEY = 'hitop_listings_v1';

// ─────────────────────────────────────────────
// 매물 종류별 필드 정의
// ─────────────────────────────────────────────
const PROPERTY_FIELDS = {
  '공장창고': {
    dealTypes: ['매매','임대'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '임대': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true},{key:'managementFee',label:'관리비'}]
    },
    infoFields: [
      {key:'landArea',label:'대지면적',suffix:'㎡'},{key:'buildingArea',label:'건축면적',suffix:'㎡'},
      {key:'totalArea',label:'연면적',suffix:'㎡'},{key:'floor',label:'층정보'},
      {key:'direction',label:'방향'},{key:'mainUse',label:'주용도'},
      {key:'office',label:'사무실/화장실'},{key:'parking',label:'주차'},
      {key:'elevator',label:'엘리베이터'},{key:'approvalDate',label:'사용승인일'}
    ]
  },
  '상가': {
    dealTypes: ['매매','임대'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '임대': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true},{key:'managementFee',label:'관리비'}]
    },
    infoFields: [
      {key:'contractArea',label:'계약면적',suffix:'㎡'},{key:'exclusiveArea',label:'전용면적',suffix:'㎡'},
      {key:'floor',label:'해당층/총층'},{key:'moveInDate',label:'입주가능일'},
      {key:'direction',label:'방향'},{key:'currentBusiness',label:'현재업종'},
      {key:'recommendBusiness',label:'추천업종'},{key:'parking',label:'주차'},
      {key:'heating',label:'난방'},{key:'buildingUse',label:'건축물용도'},
      {key:'approvalDate',label:'사용승인일'}
    ]
  },
  '오피스텔': {
    dealTypes: ['매매','전세','월세'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '전세': [{key:'deposit',label:'보증금',money:true}],
      '월세': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true},{key:'managementFee',label:'관리비'}]
    },
    infoFields: [
      {key:'contractArea',label:'계약면적',suffix:'㎡'},{key:'exclusiveArea',label:'전용면적',suffix:'㎡'},
      {key:'floor',label:'해당층/총층'},{key:'rooms',label:'방수/욕실수'},
      {key:'direction',label:'방향'},{key:'managementFee',label:'관리비'},
      {key:'heating',label:'난방'},{key:'moveInDate',label:'입주가능일'},
      {key:'parking',label:'주차'},{key:'buildingUse',label:'건축물용도'}
    ]
  },
  '토지': {
    dealTypes: ['매매','임대'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '임대': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true}]
    },
    infoFields: [
      {key:'landArea',label:'대지면적',suffix:'㎡'},{key:'zoningArea',label:'용도지역'},
      {key:'currentUse',label:'현재용도'},{key:'recommendedUse',label:'추천용도'},
      {key:'landUse',label:'국토이용'},{key:'urbanPlanning',label:'도시계획'},
      {key:'buildingPermit',label:'건축허가'},{key:'landTransactionPermit',label:'토지거래허가'},
      {key:'accessRoad',label:'진입도로'}
    ]
  },
  '힐스테이트더운정': {
    dealTypes: ['매매','전세','월세'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '전세': [{key:'deposit',label:'보증금',money:true}],
      '월세': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true},{key:'managementFee',label:'관리비'}]
    },
    infoFields: [
      {key:'subType',label:'구분(아파트/오피스텔)'},{key:'contractArea',label:'계약면적',suffix:'㎡'},
      {key:'exclusiveArea',label:'전용면적',suffix:'㎡'},{key:'floor',label:'해당층/총층'},
      {key:'rooms',label:'방수/욕실수'},{key:'direction',label:'방향'},
      {key:'managementFee',label:'관리비'},{key:'heating',label:'난방'},
      {key:'moveInDate',label:'입주가능일'},{key:'parking',label:'주차'}
    ]
  },
  '단독주택': {
    dealTypes: ['매매','전세','월세'],
    priceConfig: {
      '매매': [{key:'salePrice',label:'매매가',money:true}],
      '전세': [{key:'deposit',label:'보증금',money:true}],
      '월세': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true}]
    },
    infoFields: [
      {key:'landArea',label:'대지면적',suffix:'㎡'},{key:'buildingArea',label:'건축면적',suffix:'㎡'},
      {key:'floor',label:'층수'},{key:'rooms',label:'방수/욕실수'},
      {key:'parking',label:'주차'},{key:'heating',label:'난방'},
      {key:'buildYear',label:'준공년도'},{key:'moveInDate',label:'입주가능일'}
    ]
  }
};

// ─────────────────────────────────────────────
// 샘플 데이터
// ─────────────────────────────────────────────
const sampleListings = [
  {
    id:'s1', propertyType:'공장창고', dealType:'임대',
    address:'파주시 탄현면', displayAddress:'파주시 탄현면',
    deposit:5000, monthlyRent:300, managementFee:'없음',
    landArea:860, buildingArea:500, totalArea:500, area:860,
    floor:'지상 1층 / 총 1층', direction:'남향', mainUse:'창고시설',
    office:'1개/1개', parking:'가능 (5대)', elevator:'없음', approvalDate:'2010-03-15',
    title:'대형 물류창고', description:'IC 접근성 우수, 층고 높음.\n자유로 IC 5분 거리.\n대형 트럭 진출입 가능.',
    imageUrls:['https://picsum.photos/seed/factory1/800/500','https://picsum.photos/seed/factory2/800/500','https://picsum.photos/seed/factory3/800/500'],
    listingNo:'F-0001', createdAt:'2026-05-01T09:00:00.000Z'
  },
  {
    id:'s2', propertyType:'상가', dealType:'임대',
    address:'고양시 일산동구', displayAddress:'고양시 일산동구',
    deposit:1000, monthlyRent:250, managementFee:'10만원',
    contractArea:90, exclusiveArea:82, area:82,
    floor:'1층/5층', moveInDate:'즉시입주', direction:'남향',
    currentBusiness:'-', recommendBusiness:'음식점, 카페',
    parking:'가능', heating:'중앙난방', buildingUse:'근린생활시설', approvalDate:'2015-06-20',
    title:'대로변 1층 상가', description:'유동인구 풍부, 주차 가능.\n코너 상가, 가시성 우수.',
    imageUrls:['https://picsum.photos/seed/store1/800/500','https://picsum.photos/seed/store2/800/500'],
    listingNo:'S-0001', createdAt:'2026-05-02T09:00:00.000Z'
  },
  {
    id:'s3', propertyType:'오피스텔', dealType:'전세',
    address:'운정신도시', displayAddress:'운정신도시',
    deposit:23000, area:49,
    contractArea:65, exclusiveArea:49,
    floor:'15층/25층', rooms:'1/1', direction:'동향',
    managementFee:'15만원', heating:'개별난방', moveInDate:'즉시입주',
    parking:'가능 (세대당 1대)', buildingUse:'업무시설',
    title:'신축 오피스텔', description:'역세권, 풀옵션.\nGTX-A 운정역 도보 5분.',
    imageUrls:['https://picsum.photos/seed/officetel1/800/500','https://picsum.photos/seed/officetel2/800/500'],
    listingNo:'O-0001', createdAt:'2026-05-03T09:00:00.000Z'
  }
];

// ─────────────────────────────────────────────
// 스토리지 / 포맷 헬퍼
// ─────────────────────────────────────────────
const readListings = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings)); return [...sampleListings]; }
  try { return JSON.parse(raw); } catch { return [...sampleListings]; }
};
const writeListings = (listings) => localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
const formatPrice = (n) => Number(n).toLocaleString('ko-KR');
const getThumbnail = (item) => (item.imageUrls && item.imageUrls[0]) || item.imageUrl || '';
const getDisplayAddress = (item) => item.displayAddress || item.address;
const getMainPrice = (item) => item.deposit || item.salePrice || item.price || 0;

// ─────────────────────────────────────────────
// 한국어 가격 / 평 변환
// ─────────────────────────────────────────────
const toKoreanPrice = (wanwon) => {
  const n = Number(wanwon);
  if (!n || isNaN(n) || n <= 0) return '';
  const eok = Math.floor(n / 10000);
  const man = n % 10000;
  if (eok && man) return `${eok}억 ${man.toLocaleString('ko-KR')}만원`;
  if (eok) return `${eok}억원`;
  return `${n.toLocaleString('ko-KR')}만원`;
};

const toPyeong = (sqm) => {
  const n = Number(sqm);
  if (!n || isNaN(n) || n <= 0) return '';
  return `약 ${(n * 0.3025).toFixed(1)}평`;
};

const getNextListingNo = (propertyType) => {
  const prefixMap = {
    '공장창고': 'F', '상가': 'S', '오피스텔': 'O',
    '힐스테이트더운정': 'H', '토지': 'T', '단독주택': 'L',
  };
  const prefix = prefixMap[propertyType] || 'X';
  const listings = readListings();
  const existing = listings
    .filter((item) => item.listingNo && item.listingNo.startsWith(prefix + '-'))
    .map((item) => parseInt(item.listingNo.split('-')[1]) || 0);
  const maxNo = existing.length > 0 ? Math.max(...existing) : 0;
  return `${prefix}-${String(maxNo + 1).padStart(4, '0')}`;
};

// ─────────────────────────────────────────────
// 라이트박스
// ─────────────────────────────────────────────
let lightboxImages = [];
let lightboxIdx = 0;

const openLightbox = (images, idx) => {
  lightboxImages = images;
  lightboxIdx = idx;
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lightboxImg').src = images[idx];
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  document.getElementById('lightbox')?.classList.add('hidden');
  document.body.style.overflow = '';
};

const lightboxNav = (dir) => {
  if (!lightboxImages.length) return;
  lightboxIdx = (lightboxIdx + dir + lightboxImages.length) % lightboxImages.length;
  document.getElementById('lightboxImg').src = lightboxImages[lightboxIdx];
  document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === lightboxIdx));
  const mainImg = document.getElementById('modalMainImg');
  if (mainImg) { mainImg.src = lightboxImages[lightboxIdx]; mainImg.dataset.index = lightboxIdx; }
};

// ─────────────────────────────────────────────
// 매물 상세 모달
// ─────────────────────────────────────────────
const openModal = (item) => {
  const modal = document.getElementById('listingModal');
  if (!modal) return;
  const cfg = PROPERTY_FIELDS[item.propertyType] || {};
  const priceFields = (cfg.priceConfig || {})[item.dealType] || [];
  const infoFields = cfg.infoFields || [];
  const images = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);

  document.getElementById('modalId').textContent = item.id;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalBadge').textContent = `${item.propertyType} | ${item.dealType}`;
  document.getElementById('modalAddress').textContent = getDisplayAddress(item);

  let priceHTML = '';
  priceFields.forEach(f => {
    const val = item[f.key];
    if (!val && val !== 0) return;
    priceHTML += `<div class="modal-price-row">
      <span class="price-label">${f.label}</span>
      <strong class="price-value">${f.money ? formatPrice(val) + '만원' : val}</strong>
    </div>`;
  });
  // 기존 단순 price 필드 fallback
  if (!priceHTML && item.price) {
    priceHTML = `<div class="modal-price-row">
      <span class="price-label">${item.dealType}</span>
      <strong class="price-value">${formatPrice(item.price)}만원</strong>
    </div>`;
  }
  document.getElementById('modalPriceArea').innerHTML = priceHTML;

  let tableHTML = '';
  infoFields.forEach(f => {
    const val = item[f.key];
    if (!val && val !== 0) return;
    tableHTML += `<tr><td class="info-label">${f.label}</td><td class="info-value">${val}${f.suffix || ''}</td></tr>`;
  });
  if (!tableHTML && item.area) tableHTML = `<tr><td class="info-label">면적</td><td class="info-value">${item.area}㎡</td></tr>`;
  document.getElementById('modalInfoTable').innerHTML = tableHTML;

  const descEl = document.getElementById('modalDesc');
  descEl.innerHTML = item.description ? item.description.replace(/\n/g, '<br>') : '';

  const mainImg = document.getElementById('modalMainImg');
  const thumbsEl = document.getElementById('modalThumbs');
  if (images.length > 0) {
    mainImg.src = images[0];
    mainImg.dataset.index = 0;
    thumbsEl.innerHTML = images.map((url, i) =>
      `<img src="${url}" class="modal-thumb${i === 0 ? ' active' : ''}" data-index="${i}" />`
    ).join('');
    thumbsEl.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        mainImg.src = images[idx];
        mainImg.dataset.index = idx;
        thumbsEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
    mainImg.onclick = () => openLightbox(images, parseInt(mainImg.dataset.index));
  } else {
    mainImg.src = '';
    thumbsEl.innerHTML = '';
    mainImg.onclick = null;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  document.getElementById('listingModal')?.classList.add('hidden');
  document.body.style.overflow = '';
};

// ─────────────────────────────────────────────
// 공통: 모바일 네비
// ─────────────────────────────────────────────
const setupMobileNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
};

// ─────────────────────────────────────────────
// 공통: 관리자 로그인 게이트
// ─────────────────────────────────────────────
const requireAdminLogin = () => {
  const overlay = document.getElementById('loginOverlay');
  const mainEl = document.getElementById('adminMain');
  if (!overlay || !mainEl) return true;

  const ADMIN_PW = 'hitop2025';
  if (sessionStorage.getItem('hitop_admin') !== '1') {
    const loginBtn = document.getElementById('loginBtn');
    const loginPw = document.getElementById('loginPw');
    const loginError = document.getElementById('loginError');
    const doLogin = () => {
      if (loginPw.value === ADMIN_PW) {
        sessionStorage.setItem('hitop_admin', '1');
        location.reload();
      } else {
        loginError.classList.remove('hidden');
        loginPw.value = '';
        loginPw.focus();
      }
    };
    if (loginBtn) loginBtn.addEventListener('click', doLogin);
    if (loginPw) loginPw.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
    return false;
  }

  overlay.classList.add('hidden');
  mainEl.classList.remove('hidden');
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-flex';
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('hitop_admin');
      location.reload();
    });
  }
  return true;
};

// ─────────────────────────────────────────────
// listings.html
// ─────────────────────────────────────────────
const setupListingsPage = () => {
  const cardsEl = document.getElementById('listingCards');
  const filterForm = document.getElementById('filterForm');
  if (!cardsEl || !filterForm) return;

  let current = readListings();
  let map = null;
  let openIw = null;
  const activeMarkers = [];

  const placeMarkers = (items) => {
    if (!map) return;
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers.length = 0;
    if (openIw) { openIw.close(); openIw = null; }
    if (typeof kakao === 'undefined') return;
    const geocoder = new kakao.maps.services.Geocoder();
    items.forEach(item => {
      geocoder.addressSearch(item.address, (result, status) => {
        if (status !== kakao.maps.services.Status.OK) return;
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        const marker = new kakao.maps.Marker({ map, position: coords, title: item.title });
        const iw = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:700;white-space:nowrap;">
            ${item.title}<br>
            <span style="color:#1f8f63;font-weight:700">${item.dealType} ${formatPrice(getMainPrice(item))}만원</span>
          </div>`
        });
        kakao.maps.event.addListener(marker, 'click', () => {
          if (openIw) openIw.close();
          iw.open(map, marker);
          openIw = iw;
          openModal(item);
        });
        activeMarkers.push(marker);
      });
    });
  };

  window.addEventListener('load', function () {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    if (typeof kakao === 'undefined') { console.log('kakao 없음'); return; }
    mapEl.innerHTML = '';
    map = new kakao.maps.Map(mapEl, {
      center: new kakao.maps.LatLng(37.7512, 126.7820),
      level: 7,
    });
    placeMarkers(current);
  });

  const render = (items) => {
    cardsEl.innerHTML = items.map(item => `
      <article class="listing-card" data-id="${item.id}">
        <div class="card-img">
          <img src="${getThumbnail(item)}" alt="${item.title}" loading="lazy" />
          <span class="card-badge">${item.propertyType}</span>
          ${item.status === 'done' ? '<div class="sold-badge">거래완료</div>' : ''}
        </div>
        <div class="card-body">
          <div>
            <span class="card-address">${getDisplayAddress(item)}</span>
            <div class="card-title">${item.title}</div>
            <div class="card-desc">${item.description ? item.description.replace(/\n/g, ' ') : ''}</div>
          </div>
          <div class="card-footer">
            <span class="card-price">${item.dealType} ${formatPrice(getMainPrice(item))}만원</span>
            <span class="card-area">${item.area}㎡</span>
          </div>
        </div>
      </article>
    `).join('');
    cardsEl.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('click', () => {
        const selected = current.find(x => x.id === card.dataset.id);
        if (selected) openModal(selected);
      });
    });
    placeMarkers(items);
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    const fd = new FormData(filterForm);
    const c = Object.fromEntries(fd.entries());
    const kw = (c.keyword || '').toLowerCase();
    current = readListings().filter(item => {
      if (kw && !item.title.toLowerCase().includes(kw) && !item.address.toLowerCase().includes(kw) && !(item.displayAddress || '').toLowerCase().includes(kw)) return false;
      if (c.dealType && item.dealType !== c.dealType) return false;
      if (c.propertyType && item.propertyType !== c.propertyType) return false;
      if (c.region && !item.address.includes(c.region) && !(item.displayAddress || '').includes(c.region)) return false;
      if (c.maxPrice && Number(getMainPrice(item)) > Number(c.maxPrice)) return false;
      if (c.minArea && Number(item.area) < Number(c.minArea)) return false;
      return true;
    });
    render(current);
  };

  filterForm.addEventListener('submit', applyFilters);
  document.getElementById('filterReset')?.addEventListener('click', () => {
    filterForm.reset(); current = readListings(); render(current);
  });
  document.querySelectorAll('[data-category]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      filterForm.propertyType.value = link.dataset.category;
      filterForm.requestSubmit();
    });
  });
  render(current);
};

// ─────────────────────────────────────────────
// admin.html — 대시보드
// ─────────────────────────────────────────────
const setupAdminDashboard = () => {
  if (!requireAdminLogin()) return;

  const listings = readListings();
  const total = listings.length;
  const done = listings.filter((i) => i.status === 'done').length;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('statTotal', total);
  set('statPublic', total - done);
  set('statDone', done);

  const recentEl = document.getElementById('recentListings');
  if (!recentEl) return;
  const recent = [...listings]
    .sort((a, b) => (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || ''))
    .slice(0, 5);

  recentEl.innerHTML = recent.length
    ? recent.map((item) => `
        <div class="recent-item">
          <span class="recent-no">${item.listingNo || '-'}</span>
          <span class="recent-title">${item.title}</span>
          <span class="recent-type">${item.propertyType}</span>
          <span class="recent-price">${item.dealType} ${formatPrice(getMainPrice(item))}만원</span>
          <span class="recent-status ${item.status === 'done' ? 'status-done' : 'status-public'}">${item.status === 'done' ? '거래완료' : '공개중'}</span>
          <span class="recent-date">${(item.createdAt || '').slice(0, 10) || '-'}</span>
        </div>
      `).join('')
    : '<p style="color:var(--gray-700);padding:16px 0;">등록된 매물이 없습니다.</p>';
};

// ─────────────────────────────────────────────
// admin-register.html — 매물 등록/수정
// ─────────────────────────────────────────────
const setupAdminRegister = () => {
  if (!requireAdminLogin()) return;

  const form = document.getElementById('adminForm');
  if (!form) return;

  const imageContainer = document.getElementById('imageUrlContainer');
  const addImageBtn = document.getElementById('addImageBtn');
  const MAX_IMAGES = 5;
  let isEditMode = false;

  // 다중 이미지 URL 관리
  const addImageRow = (value = '') => {
    if (!imageContainer) return;
    if (imageContainer.querySelectorAll('.image-url-row').length >= MAX_IMAGES) return;
    const count = imageContainer.querySelectorAll('.image-url-row').length;
    const row = document.createElement('div');
    row.className = 'image-url-row';
    const input = document.createElement('input');
    input.name = 'imageUrls';
    input.type = 'url';
    input.placeholder = `사진 URL ${count + 1}`;
    input.value = value;
    if (count === 0) input.required = true;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline img-remove-btn';
    removeBtn.textContent = '삭제 X';
    removeBtn.addEventListener('click', () => {
      if (imageContainer.querySelectorAll('.image-url-row').length > 1) row.remove();
      else input.value = '';
    });
    row.appendChild(input);
    row.appendChild(removeBtn);
    imageContainer.appendChild(row);
  };

  const resetImageFields = () => {
    if (imageContainer) { imageContainer.innerHTML = ''; addImageRow(); }
  };
  resetImageFields();
  addImageBtn?.addEventListener('click', () => addImageRow());

  // 매물번호 자동생성
  const updateListingNo = () => {
    if (isEditMode) return;
    const pt = form.elements['propertyType']?.value;
    const noDisplay = document.getElementById('listingNoDisplay');
    const noInput = form.elements['listingNo'];
    if (pt) {
      const no = getNextListingNo(pt);
      if (noDisplay) noDisplay.textContent = no;
      if (noInput) noInput.value = no;
    } else {
      if (noDisplay) noDisplay.textContent = '-';
      if (noInput) noInput.value = '';
    }
  };

  // 매물종류 변경 시 초기화 (수정 모드 제외)
  const ptEl = form.elements['propertyType'];
  if (ptEl) {
    ptEl.addEventListener('change', () => {
      if (!isEditMode) {
        const selectedType = ptEl.value;
        form.reset();
        form.elements['id'].value = '';
        ptEl.value = selectedType;
        resetImageFields();
        const pyeongEl = document.getElementById('areaPyeong');
        if (pyeongEl) pyeongEl.textContent = '';
        const koreanEl = document.getElementById('priceKorean');
        if (koreanEl) koreanEl.textContent = '';
      }
      updateListingNo();
    });
  }

  // 면적 → 평 자동계산
  const areaEl = form.elements['area'];
  if (areaEl) {
    areaEl.addEventListener('input', () => {
      const el = document.getElementById('areaPyeong');
      if (el) el.textContent = toPyeong(areaEl.value);
    });
  }

  // 금액 → 한글 자동표시
  const priceEl = form.elements['price'];
  if (priceEl) {
    priceEl.addEventListener('input', () => {
      const el = document.getElementById('priceKorean');
      if (el) el.textContent = toKoreanPrice(priceEl.value);
    });
  }

  // 수정 모드: URL 파라미터 확인
  const editId = new URLSearchParams(window.location.search).get('edit');
  if (editId) {
    const target = readListings().find((item) => item.id === editId);
    if (target) {
      isEditMode = true;
      const titleEl = document.getElementById('formTitle');
      if (titleEl) titleEl.textContent = '매물 수정';

      Object.entries(target).forEach(([key, value]) => {
        if (key === 'imageUrls') return;
        const el = form.elements[key];
        if (el) el.value = value;
      });

      imageContainer.innerHTML = '';
      const urls = (target.imageUrls && target.imageUrls.length)
        ? target.imageUrls : (target.imageUrl ? [target.imageUrl] : []);
      urls.forEach((url) => addImageRow(url));
      if (!urls.length) addImageRow();

      const noDisplay = document.getElementById('listingNoDisplay');
      if (noDisplay) noDisplay.textContent = target.listingNo || '-';
      const pyeongEl = document.getElementById('areaPyeong');
      if (pyeongEl && target.area) pyeongEl.textContent = toPyeong(target.area);
      const koreanEl = document.getElementById('priceKorean');
      if (koreanEl && target.price) koreanEl.textContent = toKoreanPrice(target.price);

      const cancelBtn = document.getElementById('cancelEditBtn');
      if (cancelBtn) cancelBtn.classList.remove('hidden');
    }
  }

  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => { window.location.href = 'admin-listings.html'; });
  }

  // 폼 저장
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    for (const [key, value] of fd.entries()) {
      if (key !== 'imageUrls') payload[key] = value;
    }
    payload.imageUrls = Array.from(form.querySelectorAll('input[name="imageUrls"]'))
      .map((el) => el.value.trim()).filter((v) => v);
    payload.price = Number(payload.price);
    payload.area = Number(payload.area);

    let listings = readListings();
    if (payload.id) {
      payload.updatedAt = new Date().toISOString();
      listings = listings.map((item) =>
        item.id === payload.id ? { ...item, ...payload } : item
      );
    } else {
      payload.id = `id_${Date.now()}`;
      payload.createdAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      if (!payload.listingNo) payload.listingNo = getNextListingNo(payload.propertyType);
      if (!payload.status) payload.status = '';
      listings.unshift(payload);
    }
    writeListings(listings);
    window.location.href = 'admin-listings.html';
  });
};

// ─────────────────────────────────────────────
// admin-listings.html — 매물 관리
// ─────────────────────────────────────────────
const setupAdminListingsMgmt = () => {
  if (!requireAdminLogin()) return;

  const listEl = document.getElementById('adminListings');
  const paginationEl = document.getElementById('pagination');
  if (!listEl) return;

  const PAGE_SIZE = 10;
  let currentPage = 1;
  let sortMode = 'date';
  let filtered = [];

  const applyFilters = () => {
    const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const category = document.getElementById('filterCategory')?.value || '';
    const dealType = document.getElementById('filterDealType')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';

    let listings = readListings();
    if (search) listings = listings.filter((item) =>
      item.title.toLowerCase().includes(search) ||
      item.address.toLowerCase().includes(search) ||
      (item.displayAddress || '').toLowerCase().includes(search)
    );
    if (category) listings = listings.filter((item) => item.propertyType === category);
    if (dealType) listings = listings.filter((item) => item.dealType === dealType);
    if (status === 'done') listings = listings.filter((item) => item.status === 'done');
    else if (status === 'public') listings = listings.filter((item) => item.status !== 'done');

    if (sortMode === 'date') {
      listings.sort((a, b) => (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || ''));
    } else {
      listings.sort((a, b) => Number(getMainPrice(b)) - Number(getMainPrice(a)));
    }

    filtered = listings;
    currentPage = 1;
    renderPage();
  };

  const renderPage = () => {
    const total = filtered.length;
    const totalCountEl = document.getElementById('totalCount');
    if (totalCountEl) totalCountEl.textContent = `총 ${total}개`;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = pageItems.length
      ? pageItems.map((item) => {
          const isDone = item.status === 'done';
          const createdDate = (item.createdAt || '').slice(0, 10) || '-';
          return `
            <article class="admin-item${isDone ? ' admin-item-done' : ''}">
              <div class="admin-item-header">
                ${item.listingNo ? `<span class="admin-item-no">${item.listingNo}</span>` : ''}
                <strong class="admin-item-title">${item.title}${isDone ? ' <span class="badge-done">거래완료</span>' : ''}</strong>
                <span class="admin-item-date">등록 ${createdDate}</span>
              </div>
              <p style="margin:4px 0;font-size:13px;">${item.propertyType} / ${item.dealType} · ${getDisplayAddress(item)}</p>
              <p style="margin:4px 0;font-size:13px;">${formatPrice(getMainPrice(item))}만원 · ${item.area}㎡</p>
              <div class="admin-item-actions">
                <a href="admin-register.html?edit=${item.id}" class="btn btn-outline">수정</a>
                <button class="btn btn-primary" data-action="delete" data-id="${item.id}" type="button">삭제</button>
                <button class="btn btn-outline done-btn${isDone ? ' done-active' : ''}" data-action="done" data-id="${item.id}" type="button">${isDone ? '완료취소' : '거래완료'}</button>
              </div>
            </article>
          `;
        }).join('')
      : '<p style="padding:24px;color:var(--gray-700);">조건에 맞는 매물이 없습니다.</p>';

    if (paginationEl) {
      const totalPages = Math.ceil(total / PAGE_SIZE);
      paginationEl.innerHTML = totalPages <= 1 ? '' :
        Array.from({ length: totalPages }, (_, i) => i + 1)
          .map((p) => `<button class="btn ${p === currentPage ? 'btn-primary' : 'btn-outline'}" data-page="${p}" type="button">${p}</button>`)
          .join('');
    }
  };

  ['searchInput'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
  });
  ['filterCategory', 'filterDealType', 'filterStatus'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  document.getElementById('sortDate')?.addEventListener('click', () => {
    sortMode = 'date';
    document.getElementById('sortDate')?.classList.add('active');
    document.getElementById('sortPrice')?.classList.remove('active');
    applyFilters();
  });
  document.getElementById('sortPrice')?.addEventListener('click', () => {
    sortMode = 'price';
    document.getElementById('sortPrice')?.classList.add('active');
    document.getElementById('sortDate')?.classList.remove('active');
    applyFilters();
  });

  paginationEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-page]');
    if (!btn) return;
    currentPage = Number(btn.dataset.page);
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const listings = readListings();

    if (action === 'delete') {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      writeListings(listings.filter((item) => item.id !== id));
      applyFilters();
    }
    if (action === 'done') {
      const target = listings.find((item) => item.id === id);
      if (!target) return;
      writeListings(listings.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'done' ? '' : 'done', updatedAt: new Date().toISOString() }
          : item
      ));
      applyFilters();
    }
  });

  applyFilters();
};

// ─────────────────────────────────────────────
// 진입점
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  const page = document.body.dataset.page;
  if (page === 'listings') setupListingsPage();
  else if (page === 'admin-dashboard') setupAdminDashboard();
  else if (page === 'admin-register') setupAdminRegister();
  else if (page === 'admin-listings') setupAdminListingsMgmt();

  // 모달 / 라이트박스 이벤트 (listings.html)
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('listingModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => lightboxNav(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => lightboxNav(1));
  document.getElementById('lightbox')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLightbox(); closeModal(); }
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });
});
