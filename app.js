console.log('app.js 로드됨!');
const STORAGE_KEY = 'hitop_listings_v1';

// 매물종류 표시 라벨 (전역 — 모든 함수에서 접근 가능)
const CAT_LABELS = {
  // ── 레거시 propertyType 라벨 ──
  '공장창고':         '공장·창고',
  '공장·창고':        '공장·창고',
  '상가':             '상가·사무실',
  '상가빌딩':         '상가·사무실',
  '상가·빌딩':        '상가·사무실',
  '토지':             '토지',
  '오피스텔':         '오피스텔',
  '힐스테이트더운정': '아파트',
  '단독주택':         '단독·전원주택',
  '단독전원주택':     '단독·전원주택',
  '단독·전원주택':    '단독·전원주택',
  // ── 신규 category1 라벨 ──
  '상가사무실':     '상가·사무실',
  '주거용':         '주거용',
  '단독전원주택_c': '단독·전원주택',  // category1 키는 아래 CATEGORY_MAP 참조
  '건물빌딩':       '건물·빌딩',
};

// 1차 매물구분 → 2차 옵션 매핑
const CATEGORY_MAP = {
  '공장창고':     ['공장', '창고'],
  '상가사무실':   ['상가', '사무실'],
  '토지':         ['토지'],
  '주거용':       ['아파트', '오피스텔'],
  '단독전원주택': ['단독주택', '전원주택'],
  '건물빌딩':     ['건물', '빌딩'],
};

// 기존 propertyType → category1 매핑 (레거시 폴백)
const PT_TO_CAT1 = {
  '공장창고': '공장창고', '공장·창고': '공장창고',
  '상가': '상가사무실', '상가빌딩': '상가사무실', '상가·빌딩': '상가사무실',
  '상가·빌딩·사무실': '상가사무실', '사무실': '상가사무실', '오피스': '상가사무실',
  '토지': '토지', '토지·개발': '토지',
  '오피스텔': '주거용',
  '힐스테이트더운정': '주거용',
  '단독주택': '단독전원주택', '단독전원주택': '단독전원주택', '단독·전원주택': '단독전원주택',
  '건물': '건물빌딩', '빌딩': '건물빌딩', '건물빌딩': '건물빌딩',
};

// 기존 propertyType → category2 매핑
const PT_TO_CAT2 = {
  '공장창고': '공장', '공장·창고': '공장',
  '상가': '상가', '상가빌딩': '상가', '상가·빌딩': '상가', '상가·빌딩·사무실': '상가',
  '사무실': '사무실', '오피스': '사무실',
  '토지': '토지',
  '오피스텔': '오피스텔',
  '힐스테이트더운정': '아파트',
  '단독주택': '단독주택', '단독전원주택': '단독주택', '단독·전원주택': '단독주택',
  '건물': '건물', '빌딩': '빌딩', '건물빌딩': '빌딩',
};

// 신규 category1/category2 → 하위호환 propertyType 도출
const derivePropertyType = (cat1, cat2) => {
  if (cat1 === '공장창고')     return '공장창고';
  if (cat1 === '상가사무실')   return '상가';
  if (cat1 === '토지')         return '토지';
  if (cat1 === '주거용')       return cat2 === '아파트' ? '힐스테이트더운정' : '오피스텔';
  if (cat1 === '단독전원주택') return '단독주택';
  if (cat1 === '건물빌딩')     return '건물빌딩';
  return cat1 || '';
};

// item에서 category1 도출 (신규 필드 우선, 없으면 레거시 매핑)
const getCategory1 = (item) => {
  if (item.category1) return item.category1;
  return PT_TO_CAT1[item.propertyType || ''] || item.propertyType || '';
};

// category1 표시 라벨 (사이드바·카드 등)
const CAT1_DISPLAY = {
  '공장창고':     '공장·창고',
  '상가사무실':   '상가·사무실',
  '토지':         '토지',
  '주거용':       '주거용',
  '단독전원주택': '단독·전원주택',
  '건물빌딩':     '건물·빌딩',
};

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
      '매매': [{key:'salePrice',label:'매매가',money:true},{key:'presalePrice',label:'분양가',money:true},{key:'premium',label:'권리금'}],
      '임대': [{key:'deposit',label:'보증금',money:true},{key:'monthlyRent',label:'월세',money:true},{key:'premium',label:'권리금'},{key:'managementFee',label:'관리비'}]
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
      '매매': [{key:'salePrice',label:'매매가',money:true},{key:'presalePrice',label:'분양가',money:true}],
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
const _supabaseCfg = () => import('./supabase-config.js');

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
const normalizeImageUrl = (url) => {
  if (!url) return '';
  const str = String(url).trim();

  const driveMatch = str.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }

  const idMatch = str.match(/[?&]id=([^&]+)/);
  if (str.includes('drive.google.com') && idMatch && idMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
  }

  return str;
};

// 매물종류별 기본 샘플 이미지 (사진 없을 때 fallback)
const DEFAULT_IMAGES = {
  '공장창고':     'images/factory_recommend.png',
  '상가사무실':   'images/store_recommend.png',
  '토지':         'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  '주거용':       'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  '단독전원주택': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  '건물빌딩':     'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
};
const FALLBACK_IMAGE = 'images/hitoplogo.png';

const getDefaultImageByCategory = (cat1) =>
  DEFAULT_IMAGES[cat1] || FALLBACK_IMAGE;

// 1순위: Supabase 업로드 URL  2순위: 직접 입력 URL  3순위: 매물종류 기본 이미지
const getThumbnail = (item) => {
  const raw = (item.imageUrls && item.imageUrls[0]) || item.imageUrl || '';
  if (raw) return normalizeImageUrl(raw);
  return getDefaultImageByCategory(getCategory1(item));
};
const getDisplayAddress = (item) => item.displayAddress || item.address;
const getMainPrice  = (item) => item.deposit || item.salePrice || item.price || 0;

const getDealBadgeHTML = (dealType) => {
  if (!dealType) return '';
  const classMap = {
    '매매': 'deal-badge-mae',
    '임대': 'deal-badge-im',
    '전세': 'deal-badge-jeon',
    '월세': 'deal-badge-wol',
    '분양': 'deal-badge-bun'
  };
  const cls = classMap[dealType] || 'deal-badge-etc';
  return `<span class="deal-badge ${cls}">${dealType}</span>`;
};

// 만원 단위 숫자를 한국어 가격 문자열로 변환 (예: 15000 → "1억 5,000만원")
const toKoreanPrice = (wanwon) => {
  const n = Number(wanwon);
  if (!n || isNaN(n) || n <= 0) return '';
  const eok = Math.floor(n / 10000);
  const man = n % 10000;
  if (eok && man) return `${eok}억 ${man.toLocaleString('ko-KR')}만원`;
  if (eok) return `${eok}억원`;
  return `${n.toLocaleString('ko-KR')}만원`;
};

// 원(won) 단위 값을 만원 단위 정수로 변환 (10,000 이상이면 원 단위로 간주)
const wonToManwon = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/[,\s]/g, ''));
  if (isNaN(n) || n <= 0) return null;
  return n >= 10000 ? Math.round(n / 10000) : n;
};

// 모든 매물 카드·마커·패널에서 공통으로 사용하는 가격 표시 함수
//
// ★ 단위 저장 규칙
//   - salePrice / presalePrice / deposit(전세) / price : 만원 단위 저장
//     → toKoreanPrice() 직접 적용 (wonToManwon 불필요)
//   - deposit(월세/임대) / monthlyRent                : 원 단위 저장
//     → wonToManwon() 으로 만원 변환 후 표시
//
// 거래유형별 표시 예시
//   매매  1,400,000 → "140억원"
//   전세     23,000 → "2억 3,000만원"
//   월세  deposit:10,000,000 / monthlyRent:600,000 → "1,000/60만원"
//   없음                                           → "가격문의"
const formatPropertyPrice = (item) => {
  if (item.priceText) return item.priceText;

  // 만원 단위 값을 억/만원 한국어 문자열로 변환
  const fmtManwon = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    return (!isNaN(n) && n > 0) ? toKoreanPrice(n) : null;
  };

  const deal = item.dealType || '';

  if (deal === '매매') {
    return fmtManwon(item.salePrice ?? item.price) || '가격문의';
  }
  if (deal === '전세') {
    return fmtManwon(item.deposit ?? item.price) || '가격문의';
  }
  if (deal === '월세' || deal === '임대') {
    // deposit·monthlyRent 는 원 단위 → wonToManwon 적용
    const dep  = wonToManwon(item.deposit);
    const rent = wonToManwon(item.monthlyRent ?? item.rent);
    if (dep && rent) return `${dep.toLocaleString('ko-KR')}/${rent.toLocaleString('ko-KR')}만원`;
    if (dep)  return `${dep.toLocaleString('ko-KR')}만원`;
    if (rent) return `${rent.toLocaleString('ko-KR')}만원`;
    return fmtManwon(item.price) || '가격문의';
  }
  if (deal === '분양') {
    return fmtManwon(item.presalePrice ?? item.salePrice) || '가격문의';
  }
  return fmtManwon(item.salePrice ?? item.deposit ?? item.price) || '가격문의';
};

// 하위 호환 별칭 (기존 코드에서 formatCardPrice 직접 참조가 남아 있을 경우 대비)
const formatCardPrice = formatPropertyPrice;

// 카드용 면적 HTML — 샘플 카드와 동일한 lp-area-highlight 스타일 사용
const getCardAreaHTML = (item) => {
  const cat1 = getCategory1(item);
  const fmtA = (m2, py) => {
    const m = m2 !== undefined && m2 !== null ? Number(m2).toFixed(2) : null;
    const p = py !== undefined && py !== null ? Number(py).toFixed(2) : null;
    const mv = m || (p ? (Number(p) * 3.305785).toFixed(2) : null);
    const pv = p || (m ? (Number(m) / 3.305785).toFixed(2) : null);
    if (mv && pv) return `${mv}㎡ / ${pv}평`;
    return mv ? `${mv}㎡` : pv ? `${pv}평` : '';
  };
  const lbl = (tag, str, extra) =>
    str ? `<span class="lp-area-highlight"><span class="lp-area-lbl">${tag}</span> <strong class="lp-area-val">${str}</strong></span>${extra ? ` <span class="lp-area-extra">· ${extra}</span>` : ''}` : '';

  if (cat1 === '공장창고') {
    const s = fmtA(item.buildingAreaM2 ?? item.buildingArea, item.buildingAreaPy);
    const e = (item.landAreaM2 ?? item.landArea) ? `대지 ${Number(item.landAreaM2 ?? item.landArea).toFixed(2)}㎡` : '';
    return lbl('건축', s, e);
  }
  if (cat1 === '상가사무실') {
    const es = fmtA(item.exclusiveAreaM2 ?? item.exclusiveArea, item.exclusiveAreaPy);
    const ss = fmtA(item.supplyAreaM2 ?? item.contractArea, item.supplyAreaPy);
    return es ? `<span class="lp-area-highlight"><span class="lp-area-lbl">전용</span> <strong class="lp-area-val">${es}</strong>${ss ? ` · <span class="lp-area-lbl">공급</span> <strong class="lp-area-val">${ss}</strong>` : ''}</span>` : '';
  }
  if (cat1 === '토지') {
    const s = fmtA(item.areaM2 ?? item.landArea ?? item.area, item.areaPy);
    return lbl('토지', s, item.zoningArea || '');
  }
  if (cat1 === '주거용') {
    const s = fmtA(item.exclusiveAreaM2 ?? item.exclusiveArea, item.exclusiveAreaPy);
    return lbl('전용', s, item.floorInfo || item.floor || '');
  }
  if (cat1 === '단독전원주택' || cat1 === '건물빌딩') {
    const s = fmtA(item.buildingAreaM2 ?? item.buildingArea ?? item.area, item.buildingAreaPy ?? item.areaPy);
    const e = (item.landAreaM2 ?? item.landArea) ? `대지 ${Number(item.landAreaM2 ?? item.landArea).toFixed(2)}㎡` : '';
    return lbl('건물', s, e);
  }
  // 폴백: 어떤 면적이든 있으면 표시
  const sqm = item.areaM2 ?? item.area ?? item.exclusiveArea ?? item.buildingArea ?? item.landArea;
  const py  = item.areaPy ?? item.exclusiveAreaPy ?? item.buildingAreaPy;
  const s   = fmtA(sqm, py);
  return s ? `<span class="lp-area-highlight"><strong class="lp-area-val">${s}</strong></span>` : '';
};

const m2ToPy = (sqm) => {
  const n = Number(sqm);
  if (!n || isNaN(n) || n <= 0) return '';
  return String(Math.round(n / 3.305785));
};
const pyToM2 = (py) => {
  const n = Number(py);
  if (!n || isNaN(n) || n <= 0) return '';
  return (n * 3.305785).toFixed(2);
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
  const pt     = item.propertyType || '';
  const images = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
  const _mCat1      = item.category1 || PT_TO_CAT1[pt] || '';
  const _mCat2      = item.category2 || PT_TO_CAT2[pt] || '';
  const isFactory   = _mCat1 === '공장창고';
  const isStoreType = _mCat1 === '상가사무실';
  const isBuildingType  = _mCat1 === '공장창고' || _mCat1 === '단독전원주택' || _mCat1 === '건물빌딩';
  const isExclusiveType = _mCat1 === '상가사무실' || _mCat1 === '주거용';
  const isLandType      = _mCat1 === '토지';

  // ── 헤더 ──
  document.getElementById('modalId').textContent = item.property_number || item.listingNo || item.id;
  document.getElementById('modalTitle').textContent = item.title;

  // ── 뱃지 ──
  const modalBadgeEl = document.getElementById('modalBadge');
  if (modalBadgeEl) {
    const propClassMap = {
      // 신규 category1
      '공장창고': 'prop-factory', '상가사무실': 'prop-store',
      '토지': 'prop-land', '주거용': 'prop-officetel',
      '단독전원주택': 'prop-house', '건물빌딩': 'prop-store',
      // 레거시 propertyType
      '공장·창고': 'prop-factory',
      '상가': 'prop-store', '상가·빌딩': 'prop-store', '상가빌딩': 'prop-store',
      '오피스텔': 'prop-officetel', '힐스테이트더운정': 'prop-hillstate',
      '단독주택': 'prop-house', '단독·전원주택': 'prop-house',
    };
    const _badgeCat1 = _mCat1 || pt;
    const propCls = propClassMap[_badgeCat1] || propClassMap[pt] || 'prop-etc';
    const _badgeLabel = CAT1_DISPLAY[_mCat1] || CAT_LABELS[pt] || pt;
    modalBadgeEl.innerHTML = `<span class="modal-prop-badge ${propCls}">${_badgeLabel}</span>${getDealBadgeHTML(item.dealType)}`;
  }
  document.getElementById('modalAddress').textContent = getDisplayAddress(item);

  // ── 오른쪽 패널: 가격 표시 ──
  const cfg = PROPERTY_FIELDS[pt] || {};
  const priceFields = (cfg.priceConfig || {})[item.dealType] || [];
  const _isRentDeal = item.dealType === '월세' || item.dealType === '임대';
  const renderPriceVal = (f, val) => {
    if (!f.money) return val;
    const n = Number(String(val).replace(/[,\s]/g, ''));
    if (isNaN(n) || n <= 0) return String(val);
    // deposit·monthlyRent 가 월세/임대인 경우만 원 단위 → 만원 변환
    const isWonField = _isRentDeal && (f.key === 'deposit' || f.key === 'monthlyRent');
    if (isWonField) {
      const mw = wonToManwon(val);
      return mw != null ? mw.toLocaleString('ko-KR') + '만원' : String(val);
    }
    // 그 외(매매가·분양가·전세보증금 등)는 만원 단위로 저장됐으므로 직접 변환
    return toKoreanPrice(n);
  };
  let priceHTML = '';
  priceFields.forEach(f => {
    const val = item[f.key];
    if (!val && val !== 0) return;
    priceHTML += `<div class="modal-price-row"><span class="price-label">${f.label}</span><strong class="price-value">${renderPriceVal(f, val)}</strong></div>`;
  });
  if (!priceHTML) {
    priceHTML = `<div class="modal-price-row"><span class="price-label">${item.dealType}</span><strong class="price-value">${formatPropertyPrice(item)}</strong></div>`;
  }
  document.getElementById('modalPriceArea').innerHTML = priceHTML;

  // ── 면적 계산 헬퍼 ──
  const _calcArea = (m2val, pyval) => {
    const m2 = (m2val != null && m2val !== '') ? Number(m2val) : NaN;
    const py = (pyval != null && pyval !== '') ? Number(pyval) : NaN;
    const hasM2 = !isNaN(m2) && m2 > 0;
    const hasPy = !isNaN(py) && py > 0;
    if (!hasM2 && !hasPy) return null;
    return { m2: hasM2 ? m2 : py * 3.3058, py: hasPy ? py : m2 / 3.3058 };
  };
  const _fmtM2 = v => Number(v).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const _fmtPy = v => Math.round(Number(v)).toLocaleString('ko-KR');

  // ── 면적정보 통합 (m2str/pystr 반환) ──
  const buildAreaInfo = () => {
    const parts = [];
    if (isBuildingType) {
      // 공장창고 / 단독전원주택 / 건물빌딩: 대지 + 건축 + 연
      const land  = _calcArea(item.landAreaM2  ?? item.landArea,    item.landAreaPy);
      const bldg  = _calcArea(item.buildingAreaM2 ?? item.buildingArea, item.buildingAreaPy);
      const total = _calcArea(item.totalFloorAreaM2 ?? item.totalArea, item.totalFloorAreaPy);
      if (land)  parts.push({ label: '대지', ...land });
      if (bldg)  parts.push({ label: '건축', ...bldg });
      if (total) parts.push({ label: '연',   ...total });
    } else if (isExclusiveType) {
      // 상가사무실 / 주거용: 전용 + 공급
      const excl = _calcArea(item.exclusiveAreaM2 ?? item.exclusiveArea, item.exclusiveAreaPy);
      const sup  = _calcArea(item.supplyAreaM2 ?? item.contractArea, item.supplyAreaPy);
      if (excl) parts.push({ label: '전용', ...excl });
      if (sup)  parts.push({ label: '공급', ...sup });
    } else if (isLandType) {
      // 토지: 토지면적
      const area = _calcArea(item.areaM2 ?? item.area, item.areaPy);
      if (area) parts.push({ label: '토지', ...area });
    } else {
      // 레거시 폴백
      const area = _calcArea(item.areaM2 ?? item.area, item.areaPy);
      if (area) parts.push({ label: '', ...area });
    }
    if (!parts.length) return null;
    const m2str = parts.map(p => p.label ? `${p.label} ${_fmtM2(p.m2)}㎡` : `${_fmtM2(p.m2)}㎡`).join(' / ');
    const pystr = parts.map(p => p.label ? `${p.label} ${_fmtPy(p.py)}평` : `${_fmtPy(p.py)}평`).join(' / ');
    return { m2str, pystr };
  };
  const areaInfo = buildAreaInfo();

  // ── 오른쪽 패널: 면적 하이라이트 ──
  const areaHlEl = document.getElementById('modalAreaHighlight');
  if (areaHlEl) {
    if (areaInfo) {
      areaHlEl.innerHTML = `<div class="area-hl-row"><span class="area-hl-label">면적정보</span><span class="area-hl-value">${areaInfo.m2str}</span></div>`;
      areaHlEl.style.display = '';
    } else {
      areaHlEl.style.display = 'none';
    }
  }

  // ── 왼쪽 패널: 매물정보 표 (구조화된 고정 항목) ──
  // isWon=true  → 원 단위 값 (deposit·monthlyRent for 월세/임대): wonToManwon 변환 후 만원 표시
  // isWon=false → 만원 단위 값 (salePrice·전세deposit 등): toKoreanPrice 직접 변환
  const _fmtPrice = (val, isWon = false) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(String(val).replace(/[,\s]/g, ''));
    if (isNaN(n) || n <= 0) return String(val) || null;
    if (isWon) {
      const mw = wonToManwon(val);
      return mw != null ? mw.toLocaleString('ko-KR') + '만원' : String(val);
    }
    return toKoreanPrice(n);
  };

  const tableRows = [];
  const addRow = (label, value, cls) => {
    const v = (value !== null && value !== undefined && value !== '') ? String(value) : null;
    if (v) tableRows.push({ label, value: v, cls: cls || '' });
  };

  addRow('주소',    getDisplayAddress(item));
  addRow('매물종류', pt);
  addRow('거래유형', item.dealType);

  // 가격 항목 (강조 스타일)
  // 월세/임대의 deposit·monthlyRent 는 원 단위 → isWon=true
  const dep  = _fmtPrice(item.deposit,                   _isRentDeal);
  const rent = _fmtPrice(item.monthlyRent ?? item.rent,  true);
  const sale = _fmtPrice(item.salePrice,                 false);
  const mgmt = item.managementFee;
  const prem = item.premium;
  if (dep)  addRow('보증금', dep,  'info-price-row');
  if (rent) addRow('월세',   rent, 'info-price-row');
  if (sale && !dep) addRow('매매가', sale, 'info-price-row');
  if (mgmt) addRow('관리비', mgmt, 'info-price-row');
  if (prem) addRow('권리금', prem, 'info-price-row');

  // 면적정보 (토글 버튼 포함)
  let areaRowHTML = '';
  if (areaInfo) {
    areaRowHTML = `<tr class="info-area-row">
      <td class="info-label">면적정보</td>
      <td class="info-value">
        <span class="area-info-text" data-m2="${areaInfo.m2str}" data-py="${areaInfo.pystr}">${areaInfo.m2str}</span>
        <button type="button" class="area-unit-btn" data-unit="m2">평</button>
      </td>
    </tr>`;
  }

  addRow('층정보',   item.floorInfo   ?? item.floor);
  addRow('용도지역', item.zoning      ?? item.zoningArea);
  addRow('주차대수', item.parkingCount ?? item.parking);
  addRow('사용승인일', item.approvalDate);

  let tableHTML = tableRows.map(r => {
    const isPrice = r.cls === 'info-price-row';
    return `<tr class="${r.cls}"><td class="info-label">${r.label}</td><td class="info-value${isPrice ? ' info-price-value' : ''}">${r.value}</td></tr>`;
  }).join('');

  // 면적 행은 주소~거래유형 뒤, 가격 뒤, 다른 항목 앞에 삽입
  // 가격 rows 다음, 층정보 앞에 삽입하기 위해 slice 전략 사용
  const priceEndIdx = tableRows.filter(r => r.cls === 'info-price-row').length;
  const fixedRows = tableRows.slice(0, 3).map(r => `<tr class="${r.cls}"><td class="info-label">${r.label}</td><td class="info-value">${r.value}</td></tr>`).join('');
  const priceRows = tableRows.slice(3, 3 + priceEndIdx).map(r => `<tr class="${r.cls}"><td class="info-label">${r.label}</td><td class="info-value info-price-value">${r.value}</td></tr>`).join('');
  const otherRows = tableRows.slice(3 + priceEndIdx).map(r => `<tr class="${r.cls}"><td class="info-label">${r.label}</td><td class="info-value">${r.value}</td></tr>`).join('');
  tableHTML = fixedRows + priceRows + areaRowHTML + otherRows;

  const infoTableEl = document.getElementById('modalInfoTable');
  if (infoTableEl) {
    infoTableEl.innerHTML = tableHTML;
    infoTableEl.querySelectorAll('.area-unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const span = btn.previousElementSibling;
        if (btn.dataset.unit === 'm2') {
          span.textContent = span.dataset.py;
          btn.textContent = '㎡'; btn.dataset.unit = 'py';
        } else {
          span.textContent = span.dataset.m2;
          btn.textContent = '평'; btn.dataset.unit = 'm2';
        }
      });
    });
  }

  // ── 매물설명 (공개 필드 detailDescription만 사용 — 내부메모는 절대 표시 안 함) ──
  const descEl = document.getElementById('modalDesc');
  if (descEl) {
    const descText = item.detailDescription || '';   // description/memo/note 는 내부메모이므로 제외
    descEl.style.whiteSpace = 'pre-line';
    descEl.textContent = descText || '상세 설명 준비중입니다.';
    const descSection = descEl.closest('.modal-desc-section');
    if (descSection) descSection.style.display = '';  // 항상 표시
  }

  const mainImg  = document.getElementById('modalMainImg');
  const thumbsEl = document.getElementById('modalThumbs');
  if (images.length > 0) {
    mainImg.src = normalizeImageUrl(images[0]); mainImg.dataset.index = 0;
    thumbsEl.innerHTML = images.map((url,i) =>
      `<img src="${normalizeImageUrl(url)}" class="modal-thumb${i===0?' active':''}" data-index="${i}" />`
    ).join('');
    thumbsEl.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        mainImg.src = normalizeImageUrl(images[idx]); mainImg.dataset.index = idx;
        thumbsEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
    mainImg.onclick = () => openLightbox(images.map(normalizeImageUrl), parseInt(mainImg.dataset.index));
  } else {
    mainImg.src = ''; thumbsEl.innerHTML = ''; mainImg.onclick = null;
  }

  const printBtn = document.getElementById('modalPrintBtn');
  if (printBtn) {
    printBtn.dataset.id = item.id;
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

// ── 백그라운드 관리자 인증 대기 ──
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
  const ADMIN_PW = 'hitop2025';
  
  (async () => {
    try {
      const [{ onAuthStateChanged }, { auth }] = await Promise.all([_fsAuth(), _fsCfg()]);
      onAuthStateChanged(auth, (user) => {
        if (user && user.email === 'newpajucity@naver.com') {
          const wasLoggedIn = sessionStorage.getItem('hitopAdminLoggedIn') === 'true';
          sessionStorage.setItem('hitopAdminLoggedIn', 'true');
          overlay.classList.add('hidden');
          mainEl.classList.remove('hidden');
          
          if (!wasLoggedIn) {
            location.reload();
          }
        } else {
          const wasLoggedIn = sessionStorage.getItem('hitopAdminLoggedIn') === 'true';
          sessionStorage.removeItem('hitopAdminLoggedIn');
          overlay.classList.remove('hidden');
          mainEl.classList.add('hidden');
          
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

  const CAT_LABELS = {
    '공장창고':         '공장·창고',
    '상가':             '상가·빌딩',
    '토지':             '토지',
    '오피스텔':         '오피스텔',
    '힐스테이트더운정': '힐스테이트더운정',
    '단독주택':         '단독·전원주택',
  };

  const flt = { cat: '', deal: '', kw: '', formCat: '', formDeal: '' };
  let sortMode = 'date';
  let allPage  = 1;
  const ALL_SIZE = 15;
  let filtered = [];
  let _listings = [];

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
      lpPanel.classList.remove('cat-view-mode'); // 패딩 복원
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
        { id: 'f6', dealType: '매매', priceText: '15억원', title: '신축 공장 / 층고 10m 최상급', buildingArea: 200, landArea: 800, displayAddress: '파주시 월롱IC 인근', ribbon: '신축공장' },
        { id: 'f7', dealType: '임대', priceText: '1,000/120만원', title: '소형 물류창고 / 실속형 추천', buildingArea: 80, landArea: 300, displayAddress: '파주시 파주읍', ribbon: '실속창고' },
        { id: 'f8', dealType: '매매', priceText: '42억원', title: '대형 제조 공장 / 동력 300kW', buildingArea: 1200, landArea: 3500, displayAddress: '파주시 법원읍', ribbon: '대형공장' },
        { id: 'f9', dealType: '임대', priceText: '4,500/400만원', title: '식품 공장 가능 / HACCP 인증 완료', buildingArea: 220, landArea: 900, displayAddress: '파주시 조리읍', ribbon: '식품HACCP' },
        { id: 'f10', dealType: '매매', priceText: '18억원', title: 'IC 바로 옆 물류창고 / 입지 우수', buildingArea: 240, landArea: 750, displayAddress: '파주시 월롱면', ribbon: '입지최상' }
      ],
      '상가': [
        { id: 's1', dealType: '임대', priceText: '3,000/350만원', title: '유동인구 우수 / 수익형', exclusiveArea: 40, floor: '1층 상가', displayAddress: '운정역 인근', ribbon: '수익형' },
        { id: 's2', dealType: '매매', priceText: '13억원', title: '코너 상가 / 수익률 양호', exclusiveArea: 72, floor: '병원 운영중', displayAddress: '운정신도시', ribbon: '추천매물' },
        { id: 's3', dealType: '임대', priceText: '5,000/290만원', title: '단지내 상가 / 추천업종 다수', exclusiveArea: 28, floor: '1층 코너', displayAddress: '초롱꽃마을', ribbon: '즉시입주' },
        { id: 's4', dealType: '임대', priceText: '6,000/500만원', title: '1층 식당 추천 / 권리금 없음', exclusiveArea: 55, floor: '2층 대로변', displayAddress: '운정역 중심상권', ribbon: '수익형' },
        { id: 's5', dealType: '임대', priceText: '4,000/320만원', title: '야당역 역세권 유동인구 최우수', exclusiveArea: 35, floor: '야당동', displayAddress: '야당동', ribbon: '역세권' },
        { id: 's6', dealType: '매매', priceText: '35억원', title: '올근생 꼬마빌딩 / 안정적 수익', exclusiveArea: 120, floor: '5층 건물', displayAddress: '운정역 역세권', ribbon: '수익형빌딩' },
        { id: 's7', dealType: '임대', priceText: '2,000/180만원', title: '테라스 보유형 카페 강추', exclusiveArea: 18, floor: '1층 테라스', displayAddress: '야당동 카페거리', ribbon: '테라스카페' },
        { id: 's8', dealType: '매매', priceText: '8억 5,000만원', title: '단지 내 편의점 독점 운영중', exclusiveArea: 15, floor: '1층 코너', displayAddress: '초롱꽃마을', ribbon: '편의점독점' },
        { id: 's9', dealType: '임대', priceText: '1,000/80만원', title: '소형 네일샵/피부관리실 추천', exclusiveArea: 10, floor: '3층 엘베', displayAddress: '운정신도시', ribbon: '여성뷰티추천' },
        { id: 's10', dealType: '매매', priceText: '55억원', title: '대로변 빌딩 / 전층 만실 운용중', exclusiveArea: 380, floor: '8층 빌딩', displayAddress: '파주시 금촌동', ribbon: '전층만실' }
      ],
      '토지': [
        { id: 't1', dealType: '매매', priceText: '12억원', title: '건축 허가 완료 / 즉시 개발 가능', landArea: 450, zoningArea: '계획관리지역', displayAddress: '파주시 송촌동', ribbon: '즉시개발' },
        { id: 't2', dealType: '매매', priceText: '8억 5,000만원', title: '도로 접함 / 단독주택 부지 강추', landArea: 320, zoningArea: '자연녹지', displayAddress: '파주시 문산읍', ribbon: '주택부지' },
        { id: 't3', dealType: '매매', priceText: '28억원', title: '개발 용지 / 야드 공장 부지 추천', landArea: 1500, zoningArea: '계획관리지역', displayAddress: '파주시 파주읍', ribbon: '공장부지' },
        { id: 't4', dealType: '매매', priceText: '6억원', title: '주말농장 가능 / 장기 투자 가치 우수', landArea: 600, zoningArea: '농림지역', displayAddress: '파주시 법원읍', ribbon: '주말농장' },
        { id: 't5', dealType: '매매', priceText: '18억원', title: '창고 건축 부지 / 민원 소지 없음', landArea: 900, zoningArea: '계획관리지역', displayAddress: '파주시 광탄면', ribbon: '창고부지' },
        { id: 't6', dealType: '매매', priceText: '9억 8,000만원', title: '상가주택 용지 / 코너 필지 추천', landArea: 110, zoningArea: '제1종일반주거', displayAddress: '운정신도시', ribbon: '상가용지' },
        { id: 't7', dealType: '매매', priceText: '4억 2,000만원', title: '소규모 전원주택 필지 / 토목 완료', landArea: 150, zoningArea: '계획관리지역', displayAddress: '파주시 탄현면', ribbon: '토목완료' },
        { id: 't8', dealType: '매매', priceText: '45억원', title: '대형 물류 부지 / 도로 조건 최상급', landArea: 3200, zoningArea: '계획관리지역', displayAddress: '파주시 조리읍', ribbon: '대형물류부지' }
      ],
      '오피스텔': [
        { id: 'o1', dealType: '매매', priceText: '2억 8,000만원', title: 'GTX-A 운정역 초역세권 / 풀옵션', exclusiveArea: 18, floor: '고층', displayAddress: '운정신도시', ribbon: '초역세권' },
        { id: 'o2', dealType: '전세', priceText: '2억 3,000만원', title: '안심 전세 가능 / 첫 입주 신축', exclusiveArea: 15, floor: '중층', displayAddress: '야당동', ribbon: '신축전세' },
        { id: 'o3', dealType: '월세', priceText: '1,000/85만원', title: '풀옵션 원룸 / 즉시입주 가능', exclusiveArea: 9, floor: '남향', displayAddress: '운정역 부근', ribbon: '원룸풀옵션' },
        { id: 'o4', dealType: '매매', priceText: '3억 2,000만원', title: '복층 구조 / 공간 활용도 최우수', exclusiveArea: 22, floor: '복층', displayAddress: '야당역 초인근', ribbon: '복층구조' },
        { id: 'o5', dealType: '월세', priceText: '2,000/110만원', title: '투룸 오피스텔 / 신혼부부 추천', exclusiveArea: 16, floor: '투룸', displayAddress: '운정신도시', ribbon: '신혼추천' },
        { id: 'o6', dealType: '전세', priceText: '1억 8,000만원', title: '야당역 도보 3분 / 관리 상태 양호', exclusiveArea: 12, floor: '8층', displayAddress: '야당동', ribbon: '초역세권' },
        { id: 'o7', dealType: '월세', priceText: '500/50만원', title: '단기 임대 가능 / 복층 원룸', exclusiveArea: 7, floor: '복층', displayAddress: '야당동', ribbon: '단기임대' },
        { id: 'o8', dealType: '매매', priceText: '1억 9,000만원', title: '수익률 높은 월세 매물 승계', exclusiveArea: 11, floor: '5층', displayAddress: '파주시 금촌동', ribbon: '수익형피스텔' }
      ],
      '단독주택': [
        { id: 'h1', dealType: '매매', priceText: '9억 5,000만원', title: '정원 넓은 친환경 전원주택', buildingArea: 45, landArea: 150, displayAddress: '파주시 야당동', ribbon: '정원넓음' },
        { id: 'h2', dealType: '매매', priceText: '12억원', title: '고급 자재 사용 / 단독 타운하우스', buildingArea: 60, landArea: 180, displayAddress: '파주시 동패동', ribbon: '고급자재' },
        { id: 'h3', dealType: '매매', priceText: '7억 8,000만원', title: '숲세권 단독주택 / 공기 맑고 조용함', buildingArea: 38, landArea: 120, displayAddress: '파주시 탄현면', ribbon: '숲세권' },
        { id: 'h4', dealType: '전세', priceText: '5억원', title: '신축 단독주택 / 마당 관리 양호', buildingArea: 40, landArea: 130, displayAddress: '파주시 다율동', ribbon: '신축마당' },
        { id: 'h5', dealType: '매매', priceText: '15억원', title: '럭셔리 대저택 / 최고급 마당 조경', buildingArea: 80, landArea: 250, displayAddress: '파주시 운정동', ribbon: '최고급조경' },
        { id: 'h6', dealType: '매매', priceText: '6억 5,000만원', title: '가성비 우수한 단독주택 / 정원 있음', buildingArea: 32, landArea: 100, displayAddress: '파주시 조리읍', ribbon: '가성비단독' },
        { id: 'h7', dealType: '매매', priceText: '8억 2,000만원', title: '모던 스타일 복층 단독주택', buildingArea: 42, landArea: 140, displayAddress: '파주시 문산읍', ribbon: '모던복층' },
        { id: 'h8', dealType: '전세', priceText: '3억 8,000만원', title: '가성비 좋은 조용한 전원생활 추천', buildingArea: 30, landArea: 110, displayAddress: '파주시 탄현면', ribbon: '실속전원' }
      ]
    };
    return samples[categoryKey] || [];
  };

  const renderCategoryPanel = (categoryKey) => {
    const lpPanel = document.getElementById('lpPanel');
    if (!lpPanel) return;

    saveDefaultPanelHTML();

    const catNames = {
      '공장창고':     '공장·창고',
      '상가사무실':   '상가·사무실',
      '토지':         '토지',
      '주거용':       '주거용',
      '단독전원주택': '단독·전원주택',
      '건물빌딩':     '건물·빌딩',
      // 레거시
      '상가': '상가·사무실', '오피스텔': '오피스텔', '단독주택': '단독·전원주택',
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
    let categoryListings = allListings.filter(item => getCategory1(item) === categoryKey && item.status !== 'done');

    // 데이터가 전혀 없을 경우 데모용 프리미엄 샘플 데이터 활용
    if (categoryListings.length === 0) {
      categoryListings = getPremiumSampleData(categoryKey);
    }

    const renderCard = (item) => {
      const isFactory   = categoryKey === '공장창고';
      const isStore     = categoryKey === '상가사무실';
      const isLand      = categoryKey === '토지';
      const isOfficetel = categoryKey === '주거용';
      const isHouse     = categoryKey === '단독전원주택' || categoryKey === '건물빌딩';

      let imgSrc = 'images/factory_recommend.png';
      if (isStore) imgSrc = 'images/store_recommend.png';
      else if (isLand) imgSrc = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400';
      else if (isOfficetel) imgSrc = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400';
      else if (isHouse) imgSrc = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400';

      const actualThumb = getThumbnail(item);
      if (actualThumb) imgSrc = actualThumb;

      // Helper to format area display with both ㎡ and 평, handling missing values
      const formatArea = (m2, py) => {
        let m2Val = m2 !== undefined && m2 !== null ? Number(m2).toFixed(2) : null;
        let pyVal = py !== undefined && py !== null ? Number(py).toFixed(2) : null;
        if (!m2Val && pyVal) m2Val = (pyVal * 3.305785).toFixed(2);
        if (!pyVal && m2Val) pyVal = (m2Val / 3.305785).toFixed(2);
        if (m2Val && pyVal) return `${m2Val}㎡ / ${pyVal}평`;
        return m2Val ? `${m2Val}㎡` : pyVal ? `${pyVal}평` : '';
      };

      let areaHighlightHTML = '';
      if (isFactory) {
        // 공장창고: 건축면적 + 대지
        const bldgM2 = item.buildingAreaM2 ?? item.buildingArea;
        const bldgPy = item.buildingAreaPy;
        const landM2 = item.landAreaM2 ?? item.landArea;
        const areaStr = formatArea(bldgM2, bldgPy);
        const landStr = landM2 ? `${Number(landM2).toFixed(2)}㎡` : '';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">건축</span> <strong class="lp-area-val">${areaStr}</strong></span>` + (landStr ? ` <span class="lp-area-extra">· 대지 ${landStr}</span>` : '');
      } else if (isStore) {
        // 상가사무실: 전용 + 공급
        const exclM2 = item.exclusiveAreaM2 ?? item.exclusiveArea;
        const exclPy = item.exclusiveAreaPy;
        const supM2 = item.supplyAreaM2 ?? item.contractArea;
        const supPy = item.supplyAreaPy;
        const exclStr = formatArea(exclM2, exclPy);
        const supStr = formatArea(supM2, supPy);
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">전용</span> <strong class="lp-area-val">${exclStr}</strong>` + (supStr ? ` · <span class="lp-area-lbl">공급</span> <strong class="lp-area-val">${supStr}</strong>` : '') + `</span>`;
      } else if (isLand) {
        // 토지: 토지면적
        const m2 = item.areaM2 ?? item.landArea ?? item.area;
        const py = item.areaPy;
        const areaStr = formatArea(m2, py);
        const extraVal = item.zoningArea || '';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">토지</span> <strong class="lp-area-val">${areaStr}</strong></span>` + (extraVal ? ` <span class="lp-area-extra">· ${extraVal}</span>` : '');
      } else if (isOfficetel) {
        // 주거용 (아파트/오피스텔): 전용면적
        const m2 = item.exclusiveAreaM2 ?? item.exclusiveArea;
        const py = item.exclusiveAreaPy;
        const areaStr = formatArea(m2, py);
        const extraVal = item.floorInfo || item.floor || '';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">전용</span> <strong class="lp-area-val">${areaStr}</strong></span>` + (extraVal ? ` <span class="lp-area-extra">· ${extraVal}</span>` : '');
      } else if (isHouse) {
        // 단독전원주택/건물빌딩: 건물 + 대지
        const bldgM2 = item.buildingAreaM2 ?? item.buildingArea ?? item.area;
        const bldgPy = item.buildingAreaPy ?? item.areaPy;
        const areaStr = formatArea(bldgM2, bldgPy);
        const landM2 = item.landAreaM2 ?? item.landArea;
        const landStr = landM2 ? `${Number(landM2).toFixed(2)}㎡` : '';
        areaHighlightHTML = `<span class="lp-area-highlight"><span class="lp-area-lbl">건물</span> <strong class="lp-area-val">${areaStr}</strong></span>` + (landStr ? ` <span class="lp-area-extra">· 대지 ${landStr}</span>` : '');
      }

      // 카테고리별 카드 테마 클래스 매핑
      const themeMap = {
        '공장창고': 'factory-card',
        '상가': 'store-card',
        '토지': 'land-card',
        '오피스텔': 'officetel-card',
        '단독주택': 'house-card'
      };
      const cardThemeClass = themeMap[categoryKey] || 'factory-card';

      // 유형 레이블의 테마 컴제란 뮣 클래스
      const typeLabelTheme = isFactory ? 'type-factory'
        : isStore ? 'type-store'
        : isLand ? 'type-land'
        : isOfficetel ? 'type-officetel'
        : 'type-house';


      const typeLabel = catNames[categoryKey] || categoryKey;
      
      let ribbonHTML = '';
      let ribbonText = '';
      if (item.stickers && Array.isArray(item.stickers) && item.stickers.length > 0) {
        ribbonText = item.stickers[0];
      } else if (item.ribbon) {
        ribbonText = item.ribbon;
      }
      if (ribbonText) {
        ribbonHTML = `<div class="lp-rec-ribbon">${ribbonText}</div>`;
      }

      return `
        <div class="lp-rec-card ${cardThemeClass}" data-id="${item.id || ''}" style="cursor: pointer;">
          <div class="lp-rec-img-wrap">
            <img src="${imgSrc}" alt="${typeLabel}" class="lp-rec-img" />
            ${ribbonHTML}
          </div>
          <div class="lp-rec-body">
            <div class="lp-rec-row lp-rec-row-top">
              <div class="lp-rec-type ${typeLabelTheme}">${typeLabel}</div>
              ${getDealBadgeHTML(item.dealType)}
            </div>
            <div class="lp-rec-row lp-rec-row-price">
              <div class="lp-rec-price">${formatCardPrice(item)}</div>
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

    // lpPanel에 카테고리뷰 모드 클래스 추가 (패딩-라이트 제어)
    lpPanel.classList.add('cat-view-mode');

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

    // 해당 카테고리 실제 매물 기준으로 지도 마커 업데이트
    const forMap = _listings.filter(item => getCategory1(item) === categoryKey);
    if (map) placeMarkers(forMap.length > 0 ? forMap : []);
  };

  // ── 카카오맵 ──
  let map = null, openIw = null;
  let _mapReady = false;   // 지도 초기화 완료 플래그
  let _dataReady = false;  // Firestore 로드 완료 플래그
  const activeMarkers = [];

  // 매물종류별 숫자 원형 마커 색상
  const MARKER_COLORS = {
    '공장창고':         '#0d9488',  // 청록색
    '상가':             '#e53e3e',  // 빨간색
    '토지':             '#f97316',  // 주황색
    '오피스텔':         '#2563eb',  // 파란색
    '힐스테이트더운정': '#7c3aed',  // 보라색
    '단독주택':         '#16a34a',  // 초록색
  };
  const MARKER_COLOR_MIXED = '#64748b';
  let _mhId = 0;
  window._mhHandlers = {};

  // ── 좌표 필드명 추출 헬퍼 (lat/lng, latitude/longitude 등 모두 지원) ──
  const _getLat = i => {
    const v = i.lat ?? i.latitude ?? i.coordY ?? i.y ?? null;
    return (v !== null && !isNaN(Number(v))) ? Number(v) : null;
  };
  const _getLng = i => {
    const v = i.lng ?? i.longitude ?? i.coordX ?? i.x ?? null;
    return (v !== null && !isNaN(Number(v))) ? Number(v) : null;
  };
  const _hasCoord = i => _getLat(i) !== null && _getLng(i) !== null;

  // ── 필드 헬퍼 ──
  const isCompleted = i => i.is_completed === true || i.status === 'done' || i.status === '거래완료';
  const isRec       = i => i.is_recommended === true || i.isRecommended === true;
  const isNew       = i => i.is_new === true;
  const dealClass   = t => t === '매매' ? 'deal-mae' : t === '전세' ? 'deal-jeon' : t === '월세' ? 'deal-wol' : 'deal-im';

  // ── 카운트 업데이트 ──
  const updateCounts = () => {
    const all = _listings;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = `(${v})`; };
    set('cnt-all', all.length);
    ['공장창고','상가사무실','토지','주거용','단독전원주택','건물빌딩'].forEach(cat => {
      set(`cnt-${cat}`, all.filter(i => getCategory1(i) === cat).length);
    });
  };

  // ── 지도 마커 (숫자 원형 마커) ──
  const placeMarkers = (items) => {
    console.log('[placeMarkers] 호출됨 | map준비:', _mapReady, '| 매물수:', items.length);
    if (!map || typeof kakao === 'undefined') {
      console.warn('[placeMarkers] 지도 미초기화 — 건너뜀');
      return;
    }
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers.length = 0;
    if (openIw) { openIw.close(); openIw = null; }

    // 그룹 컬러: 단일 종류 → 해당 색, 혼합 → 슬레이트
    const getGroupColor = (gi) => {
      const types = [...new Set(gi.map(i => i.propertyType))];
      return types.length === 1 ? (MARKER_COLORS[types[0]] || MARKER_COLOR_MIXED) : MARKER_COLOR_MIXED;
    };

    // 숫자 원형 CustomOverlay HTML
    const makeMarkerContent = (count, color) => {
      const size = count >= 10 ? 38 : 32;
      const fs   = count >= 10 ? 12 : 13;
      const hid  = `mh_${++_mhId}`;
      return { hid, html: `<div onclick="window._mhHandlers['${hid}']()" style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 2px 8px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${fs}px;font-weight:800;cursor:pointer;line-height:1;user-select:none;">${count}</div>` };
    };

    // CustomOverlay 생성 + 클릭 핸들러 등록
    const addOverlay = (coords, gi) => {
      const { hid, html } = makeMarkerContent(gi.length, getGroupColor(gi));
      const overlay = new kakao.maps.CustomOverlay({ map, position: coords, content: html, yAnchor: 0.5, zIndex: 3 });
      window._mhHandlers[hid] = () => {
        if (gi.length === 1) {
          openModalFull(gi[0]);
        } else {
          map.setCenter(coords);
          map.setLevel(Math.max(1, map.getLevel() - 2));
        }
      };
      activeMarkers.push(overlay);
    };

    // 거래완료 제외 후 두 그룹으로 분리
    const active        = items.filter(i => !isCompleted(i));
    const withCoords    = active.filter(i => _hasCoord(i));
    const withoutCoords = active.filter(i => !_hasCoord(i) && (i.address || i.displayAddress));

    // 진단 로그: 실제 데이터 필드 확인
    console.log('[placeMarkers] 좌표O:', withCoords.length, '| 좌표X(주소검색):', withoutCoords.length);
    if (active.length > 0) {
      const s = active[0];
      console.log('[매물 샘플]', {
        propertyType: s.propertyType, category: s.category, type: s.type,
        lat: s.lat, lng: s.lng, latitude: s.latitude, longitude: s.longitude,
        coordX: s.coordX, coordY: s.coordY,
        address: s.address, displayAddress: s.displayAddress
      });
    }

    // 그룹 1: 좌표 보유 → 좌표 기준 그룹핑 후 숫자 원형 마커 즉시 표시
    const groups = new Map();
    withCoords.slice(0, 100).forEach(item => {
      const lat = _getLat(item), lng = _getLng(item);
      const key = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
      if (!groups.has(key)) groups.set(key, { lat, lng, items: [] });
      groups.get(key).items.push(item);
    });
    groups.forEach(({ lat, lng, items: gi }) => addOverlay(new kakao.maps.LatLng(lat, lng), gi));

    // 좌표 기준 bounds 조정
    if (withCoords.length === 1) {
      map.setCenter(new kakao.maps.LatLng(_getLat(withCoords[0]), _getLng(withCoords[0])));
      map.setLevel(5);
    } else if (withCoords.length > 1) {
      const bounds = new kakao.maps.LatLngBounds();
      withCoords.slice(0, 100).forEach(i => bounds.extend(new kakao.maps.LatLng(_getLat(i), _getLng(i))));
      map.setBounds(bounds);
    }

    // 그룹 2: 좌표 없음 → geocoder로 주소 변환 (최대 30개)
    if (withoutCoords.length > 0) {
      if (!kakao.maps.services) {
        console.warn('[placeMarkers] kakao.maps.services 미로드 — 주소검색 불가');
        return;
      }
      const geocoder = new kakao.maps.services.Geocoder();

      // displayAddress + address 합성: 중복 동명 제거 후 번지만 붙임
      // 예: "파주시 와동동" + "와동동 1463" → "파주시 와동동 1463"
      const mergeAddr = (disp, addr) => {
        if (!addr) return disp;
        if (!disp) return addr;
        // addr 자체에 상위 행정구역이 있으면(시·군·구 + 공백) 그대로 사용
        if (/[시군구]\s/.test(addr) || /^경기|^서울|^인천|^부산|^대전|^대구|^광주|^울산|^세종/.test(addr)) return addr;
        // disp 마지막 토큰이 addr 앞부분과 겹치면 중복 제거 후 합성
        const lastPart = disp.split(/\s+/).pop();
        if (addr.startsWith(lastPart)) {
          const rest = addr.slice(lastPart.length).trim();
          return rest ? disp + ' ' + rest : disp;
        }
        return disp + ' ' + addr;
      };

      // 우선순위별 주소 후보 배열 반환
      const buildAddrList = (item) => {
        const addr = (item.address || '').trim();
        const disp = (item.displayAddress || '').trim();
        const merged = mergeAddr(disp, addr);
        const list = [];
        // 1순위: 경기도 + 합성주소
        if (merged) list.push('경기도 ' + merged);
        // 2순위: 합성주소
        if (merged) list.push(merged);
        // 3순위: address 단독
        if (addr && addr !== merged) list.push(addr);
        // 중복 제거
        return [...new Set(list)].filter(Boolean);
      };

      withoutCoords.slice(0, 30).forEach(item => {
        const addrList = buildAddrList(item);
        if (!addrList.length) return;

        const tryNext = (idx) => {
          if (idx >= addrList.length) return;
          const addr = addrList[idx];
          geocoder.addressSearch(addr, (result, status) => {
            if (status !== kakao.maps.services.Status.OK) {
              console.log(`[지오코딩 실패 ${idx + 1}순위] ${addr}`);
              tryNext(idx + 1);
              return;
            }
            console.log(`[지오코딩 성공 ${idx + 1}순위] ${addr}`);
            addOverlay(new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)), [item]);
          });
        };

        tryNext(0);
      });
    }
  };

  // ── 지도+데이터 모두 준비됐을 때 마커 표시 ──
  const _tryShowMarkers = () => {
    if (!_mapReady || !_dataReady) return;
    const cat = flt.cat || flt.formCat;
    const toShow = cat ? _listings.filter(i => getCategory1(i) === cat) : _listings;
    console.log('[_tryShowMarkers] 마커 표시 시작 | 필터:', cat || '전체', '| 표시할 매물수:', toShow.length);
    placeMarkers(toShow);
  };

  // ── 지도 초기화 ──
  window.addEventListener('load', () => {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof kakao === 'undefined') {
      console.warn('[Map] kakao 미정의 또는 map 엘리먼트 없음');
      return;
    }
    kakao.maps.load(() => {
      mapEl.innerHTML = '';
      map = new kakao.maps.Map(mapEl, {
        center: new kakao.maps.LatLng(37.7512, 126.7820),
        level: 7
      });
      _mapReady = true;
      console.log('[Map] 카카오맵 초기화 완료');
      applyFilters();
      _tryShowMarkers();
    });
  });

  // ── 모달 열기 (미니맵 + 거래상태 배지 표시) ──
  const openModalFull = (item) => {
    openModal(item);
    const doneTag = document.getElementById('modalDoneTag');
    if (doneTag) {
      const completed = isCompleted(item);
      const statusText = item.status || (completed ? '거래완료' : '거래가능');
      if (statusText) {
        doneTag.textContent = statusText;
        doneTag.classList.remove('hidden');
        
        // 상태별 테마 색상 (CSS 클래스를 유지하되 인라인 스타일로 안전하고 유려하게 대입)
        if (statusText === '거래완료') {
          doneTag.style.background = '#fee2e2';
          doneTag.style.color = '#dc2626';
        } else if (statusText === '상담중') {
          doneTag.style.background = '#ffedd5';
          doneTag.style.color = '#ea580c';
        } else if (statusText === '계약진행') {
          doneTag.style.background = '#f3e8ff';
          doneTag.style.color = '#7c3aed';
        } else { // 거래가능
          doneTag.style.background = '#e0f2fe';
          doneTag.style.color = '#0284c7';
        }
      } else {
        doneTag.classList.add('hidden');
      }
    }
    const minimapWrap = document.getElementById('modalMinimapWrap');
    const minimapEl   = document.getElementById('modalMiniMap');
    if (!minimapWrap || !minimapEl) return;
    minimapWrap.style.display = 'none';
    if (typeof kakao === 'undefined') return;

    const renderMinimap = (coords) => {
      minimapWrap.style.display = 'block';
      minimapEl.innerHTML = '';
      const mm = new kakao.maps.Map(minimapEl, { center: coords, level: 4 });
      new kakao.maps.Marker({ map: mm, position: coords });
    };

    if (item.lat && item.lng && !isNaN(Number(item.lat)) && !isNaN(Number(item.lng))) {
      const coords = new kakao.maps.LatLng(Number(item.lat), Number(item.lng));
      renderMinimap(coords);
    } else if (item.address && kakao.maps.services) {
      new kakao.maps.services.Geocoder().addressSearch(item.address, (result, status) => {
        if (status !== kakao.maps.services.Status.OK) return;
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        renderMinimap(coords);
      });
    }
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

  // ── 오른쪽 패널: 추천 + 최신 미니카드 (실제 Firestore 데이터로 교체) ──
  const renderSpecialPanels = () => {
    const lpPanel = document.getElementById('lpPanel');
    if (!lpPanel) return;

    const all      = _listings.filter(i => !isCompleted(i));
    const recItems = all.filter(isRec).slice(0, 5);
    const newItems = all.filter(isNew).slice(0, 5);

    const miniCardHTML = item => {
      const thumb = getThumbnail(item);
      const label = CAT1_DISPLAY[getCategory1(item)] || item.propertyType || '';
      return `<article class="lp-mini-card" data-id="${item.id}" style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(0,0,0,.06);cursor:pointer;">
        <div style="width:64px;height:64px;flex-shrink:0;border-radius:8px;overflow:hidden;background:#f0f0f0;">
          ${thumb ? `<img src="${thumb}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` : ''}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:11px;color:#888;margin-bottom:2px;">${label} · ${item.dealType||''}</div>
          <div style="font-size:13px;font-weight:700;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title||'(제목 없음)'}</div>
          <div style="font-size:12px;color:#555;margin-top:2px;">${formatCardPrice(item)}</div>
          <div style="font-size:11px;color:#888;">${getDisplayAddress(item)}</div>
        </div>
      </article>`;
    };

    const sectionHTML = (icon, title, items, emptyMsg) => `
      <div style="margin-bottom:16px;">
        <div style="font-size:13px;font-weight:800;color:#1a1a2e;padding:8px 0 4px;border-bottom:2px solid #C9A84C;margin-bottom:4px;">${icon} ${title}</div>
        ${items.length ? items.map(miniCardHTML).join('') : `<div style="padding:12px 0;color:#888;font-size:12px;">${emptyMsg}</div>`}
      </div>`;

    lpPanel.innerHTML = `<div style="padding:12px 14px;overflow-y:auto;height:100%;">
      ${sectionHTML('⭐', '추천 매물', recItems, '추천 매물이 없습니다.')}
      ${sectionHTML('🆕', '최신 매물', newItems, '최신 매물이 없습니다.')}
    </div>`;

    lpPanel.querySelectorAll('.lp-mini-card').forEach(card => {
      card.addEventListener('click', () => {
        const found = _listings.find(x => x.id === card.dataset.id);
        if (found) openModalFull(found);
      });
    });
  };

  // ── 전체 매물 그리드 카드 HTML ──
  const fullCardHTML = item => {
    const done    = isCompleted(item);
    const cat1    = getCategory1(item);
    const catLabel = CAT1_DISPLAY[cat1] || CAT_LABELS[item.propertyType] || item.propertyType || '';
    const imgSrc  = getThumbnail(item);
    const areaHTML = getCardAreaHTML(item);
    return `
      <article class="lp-all-card${done ? ' lp-all-done' : ''}" data-id="${item.id}">
        <div class="lp-all-img">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
          ${done ? '<div class="lp-all-sold">거래완료</div>' : ''}
          <span class="lp-all-cat-tag">${catLabel}</span>
          ${isRec(item) ? '<span style="position:absolute;top:6px;right:6px;background:#C9A84C;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;line-height:1.4;">⭐ 추천</span>' : ''}
          ${item.isUrgent===true ? '<span style="position:absolute;bottom:6px;right:6px;background:#e53e3e;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;line-height:1.4;">🔥 급매</span>' : ''}
        </div>
        <div class="lp-all-body">
          <div class="lp-all-row-top">
            <span class="lp-all-type-tag">${catLabel}</span>
            ${getDealBadgeHTML(item.dealType)}
          </div>
          <div class="lp-all-price">${formatCardPrice(item)}</div>
          <div class="lp-all-title">${item.title || ''}</div>
          ${areaHTML ? `<div class="lp-all-area-wrap">${areaHTML}</div>` : ''}
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
    if (effectiveCat)  items = items.filter(i => getCategory1(i) === effectiveCat);
    if (effectiveDeal) items = items.filter(i => i.dealType === effectiveDeal);
    if (flt.kw)        items = items.filter(i => {
      const kw = flt.kw;
      return (i.title        || '').toLowerCase().includes(kw) ||
             (i.address      || '').toLowerCase().includes(kw) ||
             (i.displayAddress || '').toLowerCase().includes(kw) ||
             (i.detailDescription || '').toLowerCase().includes(kw) ||
             (CAT1_DISPLAY[getCategory1(i)] || i.propertyType || '').toLowerCase().includes(kw);
    });
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
    const kwInput = document.getElementById('kwInput');
    flt.kw       = (kwInput?.value || '').toLowerCase();
    flt.formCat  = document.getElementById('formCatSelect')?.value  || '';
    flt.formDeal = document.getElementById('formDealSelect')?.value || '';
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
      const m = href.match(/[?&]category=([^&]+)/);
      if (m) {
        // URL 값(공장창고, 상가사무실, 토지, 주거용, 단독전원주택, 건물빌딩)을 category1 키로 정규화
        const cat = PT_TO_CAT1[decodeURIComponent(m[1])] || decodeURIComponent(m[1]);
        renderCategoryPanel(cat);
      }
    });
  });

  // ── URL 파라미터 ──
  const urlCatRaw = new URLSearchParams(window.location.search).get('category');
  if (urlCatRaw) {
    // 레거시 propertyType 값이 URL에 오면 category1 으로 변환
    const urlCat = PT_TO_CAT1[urlCatRaw] || urlCatRaw;
    flt.cat = urlCat;
    const catSel = document.getElementById('formCatSelect');
    if (catSel) catSel.value = urlCat;
    // 사이드바 active 상태
    document.querySelectorAll('.lp-cat-item').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === urlCat);
    });
  }

  // 초기 렌더
  saveDefaultPanelHTML();

  (async () => {
    const cardsEl = document.getElementById('listingCards');
    if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 목록을 불러오는 중...</div>';
    try {
      _listings = await readListingsFromFirestore();
    } catch (err) {
      console.error('[Firestore] 매물 조회 오류 — 원인:', err?.code || err?.message || err);
      console.warn('[Firestore] Firestore 보안 규칙에서 비인증 읽기를 허용했는지 확인하세요.');
      if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 정보를 불러오지 못했습니다. (F12 콘솔에서 오류 확인)</div>';
      return;
    }
    // 공개 여부가 명시적으로 false인 매물은 공개 페이지에서 제외
    _listings = _listings.filter(i => i.is_public !== false);
    _dataReady = true;
    console.log('[Firestore] 로드 완료 | 공개 매물수:', _listings.length);
    if (_listings.length > 0) {
      const s = _listings[0];
      console.log('[Firestore] 첫 매물 키 목록:', Object.keys(s).join(', '));
      console.log('[Firestore] 첫 매물 샘플:', JSON.stringify(s));
    }
    applyFilters();
    _tryShowMarkers();
    if (urlCat) renderCategoryPanel(urlCat);
  })();
};

// ─────────────────────────────────────────────
// index.html
// ─────────────────────────────────────────────
const setupHomePage = () => {
  // 메인페이지는 더 이상 추천/최신 매물 목록을 직접 조회 및 렌더링하지 않습니다.
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
  const isCompleted = i => i.is_completed === true || i.status === 'done' || i.status === '거래완료';
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
                <div class="adm-item-info">${getDisplayAddress(item)} · ${formatPropertyPrice(item)} · ${item.area || 0}㎡</div>
                <div class="adm-item-actions">
                  <a href="admin-register.html?edit=${item.id}" class="adm-btn adm-btn-edit" style="text-decoration:none;">✏️ 수정</a>
                  <button class="adm-btn adm-btn-hp" data-action="prefill" data-id="${item.id}" type="button">🏠 홈페이지</button>
                  <button class="adm-btn adm-btn-done${done?' done-active':''}" data-action="done" data-id="${item.id}" type="button">${done?'↩ 완료취소':'✅ 거래완료'}</button>
                  <button class="adm-btn adm-btn-del" data-action="delete" data-id="${item.id}" type="button">🗑 삭제</button>
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

  // ── 대시보드 버튼 핸들러 (홈페이지·거래완료·삭제) ──
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'prefill') {
      window.location.href = `admin-register.html?prefill=${id}`;
      return;
    }
    if (action === 'done') {
      const newStatus = (_allListings.find(i => i.id === id)?.status === 'done') ? '' : 'done';
      const doneMsg = newStatus === 'done' ? '이 매물을 거래완료로 변경하시겠습니까?' : '거래완료를 취소하시겠습니까?';
      if (!confirm(doneMsg)) return;
      (async () => {
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInFirestore(id, { status: newStatus });
          _allListings = _allListings.map(i => i.id === id ? { ...i, status: newStatus } : i);
          applyFilters();
        } catch (err) {
          console.error('거래완료 처리 오류:', err);
          alert('거래완료 처리 중 오류가 발생했습니다.');
        }
      })();
    }
    if (action === 'delete') {
      if (!confirm('정말 이 매물을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) return;
      (async () => {
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await deleteListingFromFirestore(id);
          _allListings = _allListings.filter(i => i.id !== id);
          alert('삭제되었습니다.');
          applyFilters();
        } catch (err) {
          console.error('매물 삭제 오류:', err);
          alert('매물 삭제 중 오류가 발생했습니다.');
        }
      })();
    }
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
// Supabase Storage 이미지 업로드 헬퍼
// bucket: listing-images (Public)
// 경로:   listings/{listingNo}/{timestamp}_{filename}
// ─────────────────────────────────────────────
async function uploadListingImage(file, listingNo = '') {
  const { supabase, LISTING_IMAGES_BUCKET } = await _supabaseCfg();

  // 파일명 안전하게 처리 (한글·특수문자 제거)
  const safeFname  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder     = listingNo ? `listings/${listingNo}` : 'listings/temp';
  const uploadPath = `${folder}/${Date.now()}_${safeFname}`;

  const { data, error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(uploadPath, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return publicUrl;
}

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
  let isEditMode           = false;
  let importedLegacyDesc   = '';

  const addImageRow = (value = '') => {
    if (!imageContainer) return;
    if (imageContainer.querySelectorAll('.image-url-row').length >= MAX_IMAGES) return;
    const count = imageContainer.querySelectorAll('.image-url-row').length;
    const row = document.createElement('div');
    row.className = 'image-url-row';

    // ① 썸네일 미리보기 (업로드 성공 후 표시)
    const thumb = document.createElement('img');
    thumb.className = 'img-thumb hidden';
    thumb.alt = '미리보기';

    // ② URL 입력창
    const input = document.createElement('input');
    input.name = 'imageUrls'; input.type = 'url';
    input.placeholder = `사진 URL ${count + 1}`;
    input.value = value;
    if (count === 0) input.required = true;
    // 기존 URL 입력 시 썸네일 업데이트
    input.addEventListener('blur', () => {
      if (input.value.trim()) { thumb.src = input.value.trim(); thumb.classList.remove('hidden'); }
      else thumb.classList.add('hidden');
    });
    if (value) { thumb.src = value; thumb.classList.remove('hidden'); }

    // ③ 파일 업로드 버튼 (Firebase Storage)
    const fileLabel = document.createElement('label');
    fileLabel.className = 'btn btn-outline btn-sm img-file-label';
    fileLabel.title = '로컬 파일을 Firebase Storage에 업로드';
    fileLabel.innerHTML = '📎 파일';
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    fileLabel.appendChild(fileInput);

    // ④ 업로드 상태 표시
    const statusEl = document.createElement('span');
    statusEl.className = 'img-upload-status';

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      statusEl.textContent = '⏳ 업로드 중…';
      statusEl.className = 'img-upload-status uploading';
      input.disabled = true; fileLabel.classList.add('disabled');
      try {
        const listingNo = form.elements['listingNo']?.value?.trim() || '';
        const url = await uploadListingImage(file, listingNo);
        input.value = url; input.disabled = false; fileLabel.classList.remove('disabled');
        statusEl.textContent = '✅ 완료'; statusEl.className = 'img-upload-status done';
        thumb.src = url; thumb.classList.remove('hidden');
      } catch (err) {
        input.disabled = false; fileLabel.classList.remove('disabled');
        const msg = err.message || '';
        let friendly = '업로드 실패 — 다시 시도해주세요.';
        if (msg.includes('row-level security') || msg.includes('violates row') || msg.includes('security policy'))
          friendly = '사진 업로드 권한 오류입니다. 관리자에게 문의하거나 페이지를 새로고침 후 다시 시도해주세요.';
        else if (msg.includes('unauthorized') || msg.includes('403'))
          friendly = '업로드 권한이 없습니다. 관리자 로그인 상태를 확인해주세요.';
        else if (msg.includes('size') || msg.includes('too large'))
          friendly = '파일 크기가 너무 큽니다. 5MB 이하 이미지를 사용해주세요.';
        statusEl.textContent = '❌ ' + friendly;
        statusEl.className = 'img-upload-status error';
        console.error('[Storage 업로드 오류]', err.message || err);
      }
      fileInput.value = '';
    });

    // ⑤ 삭제 버튼
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button'; removeBtn.className = 'btn btn-outline img-remove-btn';
    removeBtn.textContent = '삭제';
    removeBtn.addEventListener('click', () => {
      if (imageContainer.querySelectorAll('.image-url-row').length > 1) row.remove();
      else { input.value = ''; statusEl.textContent = ''; thumb.classList.add('hidden'); }
    });

    row.appendChild(thumb);
    row.appendChild(input);
    row.appendChild(fileLabel);
    row.appendChild(statusEl);
    row.appendChild(removeBtn);
    imageContainer.appendChild(row);
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
    const cat1 = form.elements['category1']?.value;
    const noDisplay = document.getElementById('listingNoDisplay');
    const noInput   = form.elements['listingNo'];
    if (cat1) { const no=getNextListingNo(); if(noDisplay)noDisplay.textContent=no; if(noInput)noInput.value=no; }
    else { if(noDisplay)noDisplay.textContent='-'; if(noInput)noInput.value=''; }
  };

  // ── category2 옵션 동적 업데이트 ──
  const syncCategory2 = () => {
    const cat1 = form.elements['category1']?.value || '';
    const cat2El = document.getElementById('cat2Select');
    if (!cat2El) return;
    cat2El.innerHTML = '<option value="">2차 선택</option>';
    const opts = CATEGORY_MAP[cat1] || [];
    opts.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      cat2El.appendChild(o);
    });
    // 토지는 cat2 자동선택
    if (opts.length === 1) cat2El.value = opts[0];
  };

  // ── 카테고리별 섹션 표시/숨김 + disable 관리 ──
  // disabled 사용: FormData는 disabled 필드를 제출하지 않으므로
  // 중복 name 필드(floorInfo, unitNumber 등)의 충돌을 방지한다.
  const setSection = (el, show) => {
    if (!el) return;
    el.classList.toggle('hidden', !show);
    el.querySelectorAll('input, select, textarea').forEach(inp => {
      // hidden type 제외 (값만 보유용)
      if (inp.type !== 'hidden') inp.disabled = !show;
    });
  };

  const syncFormByCategory = () => {
    const cat1 = form.elements['category1']?.value || '';
    const cat2 = form.elements['category2']?.value || '';

    // 면적 블록
    const blkLand      = form.querySelector('.area-blk-land');
    const blkExclusive = form.querySelector('.area-blk-exclusive');
    const blkBuilding  = form.querySelector('.area-blk-building');

    // 추가정보 섹션
    const detailCommercial = form.querySelector('.detail-commercial');
    const detailOfficetel  = form.querySelector('.detail-officetel');
    const detailApt        = form.querySelector('.detail-apt');

    const isLand      = cat1 === '토지';
    const isBuilding  = cat1 === '공장창고' || cat1 === '단독전원주택' || cat1 === '건물빌딩';
    const isExclusive = cat1 === '상가사무실' || cat1 === '주거용';
    const isCommercial = cat1 === '공장창고' || cat1 === '상가사무실' || cat1 === '건물빌딩';
    const isOfficetel = cat1 === '주거용' && cat2 === '오피스텔';
    const isApt       = cat1 === '주거용' && cat2 === '아파트';

    setSection(blkLand,      isLand);
    setSection(blkExclusive, isExclusive);
    setSection(blkBuilding,  isBuilding);
    setSection(detailCommercial, isCommercial);
    setSection(detailOfficetel,  isOfficetel);
    setSection(detailApt,        isApt);

    // hiddenPropertyType 자동 설정
    const hiddenPt = form.elements['propertyType'];
    if (hiddenPt && cat1) hiddenPt.value = derivePropertyType(cat1, cat2);
  };

  // category1 변경 핸들러
  const cat1El = document.getElementById('cat1Select');
  if (cat1El) {
    cat1El.addEventListener('change', () => {
      syncCategory2();
      if (!isEditMode) {
        const saved1 = cat1El.value;
        form.reset();
        form.elements['id'].value = '';
        cat1El.value = saved1;
        syncCategory2();
        resetImageFields();
        const py=document.getElementById('areaPyeong'); if(py)py.textContent='';
        const ko=document.getElementById('priceKorean'); if(ko)ko.textContent='';
        setTimeout(() => {
          if (importedLegacyDesc) {
            const d = form.elements['description'];
            if (d && !d.value.trim()) d.value = importedLegacyDesc;
          }
        }, 0);
      }
      syncFormByCategory();
      updateListingNo();
    });
  }

  // category2 변경 핸들러
  const cat2El = document.getElementById('cat2Select');
  if (cat2El) {
    cat2El.addEventListener('change', () => {
      syncFormByCategory();
      updateListingNo();
    });
  }

  // 초기화
  syncCategory2();
  syncFormByCategory();


  const priceEl = form.elements['price'];
  if (priceEl) priceEl.addEventListener('input', () => { const el=document.getElementById('priceKorean'); if(el)el.textContent=toKoreanPrice(priceEl.value); });

  // ── 면적 양방향 자동 변환 (이벤트 위임 방식 — 중복 name 대응) ──
  const _areaPairs = [
    ['areaM2','areaPy'],
    ['exclusiveAreaM2','exclusiveAreaPy'],
    ['supplyAreaM2','supplyAreaPy'],
    ['landAreaM2','landAreaPy'],
    ['buildingAreaM2','buildingAreaPy'],
    ['totalFloorAreaM2','totalFloorAreaPy'],
  ];
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!name || e.target.disabled) return;
    for (const [m2n, pyn] of _areaPairs) {
      if (name === m2n && e.target.value) {
        const pyEl = form.querySelector(`[name="${pyn}"]:not([disabled])`);
        if (pyEl) pyEl.value = m2ToPy(e.target.value);
        break;
      }
      if (name === pyn && e.target.value) {
        const m2El = form.querySelector(`[name="${m2n}"]:not([disabled])`);
        if (m2El) m2El.value = pyToM2(e.target.value);
        break;
      }
    }
  });

  const editId = new URLSearchParams(window.location.search).get('edit');
  const prefillId = new URLSearchParams(window.location.search).get('prefill');
  const sourceParam = new URLSearchParams(window.location.search).get('source');

  if (sourceParam === 'haitop') {
    const raw = localStorage.getItem('hitopHomepagePrefill');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        importedLegacyDesc = data.description || '';
        // 레거시 propertyType → category1/2로 변환
        if (data.propertyType) {
          const c1 = PT_TO_CAT1[data.propertyType] || data.category1 || '';
          const c2 = PT_TO_CAT2[data.propertyType] || data.category2 || '';
          const c1El = document.getElementById('cat1Select');
          if (c1El && c1) {
            c1El.value = c1;
            c1El.dispatchEvent(new Event('change'));
          }
          const c2El = document.getElementById('cat2Select');
          if (c2El && c2) c2El.value = c2;
          syncFormByCategory();
        }
        const titleEl = form.elements['title'];
        if (titleEl && data.title) titleEl.value = data.title;
        const descEl = form.elements['description'];
        if (descEl && data.description) descEl.value = data.description;
        const fmTitleEl = document.getElementById('formTitle');
        if (fmTitleEl) fmTitleEl.textContent = '홈페이지 매물 등록 (기존매물)';

        if (descEl) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.textContent = '가져온 메모 삭제';
          clearBtn.className = 'btn btn-outline';
          clearBtn.style.cssText = 'font-size:0.85rem;margin-top:4px;';
          clearBtn.addEventListener('click', () => {
            if (confirm('가져온 메모를 삭제하고 현재 메모 입력칸도 비울까요?')) {
              localStorage.removeItem('hitopHomepagePrefill');
              importedLegacyDesc = '';
              const d = form.elements['description'];
              if (d) d.value = '';
              clearBtn.remove();
            }
          });
          descEl.insertAdjacentElement('afterend', clearBtn);
        }
      } catch(err) { console.error('prefill 파싱 오류:', err); }
    }
  }

  if (editId || prefillId) {
    (async () => {
      try {
        const isAuthed = await waitForAdminAuth();
        if (!isAuthed) return;
        const targetId = editId || prefillId;
        const [{ doc, getDoc }, { db, LISTINGS_COLLECTION }] = await Promise.all([_fsListings(), _fsCfg()]);
        const snap = await getDoc(doc(db, LISTINGS_COLLECTION, targetId));
        if (!snap.exists()) { alert('매물을 찾을 수 없습니다.'); return; }
        const target = normalizeFirestoreListing(snap);

        if (editId) {
          isEditMode = true;
          const titleEl = document.getElementById('formTitle');
          if (titleEl) titleEl.textContent = '매물 수정';
        } else if (prefillId) {
          const titleEl = document.getElementById('formTitle');
          if (titleEl) titleEl.textContent = '홈페이지 매물 등록';
        }

        Object.entries(target).forEach(([key, value]) => {
          if (key === 'imageUrls' || (prefillId && key === 'id') || key === 'stickers') return;
          // querySelectorAll 로 같은 name 가진 여러 입력 모두 채움 (disabled 포함)
          const els = form.querySelectorAll(`[name="${key}"]`);
          if (!els.length) return;
          els.forEach(el => {
            if (el.type === 'checkbox') {
              el.checked = value === true || value === 'true';
            } else if (el.type !== 'hidden' || key === 'propertyType') {
              el.value = (value !== null && value !== undefined) ? value : '';
            }
          });
        });

        // stickers 체크박스 상태 초기화 및 설정
        form.querySelectorAll('input[name="stickers"]').forEach(el => el.checked = false);
        if (target.stickers && Array.isArray(target.stickers)) {
          target.stickers.forEach(sticker => {
            const chk = form.querySelector(`input[name="stickers"][value="${sticker}"]`);
            if (chk) chk.checked = true;
          });
        }

        // Clear hidden id in prefill mode
        if (prefillId) {
          const hiddenId = form.elements['id'];
          if (hiddenId) hiddenId.value = '';
        }

        // category1 / category2 채우기 (신규 필드 우선, 없으면 레거시 propertyType 매핑)
        const _tc1 = target.category1 || PT_TO_CAT1[target.propertyType || ''] || '';
        const _tc2 = target.category2 || PT_TO_CAT2[target.propertyType || ''] || '';
        const _c1El = document.getElementById('cat1Select');
        if (_c1El && _tc1) {
          _c1El.value = _tc1;
          syncCategory2();
        }
        const _c2El = document.getElementById('cat2Select');
        if (_c2El && _tc2) _c2El.value = _tc2;
        syncFormByCategory();

        // hiddenPropertyType 복원
        const hiddenPt = form.elements['propertyType'];
        if (hiddenPt && target.propertyType) hiddenPt.value = target.propertyType;

        syncFlagStyle(chkRec, lblRec);
        syncFlagStyle(chkUrg, lblUrg);

        imageContainer.innerHTML = '';
        const urls = (target.imageUrls && target.imageUrls.length)
          ? target.imageUrls : (target.imageUrl ? [target.imageUrl] : []);
        urls.forEach((url) => addImageRow(url));
        if (!urls.length) addImageRow();
        
        if (editId) {
          const noDisp = document.getElementById('listingNoDisplay');
          if (noDisp) noDisp.textContent = target.listingNo || '-';
          const cancelBtn = document.getElementById('cancelEditBtn');
          if (cancelBtn) cancelBtn.classList.remove('hidden');
          // 수정모드에서만 삭제 버튼 표시
          const deleteBtn = document.getElementById('deleteListingBtn');
          if (deleteBtn) deleteBtn.classList.remove('hidden');
        }
        
        const pyEl = document.getElementById('areaPyeong');
        if (pyEl && target.area) pyEl.textContent = toPyeong(target.area);
        const koEl = document.getElementById('priceKorean');
        if (koEl && target.price) koEl.textContent = toKoreanPrice(target.price);
      } catch (err) {
        console.error('매물 조회 오류:', err);
        alert('매물을 불러오지 못했습니다.');
      }
    })();
  }

  document.getElementById('cancelEditBtn')?.addEventListener('click', () => { window.location.href='admin-listings.html'; });

  // ── 삭제 버튼 (수정모드에서만 표시) ──
  document.getElementById('deleteListingBtn')?.addEventListener('click', () => {
    if (!editId) return;
    if (!confirm('정말 이 매물을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')) return;
    (async () => {
      try {
        const isAuthed = await waitForAdminAuth();
        if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
        await deleteListingFromFirestore(editId);
        alert('삭제되었습니다.');
        window.location.href = 'admin-listings.html';
      } catch (err) {
        console.error('매물 삭제 오류:', err);
        alert('매물 삭제 중 오류가 발생했습니다.');
      }
    })();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    // 업로드 진행 중이면 저장 차단
    if (imageContainer?.querySelector('.img-upload-status.uploading')) {
      alert('이미지 업로드가 진행 중입니다. 완료 후 저장해주세요.');
      return;
    }
    const fd = new FormData(form);
    const payload = {};
    for (const [key,value] of fd.entries()) { if(key!=='imageUrls') payload[key]=value; }
    payload.imageUrls = Array.from(form.querySelectorAll('input[name="imageUrls"]'))
      .map(el => el.value.trim()).filter(v => v);

    // category1/category2 저장 + propertyType 하위호환 도출
    const _sCat1 = form.elements['category1']?.value || '';
    const _sCat2 = form.elements['category2']?.value || '';
    if (_sCat1) {
      payload.category1 = _sCat1;
      if (_sCat2) payload.category2 = _sCat2;
      // 기존 propertyType 필드 하위호환 유지
      payload.propertyType = derivePropertyType(_sCat1, _sCat2);
    }

    payload.price = Number(payload.price);
    // 가격 필드: 순수 숫자(콤마 포함)이면 Number로 변환, 텍스트("12억 5,000만")는 문자열 유지, 빈값 제거
    ['salePrice', 'deposit', 'monthlyRent', 'presalePrice'].forEach(k => {
      if (payload[k] === '' || payload[k] === undefined) { delete payload[k]; return; }
      const n = Number(String(payload[k]).replace(/,/g, ''));
      if (!isNaN(n)) payload[k] = n;
    });
    if (payload.premium === '' || payload.premium === undefined) delete payload.premium;
    // Convert numeric area fields
    ['areaM2','areaPy','exclusiveAreaM2','exclusiveAreaPy','supplyAreaM2','supplyAreaPy',
     'landAreaM2','landAreaPy','buildingAreaM2','buildingAreaPy','totalFloorAreaM2','totalFloorAreaPy'
    ].forEach(k => { if (payload[k]) payload[k] = Number(payload[k]); else if (payload[k] === '') delete payload[k]; });
    // Auto‑calculate missing counterparts
    if (payload.areaM2 && !payload.areaPy) payload.areaPy = Number(m2ToPy(payload.areaM2));
    if (payload.areaPy && !payload.areaM2) payload.areaM2 = Number(pyToM2(payload.areaPy));
    if (payload.exclusiveAreaM2 && !payload.exclusiveAreaPy) payload.exclusiveAreaPy = Number(m2ToPy(payload.exclusiveAreaM2));
    if (payload.exclusiveAreaPy && !payload.exclusiveAreaM2) payload.exclusiveAreaM2 = Number(pyToM2(payload.exclusiveAreaPy));
    if (payload.supplyAreaM2 && !payload.supplyAreaPy) payload.supplyAreaPy = Number(m2ToPy(payload.supplyAreaM2));
    if (payload.supplyAreaPy && !payload.supplyAreaM2) payload.supplyAreaM2 = Number(pyToM2(payload.supplyAreaPy));
    if (payload.landAreaM2 && !payload.landAreaPy) payload.landAreaPy = Number(m2ToPy(payload.landAreaM2));
    if (payload.landAreaPy && !payload.landAreaM2) payload.landAreaM2 = Number(pyToM2(payload.landAreaPy));
    if (payload.buildingAreaM2 && !payload.buildingAreaPy) payload.buildingAreaPy = Number(m2ToPy(payload.buildingAreaM2));
    if (payload.buildingAreaPy && !payload.buildingAreaM2) payload.buildingAreaM2 = Number(pyToM2(payload.buildingAreaPy));
    if (payload.totalFloorAreaM2 && !payload.totalFloorAreaPy) payload.totalFloorAreaPy = Number(m2ToPy(payload.totalFloorAreaM2));
    if (payload.totalFloorAreaPy && !payload.totalFloorAreaM2) payload.totalFloorAreaM2 = Number(pyToM2(payload.totalFloorAreaPy));
    // 빈 텍스트 필드 정리
    ['floorInfo','zoning','parkingCount','approvalDate','detailDescription','managementFee',
     'complexName','buildingDong','unitNumber','unitType'].forEach(k => { if (payload[k] === '' || payload[k] === undefined) delete payload[k]; });
    // Legacy area handling for compatibility
    if (payload.area) {
      payload.area = Number(payload.area);
    } else if (payload.areaM2) {
      payload.area = Number(payload.areaM2);
    }
    payload.isRecommended = chkRec?.checked === true;
    payload.isUrgent = chkUrg?.checked === true;
    payload.stickers = Array.from(form.querySelectorAll('input[name="stickers"]:checked')).map(el => el.value);
    if (!payload.status) payload.status = '거래가능';

    const address = payload.address ? payload.address.trim() : '';

    const performSave = async (lat = null, lng = null) => {
      // geocoder 결과 우선 적용 (null이면 FormData 기존값 유지)
      if (lat !== null) payload.lat = Number(lat);
      if (lng !== null) payload.lng = Number(lng);

      // lat/lng 정리: 빈 값·NaN 제거, 문자열 숫자는 Number로 변환
      ['lat', 'lng'].forEach(k => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) { delete payload[k]; return; }
        const n = Number(v);
        if (isNaN(n)) delete payload[k];
        else payload[k] = n;
      });

      if (payload.id) {
        // 수정 — Firestore updateDoc
        const docId = payload.id;
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInFirestore(docId, payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 수정 오류:', err);
          alert('매물 수정 중 오류가 발생했습니다.');
        }
      } else {
        // 신규 등록 — Firestore 저장
        if (!payload.listingNo) payload.listingNo = getNextPropertyNumber();
        if (!payload.property_number) payload.property_number = payload.listingNo;
        if (!payload.status) payload.status = '거래가능';
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await createListingInFirestore(payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 등록 오류:', err);
          alert('매물 등록 중 오류가 발생했습니다.');
        }
      }
    };

    // 카카오 Geocoder를 활용하여 주소를 좌표(lat/lng)로 변환
    if (typeof kakao !== 'undefined' && kakao.maps && kakao.maps.services && address) {
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result && result[0]) {
          const lat = result[0].y;
          const lng = result[0].x;
          console.log(`[주소 좌표 변환 성공] ${address} -> lat: ${lat}, lng: ${lng}`);
          performSave(lat, lng);
        } else {
          console.warn(`[주소 좌표 변환 실패] ${address}, status: ${status}. 좌표 없이 저장을 시도합니다.`);
          performSave(null, null);
        }
      });
    } else {
      console.warn('[카카오 지도 Geocoder 사용 불가] geocoder가 로드되지 않았거나 주소가 비어있습니다.');
      performSave(null, null);
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
    if (category) listings=listings.filter(i=>getCategory1(i)===category);
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
            <p style="margin:4px 0;font-size:13px;">${formatPropertyPrice(item)} · ${item.propertyType === '상가' ? `${item.exclusiveAreaM2 || ''}㎡ (${item.exclusiveAreaPy || ''}평) / ${item.supplyAreaM2 || ''}㎡ (${item.supplyAreaPy || ''}평)` : `${item.areaM2 || item.area || ''}㎡ (${item.areaPy || ''}평)`}</p>
            <div class="admin-item-actions">
              <a href="admin-register.html?edit=${item.id}" class="adm-btn adm-btn-edit" style="text-decoration:none;">✏️ 수정</a>
              <button class="adm-btn adm-btn-hp" data-action="prefill" data-id="${item.id}" type="button">🏠 홈페이지</button>
              <button class="adm-btn adm-btn-done${isDone?' done-active':''}" data-action="done" data-id="${item.id}" type="button">${isDone?'↩ 완료취소':'✅ 거래완료'}</button>
              <button class="adm-btn adm-btn-del" data-action="delete" data-id="${item.id}" type="button">🗑 삭제</button>
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
      if(!confirm('정말 이 매물을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'))return;
      (async()=>{
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await deleteListingFromFirestore(id);
          _allListings=_allListings.filter(i=>i.id!==id);
          alert('삭제되었습니다.');
          applyFilters();
        } catch(err) {
          console.error('매물 삭제 오류:',err);
          alert('매물 삭제 중 오류가 발생했습니다.');
        }
      })();
    }
    if (action==='prefill') {
      window.location.href = `admin-register.html?prefill=${id}`;
      return;
    }
    if (action==='done') {
      const newStatus=(_allListings.find(i=>i.id===id)?.status==='done')?'':'done';
      const doneMsg = newStatus==='done' ? '이 매물을 거래완료로 변경하시겠습니까?' : '거래완료를 취소하시겠습니까?';
      if (!confirm(doneMsg)) return;
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
  document.getElementById('modalPrintBtn')?.addEventListener('click', () => {
    const id = document.getElementById('modalPrintBtn').dataset.id;
    if (id) {
      window.open(`print-listing.html?id=${id}`, '_blank');
    }
  });
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
