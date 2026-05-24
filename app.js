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

// ── Firestore 매물 CRUD 헬퍼 (2단계 — 호출부는 아직 미연결) ──
const _fsListings = () => import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
const _fsCfg      = () => import('./firebase-config.js');
const _fsAuth     = () => import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

function normalizeFirestoreListing(docSnap) {
  const d = docSnap.data();
  return {
    ...d,
    id: docSnap.id,
    createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : null,
    updatedAt: d.updatedAt ? d.updatedAt.toDate().toISOString() : null,
  };
}

async function readListingsFromFirestore() {
  const [{ collection, getDocs, query, orderBy }, { db, LISTINGS_COLLECTION }] =
    await Promise.all([_fsListings(), _fsCfg()]);
  const q    = query(collection(db, LISTINGS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeFirestoreListing);
}

async function createListingInFirestore(listing) {
  const [{ collection, addDoc, serverTimestamp }, { db, LISTINGS_COLLECTION }] =
    await Promise.all([_fsListings(), _fsCfg()]);
  const now = serverTimestamp();
  const ref = await addDoc(collection(db, LISTINGS_COLLECTION), {
    ...listing,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

async function updateListingInFirestore(id, data) {
  const [{ doc, updateDoc, serverTimestamp }, { db, LISTINGS_COLLECTION }] =
    await Promise.all([_fsListings(), _fsCfg()]);
  await updateDoc(doc(db, LISTINGS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

async function deleteListingFromFirestore(id) {
  const [{ doc, deleteDoc }, { db, LISTINGS_COLLECTION }] =
    await Promise.all([_fsListings(), _fsCfg()]);
  await deleteDoc(doc(db, LISTINGS_COLLECTION, id));
}

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

// ── 백그라운드 관리자 인증 대기 헬퍼 ──
let adminAuthPromise = null;
const waitForAdminAuth = () => {
  if (adminAuthPromise) return adminAuthPromise;
  adminAuthPromise = new Promise(async (resolve) => {
    try {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([_fsAuth(), _fsCfg()]);
      if (auth.currentUser) {
        if (auth.currentUser.email === 'newpajucity@naver.com') {
          resolve(true);
          return;
        }
      }
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user && user.email === 'newpajucity@naver.com') {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Auth 모니터링 오류:', err);
      resolve(false);
    }
  });
  return adminAuthPromise;
};
window.waitForAdminAuth = waitForAdminAuth;

// ── 관리자 로그인 게이트 ──
const requireAdminLogin = () => {
  const overlay = document.getElementById('loginOverlay');
  const mainEl  = document.getElementById('adminMain');
  if (!overlay || !mainEl) return true;
  const ADMIN_PW = 'hitop2025'; // UI 호환용 레거시 패스워드 상수 보존
  
  // 백그라운드 Firebase Auth 세션 검사 및 sessionStorage 연동 감시 (진입 시 항상 즉시 실행)
  (async () => {
    try {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([_fsAuth(), _fsCfg()]);
      onAuthStateChanged(auth, (user) => {
        if (user && user.email === 'newpajucity@naver.com') {
          // Auth 세션이 정상적이고 관리자 이메일인 경우
          const wasLoggedIn = sessionStorage.getItem('hitopAdminLoggedIn') === 'true';
          sessionStorage.setItem('hitopAdminLoggedIn', 'true');
          overlay.classList.add('hidden');
          mainEl.classList.remove('hidden');
          
          // 기존에 세션스토리지에 로그인 정보가 없었거나 비활성 상태였을 경우 리로드하여 전체 페이지 초기화
          if (!wasLoggedIn) {
            location.reload();
          }
        } else {
          // Auth 세션이 없거나 비정상일 경우
          const wasLoggedIn = sessionStorage.getItem('hitopAdminLoggedIn') === 'true';
          sessionStorage.removeItem('hitopAdminLoggedIn');
          overlay.classList.remove('hidden');
          mainEl.classList.add('hidden');
          
          // 기존에 세션스토리지 로그인 처리가 되어 있었는데 만료된 경우 리로드하여 초기화
          if (wasLoggedIn) {
            location.reload();
          }
        }
      });
    } catch (err) {
      console.error('Auth 모니터링 초기화 실패:', err);
    }
  })();

  if (sessionStorage.getItem('hitopAdminLoggedIn') !== 'true') {
    const loginBtn   = document.getElementById('loginBtn');
    const loginPw    = document.getElementById('loginPw');
    const loginError = document.getElementById('loginError');
    const doLogin = async () => {
      const pw = loginPw.value;
      try {
        const [{ signInWithEmailAndPassword }, { auth }] = await Promise.all([_fsAuth(), _fsCfg()]);
        // Firebase Auth 로그인 처리 (관리자 이메일 고정)
        await signInWithEmailAndPassword(auth, 'newpajucity@naver.com', pw);
        sessionStorage.setItem('hitopAdminLoggedIn', 'true');
        location.reload();
      } catch (err) {
        console.error('로그인 오류:', err);
        loginError.classList.remove('hidden');
        loginPw.value = '';
        loginPw.focus();
      }
    };
    loginBtn?.addEventListener('click', doLogin);
    loginPw?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    return false;
  }
  
  overlay.classList.add('hidden');
  mainEl.classList.remove('hidden');

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-flex';
    logoutBtn.addEventListener('click', async () => {
      try {
        const [{ signOut }, { auth }] = await Promise.all([_fsAuth(), _fsCfg()]);
        await signOut(auth);
      } catch (err) {
        console.error('로그아웃 중 오류:', err);
      }
      sessionStorage.removeItem('hitopAdminLoggedIn');
      location.reload();
    });
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
  let _listings = [];

  // ── 카테고리 전체보기 오른쪽 패널 동적 치환 시스템 ──
  let defaultPanelHTML = '';

  const saveDefaultPanelHTML = () => {
    const lpPanel = document.getElementById('lpPanel');
    if (lpPanel && !defaultPanelHTML) {
      defaultPanelHTML = lpPanel.innerHTML;
    }
  };

  const restoreDefaultPanel = () => {
    const lpPanel = document.getElementById('lpPanel');
    if (lpPanel && defaultPanelHTML) {
      lpPanel.innerHTML = defaultPanelHTML;
      // 카테고리 카드 액티브 스타일 초기화
      document.querySelectorAll('.cat-card').forEach(card => {
        card.classList.remove('active');
      });
    }
  };

  const getPremiumSampleData = (categoryKey) => {
    const samples = {
      '공장창고': [
        { id: 'f1', dealType: '임대', priceText: '5,000/500만원', title: '도로변 / 즉시입주 가능', buildingArea: 250, landArea: 1200, displayAddress: '경기 파주시', ribbon: '도로바로진입' },
        { id: 'f2', dealType: '임대', priceText: '2,000/180만원', title: '민원 없는 지역 / 추천', buildingArea: 120, landArea: 500, displayAddress: '파주시 탄현면', ribbon: '추천매물' },
        { id: 'f3', dealType: '임대', priceText: '7,000/700만원', title: '단독공장 가능 / 마당 넓음', buildingArea: 300, landArea: 1500, displayAddress: '파주시 상지석동', ribbon: '즉시입주' },
        { id: 'f4', dealType: '매매', priceText: '25억원', title: '대형 물류창고 / 야드 우수', buildingArea: 600, landArea: 2000, displayAddress: '파주시 월롱면', ribbon: '추천매물' },
        { id: 'f5', dealType: '임대', priceText: '3,000/250만원', title: '마당 넓고 민원 없는 단독 공장', buildingArea: 150, landArea: 800, displayAddress: '파주시 탄현면', ribbon: '단독공장' },
        { id: 'f6', dealType: '매매', priceText: '15억원', title: '신축 공장 / 층고 10m 최상급', buildingArea: 200, landArea: 800, displayAddress: '파주시 월롱IC 인근', ribbon: '신축공장' }
      ],
      '상가': [
        { id: 's1', dealType: '임대', priceText: '3,000/350만원', title: '유동인구 우수 / 수익형', exclusiveArea: 40, floor: '1층 상가', displayAddress: '운정역 인근', ribbon: '수익형' },
        { id: 's2', dealType: '매매', priceText: '13억원', title: '코너 상가 / 수익률 양호', exclusiveArea: 72, floor: '병원 운영중', displayAddress: '운정신도시', ribbon: '추천매물' },
        { id: 's3', dealType: '임대', priceText: '5,000/290만원', title: '단지내 상가 / 추천업종 다수', exclusiveArea: 28, floor: '1층 코너', displayAddress: '초롱꽃마을', ribbon: '즉시입주' },
        { id: 's4', dealType: '임대', priceText: '6,000/500만원', title: '1층 식당 추천 / 권리금 없음', exclusiveArea: 55, floor: '2층 대로변', displayAddress: '운정역 중심상권', ribbon: '수익형' },
        { id: 's5', dealType: '임대', priceText: '4,000/320만원', title: '야당역 역세권 유동인구 최우수', exclusiveArea: 35, floor: '야당동', displayAddress: '야당동', ribbon: '역세권' },
        { id: 's6', dealType: '매매', priceText: '35억원', title: '올근생 꼬마빌딩 / 안정적 수익', exclusiveArea: 120, floor: '5층 건물', displayAddress: '운정역 역세권', ribbon: '수익형빌딩' }
      ],
      '토지': [
        { id: 't1', dealType: '매매', priceText: '12억원', title: '건축 허가 완료 / 즉시 개발 가능', landArea: 450, zoningArea: '계획관리지역', displayAddress: '파주시 송촌동', ribbon: '즉시개발' },
        { id: 't2', dealType: '매매', priceText: '8억 5,000만원', title: '도로 접함 / 단독주택 부지 강추', landArea: 320, zoningArea: '자연녹지', displayAddress: '파주시 문산읍', ribbon: '주택부지' },
        { id: 't3', dealType: '매매', priceText: '28억원', title: '개발 용지 / 야드 공장 부지 추천', landArea: 1500, zoningArea: '계획관리지역', displayAddress: '파주시 파주읍', ribbon: '공장부지' },
        { id: 't4', dealType: '매매', priceText: '6억원', title: '주말농장 가능 / 장기 투자 가치 우수', landArea: 600, zoningArea: '농림지역', displayAddress: '파주시 법원읍', ribbon: '주말농장' },
        { id: 't5', dealType: '매매', priceText: '18억원', title: '창고 건축 부지 / 민원 소지 없음', landArea: 900, zoningArea: '계획관리지역', displayAddress: '파주시 광탄면', ribbon: '창고부지' },
        { id: 't6', dealType: '매매', priceText: '9억 8,000만원', title: '상가주택 용지 / 코너 필지 추천', landArea: 110, zoningArea: '제1종일반주거', displayAddress: '운정신도시', ribbon: '상가용지' }
      ],
      '오피스텔': [
        { id: 'o1', dealType: '매매', priceText: '2억 8,000만원', title: 'GTX-A 운정역 초역세권 / 풀옵션', exclusiveArea: 18, floor: '고층', displayAddress: '운정신도시', ribbon: '초역세권' },
        { id: 'o2', dealType: '전세', priceText: '2억 3,000만원', title: '안심 전세 가능 / 첫 입주 신축', exclusiveArea: 15, floor: '중층', displayAddress: '야당동', ribbon: '신축전세' },
        { id: 'o3', dealType: '월세', priceText: '1,000/85만원', title: '풀옵션 원룸 / 즉시입주 가능', exclusiveArea: 9, floor: '남향', displayAddress: '운정역 부근', ribbon: '원룸풀옵션' },
        { id: 'o4', dealType: '매매', priceText: '3억 2,000만원', title: '복층 구조 / 공간 활용도 최우수', exclusiveArea: 22, floor: '복층', displayAddress: '야당역 초인근', ribbon: '복층구조' },
        { id: 'o5', dealType: '월세', priceText: '2,000/110만원', title: '투룸 오피스텔 / 신혼부부 추천', exclusiveArea: 16, floor: '투룸', displayAddress: '운정신도시', ribbon: '신혼추천' },
        { id: 'o6', dealType: '전세', priceText: '1억 8,000만원', title: '야당역 도보 3분 / 관리 상태 양호', exclusiveArea: 12, floor: '8층', displayAddress: '야당동', ribbon: '초역세권' }
      ],
      '단독주택': [
        { id: 'h1', dealType: '매매', priceText: '9억 5,000만원', title: '정원 넓은 친환경 전원주택', buildingArea: 45, landArea: 150, displayAddress: '파주시 야당동', ribbon: '정원넓음' },
        { id: 'h2', dealType: '매매', priceText: '12억원', title: '고급 자재 사용 / 단독 타운하우스', buildingArea: 60, landArea: 180, displayAddress: '파주시 동패동', ribbon: '고급자재' },
        { id: 'h3', dealType: '매매', priceText: '7억 8,000만원', title: '숲세권 단독주택 / 공기 맑고 조용함', buildingArea: 38, landArea: 120, displayAddress: '파주시 탄현면', ribbon: '숲세권' },
        { id: 'h4', dealType: '전세', priceText: '5억원', title: '신축 단독주택 / 마당 관리 양호', buildingArea: 40, landArea: 130, displayAddress: '파주시 다율동', ribbon: '신축마당' },
        { id: 'h5', dealType: '매매', priceText: '15억원', title: '럭셔리 대저택 / 최고급 마당 조경', buildingArea: 80, landArea: 250, displayAddress: '파주시 운정동', ribbon: '최고급조경' },
        { id: 'h6', dealType: '매매', priceText: '6억 5,000만원', title: '가성비 우수한 단독주택 / 정원 있음', buildingArea: 32, landArea: 100, displayAddress: '파주시 조리읍', ribbon: '가성비단독' }
      ]
    };
    return samples[categoryKey] || [];
  };

  const renderCategoryPanel = (categoryKey) => {
    const lpPanel = document.getElementById('lpPanel');
    if (!lpPanel) return;

    saveDefaultPanelHTML();

    const catNames = {
      '공장창고': '공장·창고',
      '상가': '상가·빌딩',
      '토지': '토지·개발',
      '오피스텔': '오피스텔',
      '단독주택': '단독·전원주택'
    };
    const catName = catNames[categoryKey] || categoryKey;

    // 카테고리 카드 액티브 스타일 적용
    document.querySelectorAll('.cat-card').forEach(card => {
      const href = card.getAttribute('href') || '';
      if (href.includes(`category=${categoryKey}`)) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const allListings = _listings;
    let categoryListings = allListings.filter(item => item.propertyType === categoryKey && item.status !== 'done');

    // 데이터가 전혀 없을 경우 데모용 프리미엄 샘플 데이터 활용
    if (categoryListings.length === 0) {
      categoryListings = getPremiumSampleData(categoryKey);
    }

    const renderCard = (item) => {
      const isFactory = categoryKey === '공장창고';
      const isStore = categoryKey === '상가';
      const isLand = categoryKey === '토지';
      const isOfficetel = categoryKey === '오피스텔';
      const isHouse = categoryKey === '단독주택';

      let imgSrc = 'images/factory_recommend.png';
      if (isStore) imgSrc = 'images/store_recommend.png';
      else if (isLand) imgSrc = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400';
      else if (isOfficetel) imgSrc = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400';
      else if (isHouse) imgSrc = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400';

      let areaHighlightHTML = '';
      if (isFactory) {
        const areaVal = item.buildingArea || item.area || 250;
        const landVal = item.landArea || 1200;
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">창고</span> <strong class="lp-area-val">${areaVal}평</strong></span> <span class="lp-area-extra">· 대지 ${landVal}㎡</span>`;
      } else if (isStore) {
        const areaVal = item.exclusiveArea || item.area || 40;
        const extraVal = item.floor || '1층 상가';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">전용</span> <strong class="lp-area-val">${areaVal}평</strong></span> <span class="lp-area-extra">· ${extraVal}</span>`;
      } else if (isLand) {
        const areaVal = item.landArea || item.area || 450;
        const extraVal = item.zoningArea || '계획관리';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">대지</span> <strong class="lp-area-val">${areaVal}평</strong></span> <span class="lp-area-extra">· ${extraVal}</span>`;
      } else if (isOfficetel) {
        const areaVal = item.exclusiveArea || item.area || 18;
        const extraVal = item.floor || '고층';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">전용</span> <strong class="lp-area-val">${areaVal}평</strong></span> <span class="lp-area-extra">· ${extraVal}</span>`;
      } else if (isHouse) {
        const areaVal = item.buildingArea || item.area || 45;
        const landVal = item.landArea || 150;
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">건물</span> <strong class="lp-area-val">${areaVal}평</strong></span> <span class="lp-area-extra">· 대지 ${landVal}평</span>`;
      }

      const cardThemeClass = isFactory ? 'factory-card' : 'store-card';
      const typeLabel = catNames[categoryKey] || categoryKey;
      const ribbonText = item.ribbon || '추천매물';

      return `
        <div class="lp-rec-card ${cardThemeClass}" data-id="${item.id || ''}" style="cursor: pointer;">
          <div class="lp-rec-img-wrap">
            <img src="${imgSrc}" alt="${typeLabel}" class="lp-rec-img" />
            <div class="lp-rec-ribbon">${ribbonText}</div>
          </div>
          <div class="lp-rec-body">
            <div class="lp-rec-row lp-rec-row-top">
              <div class="lp-rec-type ${isFactory ? 'type-factory' : 'type-store'}">${typeLabel}</div>
              <span class="lp-badge-deal ${isFactory ? 'lp-badge-factory-rent' : 'lp-badge-store-rent'}">${item.dealType}</span>
            </div>
            <div class="lp-rec-row lp-rec-row-price">
              <div class="lp-rec-price">${item.priceText || (item.dealType + ' ' + formatPrice(getMainPrice(item)) + '만원')}</div>
            </div>
            <div class="lp-rec-row lp-rec-row-mid">
              ${item.title || item.description}
            </div>
            <div class="lp-rec-row lp-rec-row-area">
              ${areaHighlightHTML}
            </div>
            <div class="lp-rec-row lp-rec-row-bot">
              ${item.displayAddress || item.address}
            </div>
          </div>
        </div>
      `;
    };

    // 2컬럼 레이아웃으로 분산 정렬
    const leftListings = categoryListings.filter((_, idx) => idx % 2 === 0);
    const rightListings = categoryListings.filter((_, idx) => idx % 2 === 1);

    const leftHTML = leftListings.map(renderCard).join('');
    const rightHTML = rightListings.map(renderCard).join('');

    lpPanel.innerHTML = `
      <div class="lp-cat-view" id="lpCatView">
        <div class="lp-cat-view-header">
          <h3 class="lp-cat-view-title">
            <span>📂 ${catName} 전체매물</span>
            <button class="lp-cat-back-btn" id="lpCatBackBtn">추천매물 보기로 돌아가기 ↩</button>
          </h3>
        </div>
        <div class="lp-cat-2col-scroll">
          <div class="lp-cat-2col-grid">
            <div class="lp-cat-col-left">
              ${leftHTML}
            </div>
            <div class="lp-cat-col-right">
              ${rightHTML}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('lpCatBackBtn')?.addEventListener('click', () => {
      restoreDefaultPanel();
    });

    lpPanel.querySelectorAll('.lp-rec-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (id) {
          const found = allListings.find(x => x.id === id);
          if (found) openModalFull(found);
        }
      });
    });

    // 스크롤 상단으로 초기화
    document.querySelector('.lp-cat-2col-scroll')?.scrollTo(0, 0);
  };

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
    const all = _listings;
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

  // ── 지도 초기화 (autoload=false 방식) ──
  window.addEventListener('load', () => {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof kakao === 'undefined') return;
    kakao.maps.load(() => {
      mapEl.innerHTML = '';
      map = new kakao.maps.Map(mapEl, {
        center: new kakao.maps.LatLng(37.7512, 126.7820),
        level: 7
      });
      applyFilters();
    });
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
    if (typeof kakao === 'undefined' || !kakao.maps.services || !item.address) return;
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
    const all  = _listings;
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
          const found = _listings.find(x => x.id === card.dataset.id);
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
          ${isRec(item) ? '<span style="position:absolute;top:6px;right:6px;background:#C9A84C;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;line-height:1.4;">⭐ 추천</span>' : ''}
          ${item.isUrgent===true ? '<span style="position:absolute;bottom:6px;right:6px;background:#e53e3e;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;line-height:1.4;">🔥 급매</span>' : ''}
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
      });
    }
  };

  // ── 필터 실행 ──
  const applyFilters = () => {
    const effectiveCat  = flt.cat  || flt.formCat;
    const effectiveDeal = flt.deal || flt.formDeal;
    let items = [..._listings];
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

  // ── 빠른 문의 폼 ──
  document.getElementById('sideInquiryForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name  = (document.getElementById('inquiryName')?.value  || '').trim();
    const phone = (document.getElementById('inquiryPhone')?.value || '').trim();
    if (!name || !phone) { alert('이름과 연락처를 입력해주세요.'); return; }
    const agree = document.getElementById('agreePrivacySide');
    if (agree && !agree.checked) { alert('개인정보 수집 및 이용에 동의해주셔야 상담신청이 가능합니다.'); return; }
    alert(`상담 문의가 접수되었습니다.\n담당자가 빠른 시일 내에 연락드리겠습니다.\n\n이름: ${name}\n연락처: ${phone}`);
    e.target.reset();
  });

  // ── 전체 매물 보기 버튼 (패널 하단) ──
  document.getElementById('btnScrollToAll')?.addEventListener('click', () => {
    document.getElementById('lp-bottom')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ── 하단 카테고리 카드 클릭 이벤트 바인딩 ──
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      
      const href = card.getAttribute('href') || '';
      let cat = '';
      if (href.includes('category=공장창고')) cat = '공장창고';
      else if (href.includes('category=상가')) cat = '상가';
      else if (href.includes('category=토지')) cat = '토지';
      else if (href.includes('category=오피스텔')) cat = '오피스텔';
      else if (href.includes('category=단독주택')) cat = '단독주택';
      
      if (cat) {
        renderCategoryPanel(cat);
      }
    });
  });

  // ── URL 파라미터 ──
  const urlCat = new URLSearchParams(window.location.search).get('category');
  if (urlCat) {
    flt.cat = urlCat;
    const catSel = document.getElementById('formCatSelect');
    if (catSel) catSel.value = urlCat;
  }

  // 초기 렌더
  saveDefaultPanelHTML();

  (async () => {
    const cardsEl = document.getElementById('listingCards');
    if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 목록을 불러오는 중...</div>';
    try {
      _listings = await readListingsFromFirestore();
    } catch (err) {
      console.error('Firestore 매물 조회 오류:', err);
      if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 정보를 불러오지 못했습니다.</div>';
      return;
    }
    applyFilters();
    if (urlCat) renderCategoryPanel(urlCat);
  })();
};

// ─────────────────────────────────────────────
// index.html
// ─────────────────────────────────────────────
const setupHomePage = () => {
  const recentEl      = document.getElementById('homeRecentListings');
  const recommendedEl = document.getElementById('homeRecommendedListings');
  if (!recentEl && !recommendedEl) return;

  const cardHTML = item => `
    <a class="home-listing-card" href="listings.html" title="${item.title}">
      <div class="hlc-img">
        ${getThumbnail(item) ? `<img src="${getThumbnail(item)}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
        <span class="card-badge">${item.propertyType}</span>
      </div>
      <div class="hlc-body">
        <div class="hlc-address">${getDisplayAddress(item)}</div>
        <div class="hlc-title">${item.title}</div>
        <div class="hlc-price">${item.dealType} ${formatPrice(getMainPrice(item))}만원</div>
      </div>
    </a>
  `;

  const renderSection = (el, items, emptyMsg) => {
    if (!el) return;
    el.innerHTML = items.length
      ? items.map(cardHTML).join('')
      : `<p style="color:#999;padding:16px 0;">${emptyMsg}</p>`;
  };

  (async () => {
    try {
      const all    = await readListingsFromFirestore();
      const active = all.filter(i => i.status !== 'done');
      renderSection(recommendedEl, active.filter(i => i.isRecommended === true).slice(0, 6), '등록된 추천매물이 없습니다.');
      renderSection(recentEl,      active.slice(0, 6), '등록된 매물이 없습니다.');
    } catch (err) {
      console.error('Firestore 메인페이지 매물 조회 오류:', err);
      [recommendedEl, recentEl].forEach(el => {
        if (el) el.innerHTML = '<p style="color:#999;padding:16px 0;">매물 정보를 불러오지 못했습니다.</p>';
      });
    }
  })();
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
  let _allListings = [];

  // ── 필드 헬퍼 (신·구 호환) ──
  const isCompleted = i => i.is_completed === true || i.status === 'done';
  const isRec       = i => i.is_recommended === true || i.isRecommended === true;
  const isNew       = i => i.is_new === true;
  const getPropNo   = i => i.property_number || i.listingNo || '-';

  // ── 통계 업데이트 ──
  const updateStats = () => {
    const all  = _allListings;
    const done = all.filter(isCompleted).length;
    const rec  = all.filter(isRec).length;
    const urgent = all.filter(i => i.isUrgent === true).length; // 급매물 수 계산 지원
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
                  <a href="admin-register.html?edit=${item.id}" class="adm-btn adm-btn-edit" style="text-decoration:none;">✏️ 수정</a>
                  <a href="admin-listings.html" class="adm-btn adm-btn-manage" style="text-decoration:none; background:#4a5568; color:#fff;">📂 관리</a>
                </div>
              </div>
            </article>`;
        }).join('')
      : '<p style="padding:24px;color:#999;">조건에 맞는 매물이 없습니다.</p>';
  };

  // ── 필터 적용 ──
  const applyFilters = () => {
    let listings = [..._allListings];
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

  (async () => {
    listEl.innerHTML = '<p style="padding:24px;color:#999;">대시보드 데이터를 불러오는 중...</p>';
    try {
      const isAuthed = await waitForAdminAuth();
      if (!isAuthed) {
        listEl.innerHTML = '<p style="padding:24px;color:#e53e3e;">관리자 인증이 완료되지 않았습니다.</p>';
        return;
      }
      _allListings = await readListingsFromFirestore();
      applyFilters();
    } catch (err) {
      console.error('Firestore 대시보드 매물 조회 오류:', err);
      listEl.innerHTML = '<p style="padding:24px;color:#e53e3e;">대시보드 데이터를 불러오지 못했습니다.</p>';
    }
  })();
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
    (async () => {
      try {
        const isAuthed = await waitForAdminAuth();
        if (!isAuthed) return;
        const [{ doc, getDoc }, { db, LISTINGS_COLLECTION }] = await Promise.all([_fsListings(), _fsCfg()]);
        const snap = await getDoc(doc(db, LISTINGS_COLLECTION, editId));
        if (!snap.exists()) { alert('매물을 찾을 수 없습니다.'); return; }
        const target = normalizeFirestoreListing(snap);

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
            el.value = value ?? '';
          }
        });
        syncFlagStyle(chkRec, lblRec);
        syncFlagStyle(chkUrg, lblUrg);

        imageContainer.innerHTML = '';
        const urls = (target.imageUrls && target.imageUrls.length)
          ? target.imageUrls : (target.imageUrl ? [target.imageUrl] : []);
        urls.forEach((url) => addImageRow(url));
        if (!urls.length) addImageRow();
        const noDisp = document.getElementById('listingNoDisplay');
        if (noDisp) noDisp.textContent = target.listingNo || '-';
        const pyEl = document.getElementById('areaPyeong');
        if (pyEl && target.area) pyEl.textContent = toPyeong(target.area);
        const koEl = document.getElementById('priceKorean');
        if (koEl && target.price) koEl.textContent = toKoreanPrice(target.price);
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.classList.remove('hidden');
      } catch (err) {
        console.error('매물 조회 오류:', err);
        alert('매물을 불러오지 못했습니다.');
      }
    })();
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

    if (payload.id) {
      // 수정 — Firestore updateDoc
      const docId = payload.id;
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      (async () => {
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInFirestore(docId, payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 수정 오류:', err);
          alert('매물 수정 중 오류가 발생했습니다.');
        }
      })();
    } else {
      // 신규 등록 — Firestore 저장
      if (!payload.listingNo) payload.listingNo = getNextPropertyNumber();
      if (!payload.property_number) payload.property_number = payload.listingNo;
      if (!payload.status) payload.status = '';
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      (async () => {
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await createListingInFirestore(payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 등록 오류:', err);
          alert('매물 등록 중 오류가 발생했습니다.');
        }
      })();
    }
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
  let _allListings = [];

  const applyFilters = () => {
    const search   = (document.getElementById('searchInput')?.value||'').toLowerCase();
    const category = document.getElementById('filterCategory')?.value||'';
    const dealType = document.getElementById('filterDealType')?.value||'';
    const status   = document.getElementById('filterStatus')?.value||'';
    let listings = [..._allListings];
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
    if (action==='delete') {
      if(!confirm('정말 삭제하시겠습니까?'))return;
      (async()=>{
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await deleteListingFromFirestore(id);
          _allListings=_allListings.filter(i=>i.id!==id);
          applyFilters();
        } catch(err) {
          console.error('매물 삭제 오류:',err);
          alert('매물 삭제 중 오류가 발생했습니다.');
        }
      })();
    }
    if (action==='done') {
      const newStatus=(_allListings.find(i=>i.id===id)?.status==='done')?'':'done';
      (async()=>{
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInFirestore(id,{status:newStatus});
          _allListings=_allListings.map(i=>i.id===id?{...i,status:newStatus}:i);
          applyFilters();
        } catch(err) {
          console.error('거래완료 처리 오류:',err);
          alert('거래완료 처리 중 오류가 발생했습니다.');
        }
      })();
    }
  });

  (async () => {
    listEl.innerHTML = '<p style="padding:24px;color:#6B7280;">매물 목록을 불러오는 중...</p>';
    try {
      const isAuthed = await waitForAdminAuth();
      if (!isAuthed) {
        listEl.innerHTML = '<p style="padding:24px;color:#e53e3e;">관리자 인증이 완료되지 않았습니다.</p>';
        return;
      }
      _allListings = await readListingsFromFirestore();
    } catch (err) {
      console.error('Firestore 매물 조회 오류:', err);
      listEl.innerHTML = '<p style="padding:24px;color:#e53e3e;">매물 정보를 불러오지 못했습니다.</p>';
      return;
    }
    applyFilters();
  })();
};

// ─────────────────────────────────────────────
// 진입점
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  const page = document.body.dataset.page;
  if      (page === 'home')             setupHomePage();
  else if (page === 'listings')         setupListingsPage();
  else if (page === 'admin-dashboard')       setupAdminDashboard();
  else if (page === 'admin-register')        setupAdminRegister();
  else if (page === 'admin-listings')        setupAdminListingsMgmt();
  else if (page === 'admin-consults')        requireAdminLogin();
  else if (page === 'admin-consult-detail')  requireAdminLogin();

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
