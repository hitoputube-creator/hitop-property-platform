console.log('app.js 로드됨!');
const STORAGE_KEY = 'hitop_listings_v1';

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

// ── 샘플 데이터 ──
const sampleListings = [
  {
    id:'s1', propertyType:'공장창고', dealType:'임대',
    address:'파주시 탄현면', displayAddress:'파주시 탄현면',
    deposit:5000, monthlyRent:300, managementFee:'없음',
    landArea:860, buildingArea:500, totalArea:500, area:860,
    floor:'지상 1층 / 총 1층', direction:'남향', mainUse:'창고시설',
    office:'1개/1개', parking:'가능 (5대)', elevator:'없음', approvalDate:'2010-03-15',
    title:'대형 물류창고', description:'IC 접근성 우수, 층고 높음.\n자유로 IC 5분 거리.\n대형 트럭 진출입 가능.',
    imageUrls:['https://picsum.photos/seed/factory1/800/500','https://picsum.photos/seed/factory2/800/500'],
    listingNo:'F-0001', createdAt:'2026-05-01T09:00:00.000Z', is_featured: true
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
    listingNo:'S-0001', createdAt:'2026-05-02T09:00:00.000Z', is_urgent: true
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
    listingNo:'O-0001', createdAt:'2026-05-03T09:00:00.000Z', is_featured: true
  }
];

// ── 스토리지 / 포맷 헬퍼 ──
const readListings  = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings)); return [...sampleListings]; }
  try { return JSON.parse(raw); } catch { return [...sampleListings]; }
};
const writeListings = (listings) => localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
const formatPrice   = (n) => Number(n).toLocaleString('ko-KR');
const getThumbnail  = (item) => (item.imageUrls && item.imageUrls[0]) || item.imageUrl || '';
const getDisplayAddress = (item) => item.displayAddress || item.address;
const getMainPrice  = (item) => item.deposit || item.salePrice || item.price || 0;

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

// 신형 매물번호: YYMMDD-N (예: 250521-1)
const getNextPropertyNumber = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `${yy}${mm}${dd}`;
  const listings = readListings();
  const existing = listings
    .filter(i => (i.property_number || i.listingNo || '').startsWith(prefix + '-'))
    .map(i => parseInt(((i.property_number || i.listingNo || '').split('-')[1])) || 0);
  const maxNo = existing.length > 0 ? Math.max(...existing) : 0;
  return `${prefix}-${maxNo + 1}`;
};

// 구형 호환 (admin-register.html 에서 여전히 사용)
const getNextListingNo = () => getNextPropertyNumber();

// ─────────────────────────────────────────────
// 라이트박스
// ─────────────────────────────────────────────
let lightboxImages = [];
let lightboxIdx    = 0;

const openLightbox = (images, idx) => {
  lightboxImages = images; lightboxIdx = idx;
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
  document.querySelectorAll('.modal-thumb').forEach((t,i) => t.classList.toggle('active', i === lightboxIdx));
  const mainImg = document.getElementById('modalMainImg');
  if (mainImg) { mainImg.src = lightboxImages[lightboxIdx]; mainImg.dataset.index = lightboxIdx; }
};

// ── 매물 상세 모달 ──
const openModal = (item) => {
  const modal = document.getElementById('listingModal');
  if (!modal) return;
  const cfg        = PROPERTY_FIELDS[item.propertyType] || {};
  const priceFields = (cfg.priceConfig || {})[item.dealType] || [];
  const infoFields  = cfg.infoFields || [];
  const images      = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);

  document.getElementById('modalId').textContent = item.property_number || item.listingNo || item.id;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalBadge').textContent = `${item.propertyType} | ${item.dealType}`;
  document.getElementById('modalAddress').textContent = getDisplayAddress(item);

  let priceHTML = '';
  priceFields.forEach(f => {
    const val = item[f.key];
    if (!val && val !== 0) return;
    priceHTML += `<div class="modal-price-row">
      <span class="price-label">${f.label}</span>
      <strong class="price-value">${f.money ? formatPrice(val)+'만원' : val}</strong>
    </div>`;
  });
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
    tableHTML += `<tr><td class="info-label">${f.label}</td><td class="info-value">${val}${f.suffix||''}</td></tr>`;
  });
  if (!tableHTML && item.area) tableHTML = `<tr><td class="info-label">면적</td><td class="info-value">${item.area}㎡</td></tr>`;
  document.getElementById('modalInfoTable').innerHTML = tableHTML;

  const descEl = document.getElementById('modalDesc');
  descEl.innerHTML = item.description ? item.description.replace(/\n/g,'<br>') : '';

  const mainImg  = document.getElementById('modalMainImg');
  const thumbsEl = document.getElementById('modalThumbs');
  if (images.length > 0) {
    mainImg.src = images[0]; mainImg.dataset.index = 0;
    thumbsEl.innerHTML = images.map((url,i) =>
      `<img src="${url}" class="modal-thumb${i===0?' active':''}" data-index="${i}" />`
    ).join('');
    thumbsEl.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        mainImg.src = images[idx]; mainImg.dataset.index = idx;
        thumbsEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
    mainImg.onclick = () => openLightbox(images, parseInt(mainImg.dataset.index));
  } else {
    mainImg.src = ''; thumbsEl.innerHTML = ''; mainImg.onclick = null;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};
const closeModal = () => {
  document.getElementById('listingModal')?.classList.add('hidden');
  document.body.style.overflow = '';
};

// ── 모바일 네비 ──
const setupMobileNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
};

// ── 관리자 로그인 게이트 ──
const requireAdminLogin = () => {
  const overlay = document.getElementById('loginOverlay');
  const mainEl  = document.getElementById('adminMain');
  if (!overlay || !mainEl) return true;
  const ADMIN_PW = 'hitop2025';
  if (sessionStorage.getItem('hitop_admin') !== '1') {
    const loginBtn   = document.getElementById('loginBtn');
    const loginPw    = document.getElementById('loginPw');
    const loginError = document.getElementById('loginError');
    const doLogin = () => {
      if (loginPw.value === ADMIN_PW) { sessionStorage.setItem('hitop_admin','1'); location.reload(); }
      else { loginError.classList.remove('hidden'); loginPw.value=''; loginPw.focus(); }
    };
    loginBtn?.addEventListener('click', doLogin);
    loginPw?.addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
    return false;
  }
  overlay.classList.add('hidden');
  mainEl.classList.remove('hidden');
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-flex';
    logoutBtn.addEventListener('click', () => { sessionStorage.removeItem('hitop_admin'); location.reload(); });
  }
  return true;
};

const priceInRange = (price, range) => {
  const p = Number(price);
  if (range==='under1') return p < 10000;
  if (range==='1to5')   return p >= 10000 && p < 50000;
  if (range==='5to10')  return p >= 50000 && p < 100000;
  if (range==='over10') return p >= 100000;
  return true;
};

// ─────────────────────────────────────────────
// listings.html — v3 (사이드바 | 지도+오버레이 | 추천+최신 패널)
// ─────────────────────────────────────────────
const setupListingsPage = () => {
  const filterForm = document.getElementById('filterForm');
  if (!filterForm) return;

  const flt = { cat: '', deal: '', kw: '', formCat: '', formDeal: '' };
  let sortMode = 'date';
  let allPage  = 1;
  const ALL_SIZE = 15; // 5열 × 3행
  let filtered = [];

  // ── 카카오맵 ──
  let map = null, openIw = null;
  const activeMarkers = [];

  // ── 필드 헬퍼 ──
  const isCompleted = i => i.is_completed === true || i.status === 'done';
  const isRec       = i => i.is_recommended === true || i.isRecommended === true;
  const isNew       = i => i.is_new === true;
  const dealClass   = t => t === '매매' ? 'deal-mae' : t === '전세' ? 'deal-jeon' : t === '월세' ? 'deal-wol' : 'deal-im';

  // ── 카운트 업데이트 ──
  const updateCounts = () => {
    const all = readListings();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = `(${v})`; };
    set('cnt-all', all.length);
    ['공장창고','상가','토지','오피스텔','힐스테이트더운정','단독주택'].forEach(cat => {
      set(`cnt-${cat}`, all.filter(i => i.propertyType === cat).length);
    });
  };

  // ── 지도 마커 ──
  const placeMarkers = (items) => {
    if (!map || typeof kakao === 'undefined') return;
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers.length = 0;
    if (openIw) { openIw.close(); openIw = null; }
    const geocoder = new kakao.maps.services.Geocoder();
    items.slice(0, 30).forEach(item => {
      geocoder.addressSearch(item.address, (result, status) => {
        if (status !== kakao.maps.services.Status.OK) return;
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        const marker = new kakao.maps.Marker({ map, position: coords, title: item.title });
        const iw = new kakao.maps.InfoWindow({
          content:`<div style="padding:6px 10px;font-size:12px;font-weight:700;white-space:nowrap;max-width:200px;">
            ${item.title}<br>
            <span style="color:#0A1F5C;font-weight:700;">${item.dealType} ${formatPrice(getMainPrice(item))}만원</span>
          </div>`
        });
        kakao.maps.event.addListener(marker, 'click', () => {
          if (openIw) openIw.close();
          iw.open(map, marker); openIw = iw;
          openModalFull(item);
        });
        activeMarkers.push(marker);
      });
    });
  };

  // ── 지도 초기화 ──
  window.addEventListener('load', () => {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof kakao === 'undefined') return;
    mapEl.innerHTML = '';
    map = new kakao.maps.Map(mapEl, {
      center: new kakao.maps.LatLng(37.7512, 126.7820),
      level: 7
    });
    applyFilters();
  });

  // ── 모달 열기 (미니맵 + 거래완료 표시) ──
  const openModalFull = (item) => {
    openModal(item);
    const doneTag = document.getElementById('modalDoneTag');
    if (doneTag) doneTag.classList.toggle('hidden', !isCompleted(item));
    const minimapWrap = document.getElementById('modalMinimapWrap');
    const minimapEl   = document.getElementById('modalMiniMap');
    if (!minimapWrap || !minimapEl) return;
    minimapWrap.style.display = 'none';
    if (typeof kakao === 'undefined' || !item.address) return;
    new kakao.maps.services.Geocoder().addressSearch(item.address, (result, status) => {
      if (status !== kakao.maps.services.Status.OK) return;
      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      minimapWrap.style.display = 'block';
      minimapEl.innerHTML = '';
      const mm = new kakao.maps.Map(minimapEl, { center: coords, level: 4 });
      new kakao.maps.Marker({ map: mm, position: coords });
    });
  };

  // ── 페이지네이션 HTML ──
  const paginationHTML = (current, total) => {
    if (total <= 1) return '';
    let html = '';
    if (current > 1) html += `<button class="lp-page-btn" data-pg="${current - 1}">‹</button>`;
    const s = Math.max(1, current - 2);
    const e = Math.min(total, s + 4);
    for (let p = s; p <= e; p++) {
      html += `<button class="lp-page-btn${p === current ? ' active' : ''}" data-pg="${p}">${p}</button>`;
    }
    if (current < total) html += `<button class="lp-page-btn" data-pg="${current + 1}">›</button>`;
    return html;
  };

  // ── 오른쪽 패널: 추천 + 최신 미니카드 ──
  const renderSpecialPanels = () => {
    const all  = readListings();
    const recItems = all.filter(i => isRec(i) && !isCompleted(i)).slice(0, 3);
    const newItems = all.filter(i => isNew(i) && !isCompleted(i)).slice(0, 3);

    const miniCardHTML = item => {
      const thumb = getThumbnail(item);
      return `<article class="lp-mini-card" data-id="${item.id}">
        <div class="lp-mini-img${!thumb ? ' lp-mini-img-empty' : ''}">
          ${thumb ? `<img src="${thumb}" alt="${item.title}" onerror="this.style.display='none'" />` : ''}
        </div>
        <div class="lp-mini-body">
          <div class="lp-mini-title">${item.title}</div>
          <div class="lp-mini-addr">${getDisplayAddress(item)}</div>
          <div class="lp-mini-price">${item.dealType} ${formatPrice(getMainPrice(item))}만원</div>
        </div>
      </article>`;
    };

    [['recCards','추천'], ['newCards','최신']].forEach(([id, label], idx) => {
      const el = document.getElementById(id);
      if (!el) return;
      const items = idx === 0 ? recItems : newItems;
      el.innerHTML = items.length
        ? items.map(miniCardHTML).join('')
        : `<div class="lp-mini-empty">${label} 매물 없음</div>`;
      el.querySelectorAll('.lp-mini-card').forEach(card => {
        card.addEventListener('click', () => {
          const found = readListings().find(x => x.id === card.dataset.id);
          if (found) openModalFull(found);
        });
      });
    });
  };

  // ── 전체 매물 그리드 카드 HTML ──
  const fullCardHTML = item => {
    const done   = isCompleted(item);
    const label  = CAT_LABELS[item.propertyType] || item.propertyType;
    const price  = getMainPrice(item);
    const sqm    = Number(item.area || item.landArea || item.contractArea || item.exclusiveArea || 0);
    const area   = sqm ? `${sqm}㎡ · ${(sqm * 0.3025).toFixed(0)}평` : '';
    const imgSrc = getThumbnail(item);
    const dc     = dealClass(item.dealType);
    return `
      <article class="lp-all-card${done ? ' lp-all-done' : ''}" data-id="${item.id}">
        <div class="lp-all-img">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
          ${done ? '<div class="lp-all-sold">거래완료</div>' : ''}
          <span class="lp-all-cat-tag">${label}</span>
        </div>
        <div class="lp-all-body">
          <span class="lp-deal-pill ${dc}">${item.dealType}</span>
          <div class="lp-all-title">${item.title}</div>
          <div class="lp-all-price">${formatPrice(price)}만원</div>
          ${area ? `<div class="lp-all-area">${area}</div>` : ''}
          <div class="lp-all-addr">${getDisplayAddress(item)}</div>
        </div>
      </article>`;
  };

  // ── 전체 그리드 렌더 ──
  const renderAllGrid = () => {
    const cardsEl = document.getElementById('listingCards');
    const countEl = document.getElementById('listCount');
    if (!cardsEl) return;
    const total      = filtered.length;
    if (countEl) countEl.textContent = total;
    const totalPages = Math.ceil(total / ALL_SIZE);
    const items      = filtered.slice((allPage - 1) * ALL_SIZE, allPage * ALL_SIZE);
    cardsEl.innerHTML = items.length
      ? items.map(fullCardHTML).join('')
      : '<div class="lp-empty" style="grid-column:1/-1;">조건에 맞는 매물이 없습니다.</div>';
    cardsEl.querySelectorAll('.lp-all-card').forEach(card => {
      card.addEventListener('click', () => {
        const found = filtered.find(x => x.id === card.dataset.id);
        if (found) openModalFull(found);
      });
    });
    const pgEl = document.getElementById('lpPagination');
    if (pgEl) {
      pgEl.innerHTML = paginationHTML(allPage, totalPages);
      pgEl.querySelectorAll('.lp-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          allPage = Number(btn.dataset.pg);
          renderAllGrid();
          document.getElementById('allListingsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  };

  // ── 필터 실행 ──
  const applyFilters = () => {
    const effectiveCat  = flt.cat  || flt.formCat;
    const effectiveDeal = flt.deal || flt.formDeal;
    let items = readListings();
    if (effectiveCat)  items = items.filter(i => i.propertyType === effectiveCat);
    if (effectiveDeal) items = items.filter(i => i.dealType === effectiveDeal);
    if (flt.kw)        items = items.filter(i =>
      (i.title || '').toLowerCase().includes(flt.kw) ||
      (i.address || '').toLowerCase().includes(flt.kw) ||
      (i.displayAddress || '').toLowerCase().includes(flt.kw)
    );
    if (sortMode === 'price') items.sort((a, b) => Number(getMainPrice(b)) - Number(getMainPrice(a)));
    else items.sort((a, b) => (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || ''));
    filtered = items;
    allPage  = 1;
    renderAllGrid();
    renderSpecialPanels();
    updateCounts();
    placeMarkers(items);
  };

  // ── 정렬 ──
  const setSortMode = mode => {
    sortMode = mode;
    const isDate = mode === 'date';
    ['sortDateBtn','sortDateBtn2'].forEach(id =>
      document.getElementById(id)?.classList.toggle('active', isDate));
    ['sortPriceBtn','sortPriceBtn2'].forEach(id =>
      document.getElementById(id)?.classList.toggle('active', !isDate));
    applyFilters();
  };
  document.getElementById('sortDateBtn')?.addEventListener('click',  () => setSortMode('date'));
  document.getElementById('sortPriceBtn')?.addEventListener('click', () => setSortMode('price'));
  document.getElementById('sortDateBtn2')?.addEventListener('click',  () => setSortMode('date'));
  document.getElementById('sortPriceBtn2')?.addEventListener('click', () => setSortMode('price'));

  // ── 사이드바 카테고리 클릭 ──
  document.querySelectorAll('.lp-cat-item').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      flt.cat = el.dataset.cat;
      flt.deal = '';
      const fc = document.getElementById('formCatSelect');
      if (fc) fc.value = flt.cat;
      document.querySelectorAll('.lp-cat-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      applyFilters();
    });
  });

  // ── 오버레이 검색 폼 ──
  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    flt.kw       = (document.getElementById('kwInput')?.value || '').toLowerCase();
    flt.formCat  = document.getElementById('formCatSelect')?.value  || '';
    flt.formDeal = document.getElementById('formDealSelect')?.value || '';
    applyFilters();
  });
  document.getElementById('kwInput')?.addEventListener('input', e => {
    flt.kw = e.target.value.toLowerCase();
    applyFilters();
  });
  document.getElementById('filterResetBtn')?.addEventListener('click', () => {
    Object.assign(flt, { cat: '', deal: '', kw: '', formCat: '', formDeal: '' });
    filterForm.reset();
    document.querySelectorAll('.lp-cat-item').forEach(x =>
      x.classList.toggle('active', x.dataset.cat === ''));
    setSortMode('date');
  });

  // ── 전체 매물 보기 / 닫기 ──
  document.getElementById('showAllBtn')?.addEventListener('click', () => {
    const sec = document.getElementById('allListingsSection');
    if (!sec) return;
    sec.classList.remove('hidden');
    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  });
  document.getElementById('hideAllBtn')?.addEventListener('click', () => {
    const sec = document.getElementById('allListingsSection');
    if (!sec) return;
    sec.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── 빠른 문의 폼 ──
  document.getElementById('sideInquiryForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = (document.getElementById('inquiryName')?.value  || '').trim();
    const phone = (document.getElementById('inquiryPhone')?.value || '').trim();
    if (!name || !phone) { alert('이름과 연락처를 입력해주세요.'); return; }
    alert(`상담 문의가 접수되었습니다.\n담당자가 빠른 시일 내에 연락드리겠습니다.\n\n이름: ${name}\n연락처: ${phone}`);
    e.target.reset();
  });

  // ── 전체 매물 보기 버튼 (패널 하단) ──
  document.getElementById('btnScrollToAll')?.addEventListener('click', () => {
    document.getElementById('lp-bottom')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ── URL 파라미터 ──
  const urlCat = new URLSearchParams(window.location.search).get('category');
  if (urlCat) {
    flt.cat = urlCat;
    const catSel = document.getElementById('formCatSelect');
    if (catSel) catSel.value = urlCat;
  }

  // 초기 렌더
  applyFilters();
  renderPreviewSections();
};

// ─────────────────────────────────────────────
// index.html
// ─────────────────────────────────────────────
const setupHomePage = () => {
  const recentEl = document.getElementById('homeRecentListings');
  if (!recentEl) return;
  const listings = readListings()
    .filter(i => i.status !== 'done')
    .sort((a,b) => (b.createdAt||b.id||'').localeCompare(a.createdAt||a.id||''))
    .slice(0, 6);
  if (!listings.length) { recentEl.innerHTML = '<p>등록된 매물이 없습니다.</p>'; return; }
  recentEl.innerHTML = listings.map(item => `
    <a class="home-listing-card" href="listings.html" title="${item.title}">
      <div class="hlc-img">
        <img src="${getThumbnail(item)}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />
        <span class="card-badge">${item.propertyType}</span>
      </div>
      <div class="hlc-body">
        <div class="hlc-address">${getDisplayAddress(item)}</div>
        <div class="hlc-title">${item.title}</div>
        <div class="hlc-price">${item.dealType} ${formatPrice(getMainPrice(item))}만원</div>
      </div>
    </a>
  `).join('');
};

// ─────────────────────────────────────────────
// admin.html — 통합 관리자 대시보드 v2
// ─────────────────────────────────────────────
const setupAdminDashboard = () => {
  if (!requireAdminLogin()) return;

  const listEl = document.getElementById('adminListWrap');
  if (!listEl) return;

  let sortMode = 'date';
  let filterCat = '', filterDeal = '', filterKw = '';
  let filtered = [];

  // ── 필드 헬퍼 (신·구 호환) ──
  const isCompleted = i => i.is_completed === true || i.status === 'done';
  const isRec       = i => i.is_recommended === true || i.isRecommended === true;
  const isNew       = i => i.is_new === true;
  const getPropNo   = i => i.property_number || i.listingNo || '-';

  // ── 통계 업데이트 ──
  const updateStats = () => {
    const all  = readListings();
    const done = all.filter(isCompleted).length;
    const rec  = all.filter(isRec).length;
    const set  = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotal',       all.length);
    set('statPublic',      all.length - done);
    set('statDone',        done);
    set('statRecommended', rec);
  };

  // ── 목록 렌더 ──
  const renderList = () => {
    listEl.innerHTML = filtered.length
      ? filtered.map(item => {
          const done  = isCompleted(item);
          const rec   = isRec(item);
          const isnew = isNew(item);
          const thumb = getThumbnail(item);
          const price = getMainPrice(item);
          const propNo = getPropNo(item);
          const date  = (item.createdAt || '').slice(0, 10) || '-';
          return `
            <article class="adm-item${done ? ' adm-item-done' : ''}" data-id="${item.id}">
              ${thumb ? `
              <div class="adm-item-img${done ? ' adm-img-done' : ''}">
                <img src="${thumb}" alt="${item.title}" onerror="this.style.display='none'" />
                ${done ? '<div class="adm-done-badge">거래완료</div>' : ''}
                ${rec   ? '<span class="adm-rec-ribbon">⭐ 추천</span>' : ''}
                ${isnew ? '<span class="adm-new-ribbon">🔥 최신</span>' : ''}
              </div>` : ''}
              <div class="adm-item-body">
                <div class="adm-item-row1">
                  <span class="adm-item-no">${propNo}</span>
                  <span class="adm-item-type">${item.propertyType || '-'}</span>
                  <span class="adm-item-deal">${item.dealType || '-'}</span>
                  <span class="adm-item-date">${date}</span>
                </div>
                <div class="adm-item-title">${item.title}</div>
                <div class="adm-item-info">${getDisplayAddress(item)} · ${formatPrice(price)}만원 · ${item.area || 0}㎡</div>
                <div class="adm-item-actions">
                  <button class="adm-btn${rec   ? ' adm-btn-rec-on' : ''}" data-action="rec"  data-id="${item.id}">⭐ 추천</button>
                  <button class="adm-btn${isnew ? ' adm-btn-new-on' : ''}" data-action="new"  data-id="${item.id}">🔥 최신</button>
                  <button class="adm-btn adm-btn-done${done ? ' done-active' : ''}" data-action="done" data-id="${item.id}">${done ? '완료취소' : '거래완료'}</button>
                  <button class="adm-btn adm-btn-edit" data-action="edit" data-id="${item.id}">✏️ 수정</button>
                  <button class="adm-btn adm-btn-del"  data-action="del"  data-id="${item.id}">🗑️ 삭제</button>
                </div>
              </div>
            </article>`;
        }).join('')
      : '<p style="padding:24px;color:#999;">조건에 맞는 매물이 없습니다.</p>';
  };

  // ── 필터 적용 ──
  const applyFilters = () => {
    let listings = readListings();
    if (filterCat)  listings = listings.filter(i => i.propertyType === filterCat);
    if (filterDeal) listings = listings.filter(i => i.dealType === filterDeal);
    if (filterKw) {
      const kw = filterKw.toLowerCase();
      listings = listings.filter(i =>
        (i.title || '').toLowerCase().includes(kw) ||
        (i.address || '').toLowerCase().includes(kw) ||
        (i.displayAddress || '').toLowerCase().includes(kw)
      );
    }
    if (sortMode === 'price') listings.sort((a, b) => Number(getMainPrice(b)) - Number(getMainPrice(a)));
    else listings.sort((a, b) => (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || ''));
    filtered = listings;
    renderList();
    updateStats();
    const tc = document.getElementById('adminTotalCount');
    if (tc) tc.textContent = `총 ${listings.length}개`;
  };

  // ── 액션 핸들러 ──
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const listings = readListings();

    if (action === 'del') {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      writeListings(listings.filter(i => i.id !== id));
      applyFilters();
    }

    if (action === 'done') {
      const target = listings.find(i => i.id === id);
      if (!target) return;
      const nowDone = !isCompleted(target);
      if (nowDone && !confirm('거래완료 처리하시겠습니까?')) return;
      writeListings(listings.map(i => i.id === id
        ? { ...i, is_completed: nowDone, status: nowDone ? 'done' : '', updatedAt: new Date().toISOString() }
        : i));
      applyFilters();
    }

    if (action === 'rec') {
      const target = listings.find(i => i.id === id);
      if (!target) return;
      const nowRec = !isRec(target);
      writeListings(listings.map(i => i.id === id
        ? { ...i, is_recommended: nowRec, isRecommended: nowRec, updatedAt: new Date().toISOString() }
        : i));
      applyFilters();
    }

    if (action === 'new') {
      const target = listings.find(i => i.id === id);
      if (!target) return;
      const nowNew = !isNew(target);
      writeListings(listings.map(i => i.id === id
        ? { ...i, is_new: nowNew, updatedAt: new Date().toISOString() }
        : i));
      applyFilters();
    }

    if (action === 'edit') {
      const target = listings.find(i => i.id === id);
      if (target) openEditModal(target);
    }
  });

  // ── 수정 모달 ──
  const editModal = document.getElementById('editModal');

  const openEditModal = (item) => {
    document.getElementById('editId').value        = item.id;
    document.getElementById('editTitle').value     = item.title || '';
    document.getElementById('editType').value      = item.propertyType || '공장창고';
    document.getElementById('editDeal').value      = item.dealType || '매매';
    document.getElementById('editPrice').value     = item.price || item.salePrice || item.deposit || '';
    document.getElementById('editArea').value      = item.area || item.landArea || '';
    document.getElementById('editAddress').value   = item.displayAddress || item.address || '';
    document.getElementById('editDesc').value      = item.description || '';
    document.getElementById('editImageUrl').value  = (item.imageUrls && item.imageUrls[0]) || item.imageUrl || '';
    editModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    editModal?.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.getElementById('editModalClose')?.addEventListener('click', closeEditModal);
  document.getElementById('editCancelBtn')?.addEventListener('click', closeEditModal);
  editModal?.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

  document.getElementById('editForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const listings = readListings();
    const updates = {
      title:        document.getElementById('editTitle').value,
      propertyType: document.getElementById('editType').value,
      dealType:     document.getElementById('editDeal').value,
      displayAddress: document.getElementById('editAddress').value,
      description:  document.getElementById('editDesc').value,
      updatedAt:    new Date().toISOString(),
    };
    const priceVal = Number(document.getElementById('editPrice').value);
    const areaVal  = Number(document.getElementById('editArea').value);
    if (priceVal) updates.price = priceVal;
    if (areaVal)  updates.area  = areaVal;
    const imgUrl = document.getElementById('editImageUrl').value.trim();
    if (imgUrl) updates.imageUrls = [imgUrl];
    writeListings(listings.map(i => i.id === id ? { ...i, ...updates } : i));
    closeEditModal();
    applyFilters();
  });

  // ── 검색·필터 이벤트 ──
  document.getElementById('adminSearchBtn')?.addEventListener('click', () => {
    filterKw = (document.getElementById('adminSearchKw')?.value || '').trim();
    applyFilters();
  });
  document.getElementById('adminSearchKw')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { filterKw = e.target.value.trim(); applyFilters(); }
  });
  document.getElementById('adminFilterCat')?.addEventListener('change', e => {
    filterCat = e.target.value; applyFilters();
  });
  document.getElementById('adminFilterDeal')?.addEventListener('change', e => {
    filterDeal = e.target.value; applyFilters();
  });
  document.getElementById('adminResetBtn')?.addEventListener('click', () => {
    filterCat = ''; filterDeal = ''; filterKw = '';
    const fc = document.getElementById('adminFilterCat'); if (fc) fc.value = '';
    const fd = document.getElementById('adminFilterDeal'); if (fd) fd.value = '';
    const fk = document.getElementById('adminSearchKw'); if (fk) fk.value = '';
    applyFilters();
  });

  document.getElementById('adminSortDate')?.addEventListener('click', () => {
    sortMode = 'date';
    document.getElementById('adminSortDate')?.classList.add('active');
    document.getElementById('adminSortPrice')?.classList.remove('active');
    applyFilters();
  });
  document.getElementById('adminSortPrice')?.addEventListener('click', () => {
    sortMode = 'price';
    document.getElementById('adminSortPrice')?.classList.add('active');
    document.getElementById('adminSortDate')?.classList.remove('active');
    applyFilters();
  });

  applyFilters();
};

// ─────────────────────────────────────────────
// admin-register.html
// ─────────────────────────────────────────────
const setupAdminRegister = () => {
  if (!requireAdminLogin()) return;
  const form = document.getElementById('adminForm');
  if (!form) return;
  const imageContainer = document.getElementById('imageUrlContainer');
  const addImageBtn    = document.getElementById('addImageBtn');
  const MAX_IMAGES     = 5;
  let isEditMode       = false;

  const addImageRow = (value='') => {
    if (!imageContainer) return;
    if (imageContainer.querySelectorAll('.image-url-row').length >= MAX_IMAGES) return;
    const count = imageContainer.querySelectorAll('.image-url-row').length;
    const row   = document.createElement('div');
    row.className = 'image-url-row';
    const input = document.createElement('input');
    input.name = 'imageUrls'; input.type = 'url'; input.placeholder = `사진 URL ${count+1}`; input.value = value;
    if (count === 0) input.required = true;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button'; removeBtn.className = 'btn btn-outline img-remove-btn'; removeBtn.textContent = '삭제 X';
    removeBtn.addEventListener('click', () => {
      if (imageContainer.querySelectorAll('.image-url-row').length > 1) row.remove();
      else input.value = '';
    });
    row.appendChild(input); row.appendChild(removeBtn); imageContainer.appendChild(row);
  };

  const resetImageFields = () => { if(imageContainer){imageContainer.innerHTML=''; addImageRow();} };
  resetImageFields();
  addImageBtn?.addEventListener('click', () => addImageRow());

  // ── 추천/급매 체크박스 스타일 ──
  const chkRec = document.getElementById('chkRecommended');
  const chkUrg = document.getElementById('chkUrgent');
  const lblRec = document.getElementById('labelRecommended');
  const lblUrg = document.getElementById('labelUrgent');
  const syncFlagStyle = (chk, lbl) => lbl?.classList.toggle('is-checked', !!chk?.checked);
  chkRec?.addEventListener('change', () => syncFlagStyle(chkRec, lblRec));
  chkUrg?.addEventListener('change', () => syncFlagStyle(chkUrg, lblUrg));

  // 매물번호 자동생성
  const updateListingNo = () => {
    if (isEditMode) return;
    const pt = form.elements['propertyType']?.value;
    const noDisplay = document.getElementById('listingNoDisplay');
    const noInput   = form.elements['listingNo'];
    if (pt) { const no=getNextListingNo(pt); if(noDisplay)noDisplay.textContent=no; if(noInput)noInput.value=no; }
    else { if(noDisplay)noDisplay.textContent='-'; if(noInput)noInput.value=''; }
  };

  const ptEl = form.elements['propertyType'];
  if (ptEl) {
    ptEl.addEventListener('change', () => {
      if (!isEditMode) {
        const sel = ptEl.value; form.reset(); form.elements['id'].value=''; ptEl.value=sel;
        resetImageFields();
        const py=document.getElementById('areaPyeong'); if(py)py.textContent='';
        const ko=document.getElementById('priceKorean'); if(ko)ko.textContent='';
      }
      updateListingNo();
    });
  }

  const areaEl  = form.elements['area'];
  if (areaEl)  areaEl.addEventListener('input',  () => { const el=document.getElementById('areaPyeong'); if(el)el.textContent=toPyeong(areaEl.value); });
  const priceEl = form.elements['price'];
  if (priceEl) priceEl.addEventListener('input', () => { const el=document.getElementById('priceKorean'); if(el)el.textContent=toKoreanPrice(priceEl.value); });

  const editId = new URLSearchParams(window.location.search).get('edit');
  if (editId) {
    const target = readListings().find(item => item.id===editId);
    if (target) {
      isEditMode = true;
      const titleEl = document.getElementById('formTitle');
      if (titleEl) titleEl.textContent = '매물 수정';

      Object.entries(target).forEach(([key, value]) => {
        if (key === 'imageUrls') return;
        const el = form.elements[key];
        if (!el) return;
        if (el.type === 'checkbox') {
          el.checked = value === true || value === 'true';
        } else {
          el.value = value;
        }
      });
      // 체크박스 라벨 스타일 동기화
      syncFlagStyle(chkRec, lblRec);
      syncFlagStyle(chkUrg, lblUrg);

      imageContainer.innerHTML = '';
      const urls = (target.imageUrls && target.imageUrls.length)
        ? target.imageUrls : (target.imageUrl ? [target.imageUrl] : []);
      urls.forEach((url) => addImageRow(url));
      if (!urls.length) addImageRow();
      const noDisp=document.getElementById('listingNoDisplay'); if(noDisp)noDisp.textContent=target.listingNo||'-';
      const pyEl=document.getElementById('areaPyeong'); if(pyEl&&target.area)pyEl.textContent=toPyeong(target.area);
      const koEl=document.getElementById('priceKorean'); if(koEl&&target.price)koEl.textContent=toKoreanPrice(target.price);
      const cancelBtn=document.getElementById('cancelEditBtn'); if(cancelBtn)cancelBtn.classList.remove('hidden');
    }
  }

  document.getElementById('cancelEditBtn')?.addEventListener('click', () => { window.location.href='admin-listings.html'; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    for (const [key,value] of fd.entries()) { if(key!=='imageUrls') payload[key]=value; }
    payload.imageUrls = Array.from(form.querySelectorAll('input[name="imageUrls"]'))
      .map(el => el.value.trim()).filter(v => v);
    payload.price = Number(payload.price);
    payload.area  = Number(payload.area);
    payload.isRecommended = chkRec?.checked === true;
    payload.isUrgent      = chkUrg?.checked === true;

    let listings = readListings();
    if (payload.id) {
      payload.updatedAt = new Date().toISOString();
      listings = listings.map(item => item.id===payload.id ? {...item,...payload} : item);
    } else {
      payload.id        = `id_${Date.now()}`;
      payload.createdAt = new Date().toISOString();
      payload.updatedAt = new Date().toISOString();
      if (!payload.listingNo) payload.listingNo = getNextPropertyNumber();
      if (!payload.property_number) payload.property_number = payload.listingNo;
      if (!payload.status) payload.status = '';
      listings.unshift(payload);
    }
    writeListings(listings);
    window.location.href = 'admin-listings.html';
  });
};

// ─────────────────────────────────────────────
// admin-listings.html
// ─────────────────────────────────────────────
const setupAdminListingsMgmt = () => {
  if (!requireAdminLogin()) return;
  const listEl       = document.getElementById('adminListings');
  const paginationEl = document.getElementById('pagination');
  if (!listEl) return;
  const PAGE_SIZE=10; let currentPage=1, sortMode='date', filtered=[];

  const applyFilters = () => {
    const search   = (document.getElementById('searchInput')?.value||'').toLowerCase();
    const category = document.getElementById('filterCategory')?.value||'';
    const dealType = document.getElementById('filterDealType')?.value||'';
    const status   = document.getElementById('filterStatus')?.value||'';
    let listings = readListings();
    if (search)   listings=listings.filter(i=>i.title.toLowerCase().includes(search)||i.address.toLowerCase().includes(search)||(i.displayAddress||'').toLowerCase().includes(search));
    if (category) listings=listings.filter(i=>i.propertyType===category);
    if (dealType) listings=listings.filter(i=>i.dealType===dealType);
    if (status==='done')   listings=listings.filter(i=>i.status==='done');
    else if (status==='public') listings=listings.filter(i=>i.status!=='done');
    if (sortMode==='date')  listings.sort((a,b)=>(b.createdAt||b.id||'').localeCompare(a.createdAt||a.id||''));
    else listings.sort((a,b)=>Number(getMainPrice(b))-Number(getMainPrice(a)));
    filtered=listings; currentPage=1; renderPage();
  };

  const renderPage = () => {
    const total=filtered.length;
    const totalCountEl=document.getElementById('totalCount'); if(totalCountEl) totalCountEl.textContent=`총 ${total}개`;
    const start=(currentPage-1)*PAGE_SIZE;
    const pageItems=filtered.slice(start,start+PAGE_SIZE);
    listEl.innerHTML = pageItems.length
      ? pageItems.map(item => {
          const isDone=item.status==='done';
          return `<article class="admin-item${isDone?' admin-item-done':''}">
            <div class="admin-item-header">
              ${item.listingNo?`<span class="admin-item-no">${item.listingNo}</span>`:''}
              <strong class="admin-item-title">${item.title}${isDone?' <span class="badge-done">거래완료</span>':''}</strong>
              <span class="admin-item-date">등록 ${(item.createdAt||'').slice(0,10)||'-'}</span>
            </div>
            <p style="margin:4px 0;font-size:13px;">${item.propertyType} / ${item.dealType} · ${getDisplayAddress(item)}</p>
            <p style="margin:4px 0;font-size:13px;">${formatPrice(getMainPrice(item))}만원 · ${item.area}㎡</p>
            <div class="admin-item-actions">
              <a href="admin-register.html?edit=${item.id}" class="btn btn-outline">수정</a>
              <button class="btn btn-primary" data-action="delete" data-id="${item.id}" type="button">삭제</button>
              <button class="btn btn-outline done-btn${isDone?' done-active':''}" data-action="done" data-id="${item.id}" type="button">${isDone?'완료취소':'거래완료'}</button>
            </div>
          </article>`;
        }).join('')
      : '<p style="padding:24px;color:#6B7280;">조건에 맞는 매물이 없습니다.</p>';
    if (paginationEl) {
      const tp=Math.ceil(total/PAGE_SIZE);
      paginationEl.innerHTML = tp<=1 ? '' :
        Array.from({length:tp},(_,i)=>i+1)
          .map(p=>`<button class="btn ${p===currentPage?'btn-primary':'btn-outline'}" data-page="${p}" type="button">${p}</button>`)
          .join('');
    }
  };

  ['searchInput'].forEach(id=>document.getElementById(id)?.addEventListener('input',applyFilters));
  ['filterCategory','filterDealType','filterStatus'].forEach(id=>document.getElementById(id)?.addEventListener('change',applyFilters));
  document.getElementById('sortDate')?.addEventListener('click',()=>{sortMode='date';document.getElementById('sortDate')?.classList.add('active');document.getElementById('sortPrice')?.classList.remove('active');applyFilters();});
  document.getElementById('sortPrice')?.addEventListener('click',()=>{sortMode='price';document.getElementById('sortPrice')?.classList.add('active');document.getElementById('sortDate')?.classList.remove('active');applyFilters();});
  paginationEl?.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-page]'); if(!btn)return;
    currentPage=Number(btn.dataset.page); renderPage(); window.scrollTo({top:0,behavior:'smooth'});
  });
  listEl.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-action]'); if(!btn)return;
    const {action,id}=btn.dataset;
    const listings=readListings();
    if (action==='delete') { if(!confirm('정말 삭제하시겠습니까?'))return; writeListings(listings.filter(i=>i.id!==id)); applyFilters(); }
    if (action==='done') {
      writeListings(listings.map(i=>i.id===id?{...i,status:i.status==='done'?'':'done',updatedAt:new Date().toISOString()}:i));
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
  if      (page === 'home')             setupHomePage();
  else if (page === 'listings')         setupListingsPage();
  else if (page === 'admin-dashboard')  setupAdminDashboard();
  else if (page === 'admin-register')   setupAdminRegister();
  else if (page === 'admin-listings')   setupAdminListingsMgmt();

  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('listingModal')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => lightboxNav(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => lightboxNav(1));
  document.getElementById('lightbox')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')      { closeLightbox(); closeModal(); }
    if (e.key === 'ArrowLeft')   lightboxNav(-1);
    if (e.key === 'ArrowRight')  lightboxNav(1);
  });
});
