console.log('app.js 로드됨!');
const SUPABASE_LISTINGS_TABLE = 'listings';
const SUPABASE_VISITORS_TABLE = 'visitors';

const getListingPrintId = (item = {}) => (
  item.id || item.property_number || item.listingNo || item.listing_id || ''
);

const openListingPrintPage = (id) => {
  const printId = String(id || '').trim();
  if (!printId) return;
  window.open(`print-listing.html?id=${encodeURIComponent(printId)}`, '_blank');
};

const HITOP_SITE_ORIGIN = 'https://hitoprealty.com';
const FAVORITE_STORAGE_KEY = 'hitop_favorite_listings_v1';

const escapeHTML = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getListingDetailPath = (itemOrId = {}) => {
  const id = typeof itemOrId === 'object'
    ? (itemOrId.id || itemOrId.listing_id || itemOrId.listingNo || '')
    : itemOrId;
  const cleanId = String(id || '').trim();
  return cleanId ? `/listing/${encodeURIComponent(cleanId)}/` : '';
};

const getListingDetailUrl = (itemOrId = {}) => getListingDetailPath(itemOrId) || 'listings.html';
const getListingDetailAbsoluteUrl = (itemOrId = {}) => {
  const path = getListingDetailPath(itemOrId);
  return path ? `${HITOP_SITE_ORIGIN}${path}` : `${HITOP_SITE_ORIGIN}/listings.html`;
};

const getListingVerifiedDate = (item = {}) => String(item.lastVerifiedAt || item.last_verified_at || '').slice(0, 10);
const getListingVerifiedBadgeHTML = (item = {}, className = 'listing-verified-badge') => {
  const date = getListingVerifiedDate(item);
  return date ? `<span class="${className}">확인 ${escapeHTML(date)}</span>` : '';
};

const getListingVerificationDateKey = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (_) {
    return new Date(Date.now() + (9 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  }
};

const showSiteToast = (message) => {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'site-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showSiteToast._timer);
  showSiteToast._timer = window.setTimeout(() => toast.classList.remove('show'), 1800);
};

const writeClipboardText = async (text) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  input.remove();
};

const copyListingLink = async (item = {}) => {
  try {
    await writeClipboardText(getListingDetailAbsoluteUrl(item));
    showSiteToast('매물 링크를 복사했습니다.');
  } catch (err) {
    console.error('Listing link copy failed:', err);
    showSiteToast('링크 복사에 실패했습니다.');
  }
};

const getFavoriteIds = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) || '[]').map(String);
  } catch (_) {
    return [];
  }
};

const setFavoriteIds = (ids) => localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify([...new Set(ids.map(String))]));
const isFavoriteListing = (id) => getFavoriteIds().includes(String(id || ''));
const toggleFavoriteListing = (id) => {
  const cleanId = String(id || '');
  if (!cleanId) return false;
  const ids = getFavoriteIds();
  const next = ids.includes(cleanId) ? ids.filter(v => v !== cleanId) : [...ids, cleanId];
  setFavoriteIds(next);
  return next.includes(cleanId);
};

const refreshFavoriteButtons = () => {
  document.querySelectorAll('[data-favorite-id]').forEach(btn => {
    const active = isFavoriteListing(btn.dataset.favoriteId);
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.textContent = active ? '♥' : '♡';
    btn.setAttribute('aria-label', active ? '찜 해제' : '찜하기');
    btn.title = active ? '찜 해제' : '찜하기';
  });
};

const shareListing = async (item = {}) => {
  const url = getListingDetailAbsoluteUrl(item);
  const title = item.title || '하이탑부동산 매물';
  if (navigator.share) {
    try {
      await navigator.share({ title, text: title, url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  await copyListingLink(item);
};

// 매물종류 표시 라벨 (전역 — 모든 함수에서 접근 가능)

const CAT_LABELS = {
  "shop": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "office": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "store": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "retail": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "commercial": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "factory": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "warehouse": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "land": "\ud1a0\uc9c0",
  "residential": "\uc8fc\uac70\uc6a9",
  "apartment": "\uc8fc\uac70\uc6a9",
  "officetel": "\uc8fc\uac70\uc6a9",
  "house": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "detached": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "singlehouse": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "building": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\uacf5\uc7a5\ucc3d\uace0": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "\uacf5\uc7a5\u00b7\ucc3d\uace0": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "\uacf5\uc7a5/\ucc3d\uace0": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "\uc0c1\uac00": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\ube4c\ub529": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\u00b7\ube4c\ub529": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\ud1a0\uc9c0": "\ud1a0\uc9c0",
  "\ud1a0\uc9c0\u00b7\uac1c\ubc1c": "\ud1a0\uc9c0",
  "\uc8fc\uac70\uc6a9": "\uc8fc\uac70\uc6a9",
  "\uc624\ud53c\uc2a4\ud154": "\uc8fc\uac70\uc6a9",
  "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815": "\uc8fc\uac70\uc6a9",
  "\uc544\ud30c\ud2b8": "\uc8fc\uac70\uc6a9",
  "\ub2e8\ub3c5\uc8fc\ud0dd": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd": "\uc8fc\uac70\uc6a9",
  "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd",
  "\uac74\ubb3c": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\ube4c\ub529": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\uac74\ubb3c\ube4c\ub529": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\uac74\ubb3c\u00b7\ube4c\ub529": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\uae30\ud0c0": "\uae30\ud0c0"
};

const CATEGORY_MAP = {
  "\uacf5\uc7a5\ucc3d\uace0": [
    "\uacf5\uc7a5",
    "\ucc3d\uace0",
    "\uacf5\uc7a5\ucc3d\uace0"
  ],
  "\uc0c1\uac00\uc0ac\ubb34\uc2e4": [
    "\uc0c1\uac00",
    "\uc0ac\ubb34\uc2e4",
    "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130"
  ],
  "\ud1a0\uc9c0": [
    "\ud1a0\uc9c0",
    "\uc784\uc57c",
    "\ub18d\uc9c0",
    "\ud0dd\uc9c0"
  ],
  "\uc8fc\uac70\uc6a9": [
    "\uc544\ud30c\ud2b8",
    "\uc624\ud53c\uc2a4\ud154",
    "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815"
  ],
  "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd": [
    "\ub2e8\ub3c5\uc8fc\ud0dd",
    "\uc804\uc6d0\uc8fc\ud0dd"
  ],
  "\uac74\ubb3c\ube4c\ub529": [
    "\uac74\ubb3c",
    "\ube4c\ub529",
    "\uc0c1\uac00\uc8fc\ud0dd",
    "\ub2e4\uac00\uad6c\uc8fc\ud0dd"
  ]
};

const PT_TO_CAT1 = {
  "shop": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "office": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "store": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "retail": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "commercial": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "factory": "\uacf5\uc7a5\ucc3d\uace0",
  "warehouse": "\uacf5\uc7a5\ucc3d\uace0",
  "land": "\ud1a0\uc9c0",
  "residential": "\uc8fc\uac70\uc6a9",
  "apartment": "\uc8fc\uac70\uc6a9",
  "officetel": "\uc8fc\uac70\uc6a9",
  "house": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "detached": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "singlehouse": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "building": "\uac74\ubb3c\ube4c\ub529",
  "\uacf5\uc7a5\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uacf5\uc7a5\u00b7\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uacf5\uc7a5/\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uc0c1\uac00": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc624\ud53c\uc2a4": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\ube4c\ub529": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\u00b7\ube4c\ub529": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\uc0c1\uac00\u00b7\ube4c\ub529\u00b7\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\uc0ac\ubb34\uc2e4",
  "\ud1a0\uc9c0": "\ud1a0\uc9c0",
  "\ud1a0\uc9c0\u00b7\uac1c\ubc1c": "\ud1a0\uc9c0",
  "\uc784\uc57c": "\ud1a0\uc9c0",
  "\ub18d\uc9c0": "\ud1a0\uc9c0",
  "\ud0dd\uc9c0": "\ud1a0\uc9c0",
  "\uc8fc\uac70\uc6a9": "\uc8fc\uac70\uc6a9",
  "\uc544\ud30c\ud2b8": "\uc8fc\uac70\uc6a9",
  "\uc624\ud53c\uc2a4\ud154": "\uc8fc\uac70\uc6a9",
  "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815": "\uc8fc\uac70\uc6a9",
  "\ub2e8\ub3c5\uc8fc\ud0dd": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd",
  "\uac74\ubb3c": "\uac74\ubb3c\ube4c\ub529",
  "\ube4c\ub529": "\uac74\ubb3c\ube4c\ub529",
  "\uac74\ubb3c\ube4c\ub529": "\uac74\ubb3c\ube4c\ub529",
  "\uac74\ubb3c\u00b7\ube4c\ub529": "\uac74\ubb3c\ube4c\ub529",
  "\uc0c1\uac00\uc8fc\ud0dd": "\uac74\ubb3c\ube4c\ub529",
  "\ub2e4\uac00\uad6c\uc8fc\ud0dd": "\uac74\ubb3c\ube4c\ub529",
  "\uae30\ud0c0": "\uae30\ud0c0"
};

const PT_TO_CAT2 = {
  "shop": "\uc0c1\uac00",
  "office": "\uc0ac\ubb34\uc2e4",
  "store": "\uc0c1\uac00",
  "retail": "\uc0c1\uac00",
  "commercial": "\uc0c1\uac00",
  "factory": "\uacf5\uc7a5",
  "warehouse": "\ucc3d\uace0",
  "land": "\ud1a0\uc9c0",
  "residential": "\uc624\ud53c\uc2a4\ud154",
  "apartment": "\uc544\ud30c\ud2b8",
  "officetel": "\uc624\ud53c\uc2a4\ud154",
  "house": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "detached": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "singlehouse": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "building": "\ube4c\ub529",
  "\uacf5\uc7a5\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uacf5\uc7a5\u00b7\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uacf5\uc7a5/\ucc3d\uace0": "\uacf5\uc7a5\ucc3d\uace0",
  "\uacf5\uc7a5": "\uacf5\uc7a5",
  "\ucc3d\uace0": "\ucc3d\uace0",
  "\uc0c1\uac00": "\uc0c1\uac00",
  "\uc0ac\ubb34\uc2e4": "\uc0ac\ubb34\uc2e4",
  "\uc624\ud53c\uc2a4": "\uc0ac\ubb34\uc2e4",
  "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130": "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130",
  "\uc0c1\uac00\ube4c\ub529": "\uc0c1\uac00",
  "\uc0c1\uac00\u00b7\ube4c\ub529": "\uc0c1\uac00",
  "\uc0c1\uac00\u00b7\ube4c\ub529\u00b7\uc0ac\ubb34\uc2e4": "\uc0c1\uac00",
  "\ud1a0\uc9c0": "\ud1a0\uc9c0",
  "\uc784\uc57c": "\uc784\uc57c",
  "\ub18d\uc9c0": "\ub18d\uc9c0",
  "\ud0dd\uc9c0": "\ud0dd\uc9c0",
  "\uc544\ud30c\ud2b8": "\uc544\ud30c\ud2b8",
  "\uc624\ud53c\uc2a4\ud154": "\uc624\ud53c\uc2a4\ud154",
  "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815": "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815",
  "\ub2e8\ub3c5\uc8fc\ud0dd": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "\uc804\uc6d0\uc8fc\ud0dd": "\uc804\uc6d0\uc8fc\ud0dd",
  "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "\ub2e8\ub3c5\u00b7\uc804\uc6d0\uc8fc\ud0dd": "\ub2e8\ub3c5\uc8fc\ud0dd",
  "\uac74\ubb3c": "\uac74\ubb3c",
  "\ube4c\ub529": "\ube4c\ub529",
  "\uac74\ubb3c\ube4c\ub529": "\ube4c\ub529",
  "\uac74\ubb3c\u00b7\ube4c\ub529": "\ube4c\ub529",
  "\uc0c1\uac00\uc8fc\ud0dd": "\uc0c1\uac00\uc8fc\ud0dd",
  "\ub2e4\uac00\uad6c\uc8fc\ud0dd": "\ub2e4\uac00\uad6c\uc8fc\ud0dd",
  "\uae30\ud0c0": "\uae30\ud0c0"
};

const derivePropertyType = (cat1, cat2) => {
  if (cat1 === "\uacf5\uc7a5\ucc3d\uace0") return "\uacf5\uc7a5\ucc3d\uace0";
  if (cat1 === "\uc0c1\uac00\uc0ac\ubb34\uc2e4") return cat2 === "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130" ? "\uc9c0\uc2dd\uc0b0\uc5c5\uc13c\ud130" : (cat2 || "\uc0c1\uac00");
  if (cat1 === "\ud1a0\uc9c0") return "\ud1a0\uc9c0";
  if (cat1 === "\uc8fc\uac70\uc6a9") return cat2 === "\uc544\ud30c\ud2b8" ? "\ud790\uc2a4\ud14c\uc774\ud2b8\ub354\uc6b4\uc815" : (cat2 || "\uc624\ud53c\uc2a4\ud154");
  if (cat1 === "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd") return cat2 || "\ub2e8\ub3c5\uc8fc\ud0dd";
  if (cat1 === "\uac74\ubb3c\ube4c\ub529") return cat2 || "\uac74\ubb3c\ube4c\ub529";
  return cat1 || '';
};

const getCategory1 = (item = {}) => {
  if (typeof item === 'string') {
    const raw = item.trim();
    return PT_TO_CAT1[raw] || PT_TO_CAT1[raw.toLowerCase()] || raw;
  }
  const rawCat1 = String(item.category1 || '').trim();
  if (rawCat1) {
    return PT_TO_CAT1[rawCat1] || PT_TO_CAT1[rawCat1.toLowerCase()] || rawCat1;
  }
  const rawType = String(item.propertyType || item.category || item.type || '').trim();
  return PT_TO_CAT1[rawType] || PT_TO_CAT1[rawType.toLowerCase()] || rawType;
};

// category2(2차구분) 정규화 — category1과 동일하게 legacy propertyType/type도 PT_TO_CAT2로 폴백
const getCategory2 = (item = {}) => {
  const rawCat2 = String(item.category2 || '').trim();
  if (rawCat2) return rawCat2;
  const rawType = String(item.propertyType || item.type || '').trim();
  return PT_TO_CAT2[rawType] || PT_TO_CAT2[rawType.toLowerCase()] || '';
};

const CAT1_DISPLAY = {
  "\uacf5\uc7a5\ucc3d\uace0": "\uacf5\uc7a5\u00b7\ucc3d\uace0",
  "\uc0c1\uac00\uc0ac\ubb34\uc2e4": "\uc0c1\uac00\u00b7\uc0ac\ubb34\uc2e4",
  "\ud1a0\uc9c0": "\ud1a0\uc9c0",
  "\uc8fc\uac70\uc6a9": "\uc8fc\uac70\uc6a9",
  "\ub2e8\ub3c5\uc804\uc6d0\uc8fc\ud0dd": "\uc8fc\uac70\uc6a9",
  "\uac74\ubb3c\ube4c\ub529": "\uac74\ubb3c\u00b7\ube4c\ub529",
  "\uae30\ud0c0": "\uae30\ud0c0"
};

const getPropertyTypeLabel = (value) => {
  if (value && typeof value === 'object') {
    const cat1 = getCategory1(value);
    return CAT1_DISPLAY[cat1] || CAT_LABELS[cat1] || cat1 || '-';
  }
  const v = String(value || '').trim();
  if (!v) return '-';
  const lower = v.toLowerCase();
  const cat1 = PT_TO_CAT1[v] || PT_TO_CAT1[lower] || v;
  return CAT1_DISPLAY[cat1] || CAT_LABELS[v] || CAT_LABELS[lower] || v || '-';
};

const normalizeCategoryParam = (value) => getCategory1(String(value || '').trim());

// 고객 화면용 단축 매물번호: 영문1자 + 숫자4자리 (내부 id 불변)
const getShortListingNo = (item) => {
  const id = String(item.id || '');
  const last4 = id.replace(/\D/g, '').slice(-4);
  if (!last4) return item.property_number || item.listingNo || id;
  const cat1 = getCategory1(item);
  const cat2 = String(item.category2 || '').trim();
  let prefix = 'P';
  if      (cat1 === '상가사무실')   prefix = 'S';
  else if (cat1 === '토지')         prefix = 'L';
  else if (cat1 === '공장창고')     prefix = 'F';
  else if (cat1 === '건물빌딩')     prefix = 'B';
  else if (cat1 === '단독전원주택') prefix = 'V';
  else if (cat1 === '주거용') {
    prefix = (cat2.includes('오피스텔') || cat2 === 'officetel') ? 'O' : 'H';
  }
  return prefix + last4;
};

const M2_PER_PY = 3.305785;

const toPyeong = (m2) => {
  const n = Number(m2);
  if (!Number.isFinite(n) || n <= 0) return '';
  return (n / M2_PER_PY).toFixed(2);
};

const getAreaSummaryParts = (listing = {}) => {
  const exclusive = listing.exclusiveArea ?? listing.privateArea ?? listing.areaExclusive ?? listing.exclusiveAreaM2 ?? listing.area_m2 ?? listing.area;
  const supply = listing.supplyArea ?? listing.grossArea ?? listing.areaSupply ?? listing.supplyAreaM2 ?? listing.supply_m2 ?? listing.contractArea;
  return [
    { label: '전용', value: exclusive },
    { label: '공급', value: supply },
  ]
    .map(part => ({ label: part.label, m2: Number(part.value) }))
    .filter(part => Number.isFinite(part.m2) && part.m2 > 0);
};

const formatAreaSummaryM2 = (listing = {}) => {
  const parts = getAreaSummaryParts(listing);
  if (!parts.length) return '-';
  return parts
    .map(part => `${part.label} ${part.m2.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}㎡`)
    .join(' / ');
};

const formatAreaSummaryPy = (listing = {}) => {
  const parts = getAreaSummaryParts(listing);
  if (!parts.length) return '-';
  return parts
    .map(part => `${part.label} ${toPyeong(part.m2)}평`)
    .join(' / ');
};

function formatParkingCount(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === '0') return '-';
  if (raw.includes('대')) return raw;
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}대`;
  return raw;
}

const getParkingText = (item = {}) => formatParkingCount(item.parkingCount ?? item.parkingSpaces ?? item.parking);
const getParkingMetaHTML = (item = {}, className = 'parking-meta') => {
  const parking = getParkingText(item);
  return parking === '-' ? '' : `<div class="${className}">주차 ${parking}</div>`;
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

// Supabase listings CRUD helpers
const _supabaseCfg = () => import('./supabase-config.js');

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const PROMOTION_STICKERS = ['추천매물', '급매물', '수익형', '역세권', '즉시입주', '단독공장', '민원적음', '추천업종', '권리금없음'];
const STICKER_ALIASES = {
  '추천': '추천매물',
  '급매': '급매물',
  '급매물': '급매물',
  '권리금 없음': '권리금없음'
};

const normalizeStickerValue = (value) => {
  const text = String(value ?? '').replace(/[⭐🔥📌]/g, '').trim();
  if (!text) return '';
  return STICKER_ALIASES[text] || text;
};

const stickerValuesFrom = (value) => {
  if (Array.isArray(value)) return value.flatMap(stickerValuesFrom);
  if (typeof value === 'string') {
    return value.split(/[,|]/).map(normalizeStickerValue).filter(Boolean);
  }
  return [];
};

const normalizePromotionStickers = (listing = {}) => {
  const merged = [
    ...stickerValuesFrom(listing.stickers),
    ...stickerValuesFrom(listing.promotionStickers),
    ...stickerValuesFrom(listing.promotion_stickers),
    ...stickerValuesFrom(listing.badges),
    ...stickerValuesFrom(listing.tags),
    ...stickerValuesFrom(listing.labels),
  ];

  if (listing.isRecommended === true || listing.isRecommended === 'true' || listing.is_recommended === true || listing.is_recommended === 'true') {
    merged.push('추천매물');
  }
  if (listing.isUrgent === true || listing.isUrgent === 'true' || listing.is_urgent === true || listing.is_urgent === 'true') {
    merged.push('급매물');
  }

  const allowed = new Set(PROMOTION_STICKERS);
  const selected = new Set(merged.map(normalizeStickerValue).filter(v => allowed.has(v)));
  return PROMOTION_STICKERS.filter(v => selected.has(v));
};

const hasPromotionSticker = (item, sticker) => normalizePromotionStickers(item).includes(sticker);

const getPromotionStickerHTML = (item, className = 'promo-sticker') => (
  normalizePromotionStickers(item)
    .map(sticker => `<span class="${className}">${sticker}</span>`)
    .join('')
);

const asNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const cleanObject = (obj) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== undefined)
);

function normalizeSupabaseListing(row) {
  const d = row.data && typeof row.data === 'object' ? row.data : {};
  const category1 = row.category1 ?? d.category1 ?? '';
  const category2 = row.category2 ?? d.category2 ?? '';
  const propertyType = d.propertyType || d.property_type || row.type || derivePropertyType(category1, category2) || category1;
  // row.stickers(실제 컬럼)가 정의되어 있으면 우선 사용, 없으면 JSONB data.stickers 폴백
  const stickerSource = Array.isArray(row.stickers) ? row.stickers : stickerValuesFrom(d.stickers);
  const stickers = normalizePromotionStickers({
    ...d,
    ...row,
    stickers: stickerValuesFrom(stickerSource),
  });
  return {
    ...d,
    id: row.id,
    type: row.type ?? d.type ?? propertyType,
    title: row.title ?? d.title ?? '',
    address: row.address ?? d.address ?? '',
    publicAddress: d.publicAddress ?? d.public_address ?? row.display_address ?? d.displayAddress ?? d.display_address ?? '',
    mapAddress: d.mapAddress ?? d.map_address ?? row.address ?? d.address ?? d.privateAddress ?? d.private_address ?? d.locationAddress ?? d.location_address ?? d.roadAddress ?? d.road_address ?? d.jibunAddress ?? d.jibun_address ?? '',
    privateDetailAddress: d.privateDetailAddress ?? d.private_detail_address ?? d.detailAddress ?? d.detail_address ?? '',
    roadAddress: d.roadAddress ?? d.road_address ?? '',
    jibunAddress: d.jibunAddress ?? d.jibun_address ?? '',
    status: row.status ?? d.status ?? '',
    description: row.detail_description ?? row.description ?? d.description ?? d.detailDescription ?? '',
    resource_id: row.resource_id ?? d.resource_id ?? d.resourceId ?? null,
    createdAt: row.created_at ?? d.createdAt ?? d.created_at ?? null,
    updatedAt: row.updated_at ?? d.updatedAt ?? d.updated_at ?? null,
    lastVerifiedAt: row.last_verified_at ?? d.lastVerifiedAt ?? d.last_verified_at ?? null,
    last_verified_at: row.last_verified_at ?? d.lastVerifiedAt ?? d.last_verified_at ?? null,
    is_public: row.is_public ?? d.is_public ?? false,
    displayAddress: row.display_address ?? d.displayAddress ?? d.display_address ?? d.publicAddress ?? d.public_address ?? '',
    category1,
    category2,
    dealType: row.deal_type ?? d.dealType ?? d.deal_type ?? '',
    salePrice: row.sale_price ?? d.salePrice ?? d.sale_price ?? '',
    deposit: row.deposit ?? d.deposit ?? '',
    monthlyRent: row.monthly_rent ?? d.monthlyRent ?? d.monthly_rent ?? '',
    areaM2: row.area_m2 ?? d.areaM2 ?? d.area_m2 ?? d.area ?? null,
    areaPy: row.area_py ?? d.areaPy ?? d.area_py ?? null,
    area: row.area_m2 ?? d.area ?? d.areaM2 ?? d.area_m2 ?? null,
    floorInfo: row.floor_info ?? d.floorInfo ?? d.floor_info ?? d.floor ?? '',
    zoning: row.zoning ?? d.zoning ?? d.zoningArea ?? '',
    parkingCount: row.parking_count ?? d.parkingCount ?? d.parking_count ?? d.parkingSpaces ?? d.parking_spaces ?? d.parking ?? '',
    parking: row.parking_count ?? d.parking ?? d.parkingCount ?? d.parking_count ?? '',
    detailDescription: row.detail_description ?? d.detailDescription ?? d.detail_description ?? '',
    stickers,
    imageUrls: asArray(row.image_urls ?? d.imageUrls ?? d.image_urls ?? d.imageUrl),
    propertyType,
    listingNo: d.listingNo ?? d.listing_no ?? row.resource_id ?? '',
    property_number: d.property_number ?? d.listingNo ?? d.listing_no ?? row.resource_id ?? '',
    is_completed: d.is_completed ?? false,
    pinSlot: Number(row.pin_slot ?? d.pinSlot ?? d.pin_slot ?? 0),
  };
}

function toSupabaseListingRow(listing, { isInsert = false } = {}) {
  const category1 = listing.category1 || PT_TO_CAT1[listing.propertyType || ''] || '';
  const category2 = listing.category2 || PT_TO_CAT2[listing.propertyType || ''] || '';
  const propertyType = listing.propertyType || derivePropertyType(category1, category2) || listing.type || '';
  const imageUrls = asArray(listing.imageUrls);
  const stickers = normalizePromotionStickers(listing);
  const publicAddress = getPublicAddress(listing);
  const mapAddress = getMapSearchAddress(listing);
  const privateDetailAddress = getPrivateDetailAddress(listing);
  const verifiedDate = getListingVerificationDateKey();
  const data = { ...listing, publicAddress, mapAddress, privateDetailAddress, category1, category2, propertyType, imageUrls, stickers, lastVerifiedAt: verifiedDate, last_verified_at: verifiedDate };
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.isRecommended;
  delete data.is_recommended;
  delete data.isUrgent;
  delete data.is_urgent;
  delete data.promotionStickers;
  delete data.promotion_stickers;
  delete data.badges;
  delete data.tags;
  delete data.labels;

  // resource_id는 UUID 타입이므로 UUID 형식인 경우만 사용
  const _isUuid = v => v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const _resourceId = listing.resource_id || listing.resourceId || null;

  const row = cleanObject({
    type: listing.type || propertyType || category1 || null,
    title: listing.title || null,
    address: mapAddress || null,
    status: listing.status || null,
    description: listing.description || listing.detailDescription || null,
    resource_id: _isUuid(_resourceId) ? _resourceId : null,
    is_public: listing.is_public === undefined ? true : listing.is_public === true || listing.is_public === 'true',
    display_address: publicAddress || null,
    category1: category1 || null,
    category2: category2 || null,
    deal_type: listing.dealType || listing.deal_type || null,
    sale_price: listing.salePrice === undefined ? null : String(listing.salePrice),
    deposit: listing.deposit === undefined ? null : String(listing.deposit),
    monthly_rent: listing.monthlyRent === undefined ? null : String(listing.monthlyRent),
    area_m2: asNumberOrNull(listing.areaM2 ?? listing.area),
    area_py: asNumberOrNull(listing.areaPy),
    floor_info: listing.floorInfo || listing.floor || null,
    zoning: listing.zoning || listing.zoningArea || null,
    detail_description: listing.detailDescription || listing.description || null,
    stickers,
    image_urls: imageUrls,
    last_verified_at: verifiedDate,
    pin_slot: Number(listing.pinSlot ?? listing.pin_slot ?? 0),
    data,
  });

  if (isInsert) {
    row.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    row.created_at = new Date().toISOString();
  }
  return row;
}

function toSupabasePartialListingRow(listing) {
  const row = {};
  if ('type' in listing || 'propertyType' in listing) row.type = listing.type || listing.propertyType || null;
  if ('title' in listing) row.title = listing.title || null;
  if ('address' in listing || 'mapAddress' in listing || 'map_address' in listing || 'roadAddress' in listing || 'jibunAddress' in listing || 'publicAddress' in listing) {
    row.address = getMapSearchAddress(listing) || null;
  }
  if ('status' in listing) row.status = listing.status || null;
  if ('description' in listing || 'detailDescription' in listing) row.description = listing.description || listing.detailDescription || null;
  if ('resource_id' in listing || 'resourceId' in listing || 'property_number' in listing || 'listingNo' in listing) {
    row.resource_id = listing.resource_id || listing.resourceId || listing.property_number || listing.listingNo || null;
  }
  if ('is_public' in listing) row.is_public = listing.is_public === true || listing.is_public === 'true';
  if ('displayAddress' in listing || 'display_address' in listing || 'publicAddress' in listing || 'public_address' in listing) {
    row.display_address = getPublicAddress(listing) || null;
  }
  if ('category1' in listing) row.category1 = listing.category1 || null;
  if ('category2' in listing) row.category2 = listing.category2 || null;
  if ('dealType' in listing || 'deal_type' in listing) row.deal_type = listing.dealType || listing.deal_type || null;
  if ('salePrice' in listing) row.sale_price = listing.salePrice === undefined ? null : String(listing.salePrice);
  if ('deposit' in listing) row.deposit = listing.deposit === undefined ? null : String(listing.deposit);
  if ('monthlyRent' in listing) row.monthly_rent = listing.monthlyRent === undefined ? null : String(listing.monthlyRent);
  if ('areaM2' in listing || 'area' in listing) row.area_m2 = asNumberOrNull(listing.areaM2 ?? listing.area);
  if ('areaPy' in listing) row.area_py = asNumberOrNull(listing.areaPy);
  if ('floorInfo' in listing || 'floor' in listing) row.floor_info = listing.floorInfo || listing.floor || null;
  if ('zoning' in listing || 'zoningArea' in listing) row.zoning = listing.zoning || listing.zoningArea || null;
  if ('parkingCount' in listing || 'parking_count' in listing || 'parking' in listing) {
    row.parking_count = listing.parkingCount || listing.parking_count || listing.parking || null;
  }
  if ('detailDescription' in listing) row.detail_description = listing.detailDescription || null;
  if ('stickers' in listing) row.stickers = normalizePromotionStickers(listing);
  if ('imageUrls' in listing) row.image_urls = asArray(listing.imageUrls);
  if ('lastVerifiedAt' in listing || 'last_verified_at' in listing) {
    row.last_verified_at = listing.lastVerifiedAt || listing.last_verified_at || null;
  }
  if ('pinSlot' in listing || 'pin_slot' in listing) row.pin_slot = Number(listing.pinSlot ?? listing.pin_slot ?? 0);
  return row;
}

async function readListingsFromSupabase({ publicOnly = false } = {}) {
  const { supabase } = await _supabaseCfg();
  let query = supabase
    .from(SUPABASE_LISTINGS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (publicOnly) query = query.eq('is_public', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeSupabaseListing);
}

const getKoreaDateKey = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (_) {
    const kst = new Date(Date.now() + (9 * 60 * 60 * 1000));
    return kst.toISOString().slice(0, 10);
  }
};

const normalizeVisitorStats = (data) => {
  const row = Array.isArray(data) ? data[0] : data;
  return {
    today: Number(row?.today_count ?? row?.today ?? row?.count ?? 0) || 0,
    total: Number(row?.total_count ?? row?.total ?? row?.count ?? 0) || 0
  };
};

async function incrementVisitorCountInSupabase() {
  const { supabase } = await _supabaseCfg();
  const today = getKoreaDateKey();

  try {
    const { data, error } = await supabase.rpc('increment_visitor_count', { p_date: today });
    if (error) throw error;
    return normalizeVisitorStats(data);
  } catch (rpcError) {
    console.warn('Visitor RPC unavailable, falling back to client update:', rpcError);
  }

  const { data: existing, error: readError } = await supabase
    .from(SUPABASE_VISITORS_TABLE)
    .select('id,date,count')
    .eq('date', today)
    .maybeSingle();
  if (readError) throw readError;

  if (existing) {
    const nextCount = (Number(existing.count) || 0) + 1;
    const { error } = await supabase
      .from(SUPABASE_VISITORS_TABLE)
      .update({ count: nextCount })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(SUPABASE_VISITORS_TABLE)
      .insert({ date: today, count: 1 });
    if (error) throw error;
  }

  const { data: rows, error: totalError } = await supabase
    .from(SUPABASE_VISITORS_TABLE)
    .select('date,count');
  if (totalError) throw totalError;

  const list = rows || [];
  return {
    today: Number(list.find(row => row.date === today)?.count || 0),
    total: list.reduce((sum, row) => sum + (Number(row.count) || 0), 0)
  };
}

const setupVisitorCounter = async () => {
  const box = document.getElementById('visitorCounter');
  if (!box) return;
  const todayEl = document.getElementById('visitorTodayCount');
  const totalEl = document.getElementById('visitorTotalCount');

  try {
    const stats = await incrementVisitorCountInSupabase();
    if (todayEl) todayEl.textContent = Number(stats.today).toLocaleString('ko-KR');
    if (totalEl) totalEl.textContent = Number(stats.total).toLocaleString('ko-KR');
    box.classList.remove('is-loading');
  } catch (err) {
    console.error('Visitor counter error:', err);
    box.classList.add('is-error');
    if (todayEl) todayEl.textContent = '-';
    if (totalEl) totalEl.textContent = '-';
  }
};

async function getListingFromSupabase(id) {
  const { supabase } = await _supabaseCfg();
  const { data, error } = await supabase
    .from(SUPABASE_LISTINGS_TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return normalizeSupabaseListing(data);
}

async function createListingInSupabase(listing) {
  const { supabase } = await _supabaseCfg();
  const { data, error } = await supabase
    .from(SUPABASE_LISTINGS_TABLE)
    .insert(toSupabaseListingRow(listing, { isInsert: true }))
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function updateListingInSupabase(id, data) {
  const { supabase } = await _supabaseCfg();
  const isFullListing = 'title' in data || 'address' in data || 'category1' in data || 'dealType' in data;
  const row = isFullListing ? toSupabaseListingRow(data) : toSupabasePartialListingRow(data);
  const { error } = await supabase
    .from(SUPABASE_LISTINGS_TABLE)
    .update(row)
    .eq('id', id);
  if (error) throw error;
}

async function deleteListingFromSupabase(id) {
  const { supabase } = await _supabaseCfg();
  const { error } = await supabase
    .from(SUPABASE_LISTINGS_TABLE)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

const formatPrice   = (n) => Number(n).toLocaleString('ko-KR');

// Google Drive 파일 ID 추출
const _driveFileId = (str) => {
  // /file/d/파일ID/view 형태
  const m1 = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  // ?id=파일ID 또는 &id=파일ID 형태
  const m2 = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return null;
};

// URL이 <img src>에서 직접 표시 가능한 이미지인지 판별
const isDisplayableUrl = (url) => {
  if (!url) return false;
  const str = String(url).trim();
  // Supabase Storage public URL
  if (str.includes('supabase.co/storage')) return true;
  // 일반 이미지 확장자 (쿼리스트링 포함 허용)
  if (/\.(jpe?g|png|webp|gif|bmp|svg)(\?|$)/i.test(str)) return true;
  // 일반 CDN (picsum, unsplash, googleusercontent 등)
  if (str.includes('picsum.photos') || str.includes('unsplash.com') || str.includes('googleusercontent.com')) return true;
  // Google Drive /file/d/.../view 는 직접 표시 불가 → 변환 필요
  if (str.includes('drive.google.com/file/d/')) return false;
  // drive.google.com 이지만 이미 thumbnail 형태인 경우
  if (str.includes('drive.google.com/thumbnail')) return true;
  return false;
};

// Google Drive 링크를 직접 표시 가능한 URL로 변환
// lh3.googleusercontent.com/d/파일ID 형식이 가장 안정적
const normalizeImageUrl = (url) => {
  if (!url) return '';
  const str = String(url).trim();
  if (!str.includes('drive.google.com')) return str;
  const fileId = _driveFileId(str);
  if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
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

// 이미지 URL 우선순위: imageUrls 배열 → imageUrl → thumbnail → 카테고리 기본 이미지
// Google Drive /file/d/...view 링크는 lh3.googleusercontent.com/d/파일ID 로 변환
const getThumbnail = (item) => {
  // imageUrls 가 배열이 아닌 경우(문자열 등) 방어 처리
  let urlArr = [];
  if (Array.isArray(item.imageUrls)) {
    urlArr = item.imageUrls;
  } else if (item.imageUrls && typeof item.imageUrls === 'string') {
    urlArr = [item.imageUrls];
  }

  const candidates = [...urlArr, item.imageUrl, item.thumbnail].filter(v => v && String(v).trim());

  let finalUrl = '';
  for (const raw of candidates) {
    const str = String(raw).trim();
    if (!str) continue;
    // Google Drive /file/d/.../view → lh3.googleusercontent.com 변환
    if (str.includes('drive.google.com')) {
      const fileId = _driveFileId(str);
      if (fileId) {
        finalUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
        break;
      }
      // fileId 추출 실패 시 다음 후보로
      continue;
    }
    // 그 외 URL은 그대로 사용 (Supabase, 일반 이미지 등)
    finalUrl = str;
    break;
  }

  if (!finalUrl) finalUrl = getDefaultImageByCategory(getCategory1(item));

  // 디버그용 로그 — 이미지가 제대로 연결되는지 확인 후 제거 예정
  console.log('[getThumbnail]', {
    title: item.title,
    imageUrls: item.imageUrls,
    imageUrl: item.imageUrl,
    thumbnail: item.thumbnail,
    finalUrl,
  });

  return finalUrl;
};
const pickFirstText = (item = {}, fields = []) => {
  for (const field of fields) {
    const value = item[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const getPublicAddress = (item = {}) => pickFirstText(item, [
  'publicAddress',
  'public_address',
  'displayAddress',
  'display_address',
  'address',
]);

const getMapSearchAddress = (item = {}) => pickFirstText(item, [
  'mapAddress',
  'map_address',
  'roadAddress',
  'road_address',
  'jibunAddress',
  'jibun_address',
  'address',
  'publicAddress',
  'public_address',
]);

const getPrivateDetailAddress = (item = {}) => pickFirstText(item, [
  'privateDetailAddress',
  'private_detail_address',
  'detailAddress',
  'detail_address',
]);

const getDisplayAddress = (item = {}) => getPublicAddress(item);
const getAdminAddressSummary = (item = {}) => {
  const parts = [
    ['공개', getPublicAddress(item)],
    ['지도', getMapSearchAddress(item)],
    ['상세', getPrivateDetailAddress(item)],
  ].filter(([, value]) => value);
  return parts.length ? parts.map(([label, value]) => `${label}: ${value}`).join(' · ') : '-';
};
const getMainPrice  = (item) => item.deposit || item.salePrice || item.price || 0;

const getComparablePriceManwon = (item = {}) => {
  const raw = getMainPrice(item);
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(String(raw).replace(/[,\s]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n >= 100000000 ? Math.round(n / 10000) : n;
};

const getComparableAreaPy = (item = {}) => {
  const pyCandidates = [
    item.exclusiveAreaPy,
    item.areaPy,
    item.buildingAreaPy,
    item.landAreaPy,
    item.supplyAreaPy,
  ];
  const py = pyCandidates.map(Number).find(v => Number.isFinite(v) && v > 0);
  if (py) return py;
  const m2Candidates = [
    item.exclusiveAreaM2 ?? item.exclusiveArea,
    item.areaM2 ?? item.area,
    item.buildingAreaM2 ?? item.buildingArea,
    item.landAreaM2 ?? item.landArea,
    item.supplyAreaM2 ?? item.supplyArea ?? item.contractArea,
  ];
  const m2 = m2Candidates.map(Number).find(v => Number.isFinite(v) && v > 0);
  return m2 ? m2 / M2_PER_PY : null;
};

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
//   - salePrice / presalePrice / deposit(전세) / price
//       admin form parseKoreanMoney 경유 → 원 단위 가능
//       직접 입력 → 만원 단위 가능 (데이터 혼재)
//       → smartFmtBig(): 1억(100,000,000) 이상이면 원 단위 간주 → 만원 변환 후 toKoreanPrice
//                         1억 미만이면 만원 단위 간주 → toKoreanPrice 직접
//   - deposit(월세/임대) / monthlyRent : 항상 원 단위 → wonToManwon 후 표시
//
// 거래유형별 표시 예시
//   매매 14,000,000,000원  → "140억원"   (원 단위 저장)
//   매매      1,400,000만원 → "140억원"   (만원 단위 저장)
//   전세         23,000만원 → "2억 3,000만원"
//   월세  deposit:10,000,000 / monthlyRent:600,000 → "1,000/60만원"
//   없음                                           → "가격문의"
const formatPropertyPrice = (item) => {
  if (item.priceText) return item.priceText;

  // 매매가·전세가·분양가용 스마트 변환
  // 1억(100,000,000) 이상 → 원 단위로 간주해 만원 변환 후 toKoreanPrice
  // 1억 미만             → 만원 단위로 간주해 toKoreanPrice 직접 적용
  const fmtManwon = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(String(v).replace(/[,\s]/g, ''));
    if (isNaN(n) || n <= 0) return null;
    const mw = n >= 100000000 ? Math.round(n / 10000) : n;
    return toKoreanPrice(mw);
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
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yy}${mm}${dd}-${hh}${mi}${ss}`;
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

// ── 전문관별 SEO 대표 키워드 (매물 상세 모달 사진 하단 캡션 + listing-detail.html meta keywords 공용) ──
const SEO_KEYWORD_POOLS = {
  '공장창고': ['파주공장창고매매', '파주공장창고임대', '파주공장매매', '파주창고매매', '파주공장임대', '파주창고임대', '파주공장창고전문부동산', '일산공장창고', '파주물류창고임대', '파주공장부지매매'],
  '상가사무실': ['운정상가임대', '운정상가매매', '파주상가임대', '파주상가매매', '파주사무실임대', '운정사무실임대', '운정역상가', '운정중심상업지구상가', '파주상가사무실', '파주상가사무실전문부동산'],
  '토지': ['파주토지매매', '파주땅매매', '파주공장부지매매', '파주창고부지매매', '파주개발부지', '파주투자토지', '파주야적장부지', '파주계획관리지역토지', '파주공장용지', '파주토지전문부동산'],
  '주거용': ['운정아파트전세', '운정아파트매매', '파주아파트전세', '파주아파트매매', '운정오피스텔월세', '운정오피스텔전세', '운정역오피스텔', '힐스테이트더운정', '파주단독주택매매', '파주단독택지'],
  '건물빌딩': ['파주건물매매', '파주빌딩매매', '운정건물매매', '운정빌딩매매', '파주근린생활시설매매', '파주상가주택매매', '파주꼬마빌딩매매', '파주건물임대', '파주빌딩임대', '파주건물빌딩전문부동산'],
};

/* category1/category2/type/propertyType 등 여러 필드에 값이 섞여 있을 수 있어
   정규화된 getCategory1() 결과를 우선 쓰되, 혹시 정확히 매칭되지 않는 레거시 값을 대비해
   원본 필드들도 문자열 포함(includes) 방식으로 한 번 더 안전하게 훑는다. */
const resolveSeoKeywordCategory = (item = {}) => {
  const cat1 = String(getCategory1(item) || '');
  // 상가주택·다가구주택은 category1이 건물빌딩이어도 "주거용" 이관 대상이므로 먼저 확인한다.
  const cat2 = String(getCategory2(item) || '');
  if (cat1.includes('건물') || cat1.includes('빌딩')) {
    if (cat2.includes('상가주택') || cat2.includes('다가구주택')) return '주거용';
    return '건물빌딩';
  }
  if (cat1.includes('공장') || cat1.includes('창고')) return '공장창고';
  if (cat1.includes('상가') || cat1.includes('사무실')) return '상가사무실';
  if (cat1.includes('토지')) return '토지';
  if (cat1.includes('주거') || cat1.includes('아파트') || cat1.includes('오피스텔')) return '주거용';

  const raw = [item.category1, item.category2, item.type, item.propertyType, item.property_type]
    .map(v => String(v || '')).join(' ');
  if (raw.includes('상가주택') || raw.includes('다가구주택')) return '주거용';
  if (raw.includes('건물') || raw.includes('빌딩')) return '건물빌딩';
  if (raw.includes('공장') || raw.includes('창고')) return '공장창고';
  if (raw.includes('상가') || raw.includes('사무실')) return '상가사무실';
  if (raw.includes('토지')) return '토지';
  if (raw.includes('아파트') || raw.includes('오피스텔') || raw.includes('주거') || raw.includes('단독주택')) return '주거용';
  return null;
};

/* count 생략 시 전체 10개(meta keywords용), 지정 시 앞에서부터 그만큼(화면 캡션용) 반환 */
const getSeoKeywords = (item, count) => {
  const cat = resolveSeoKeywordCategory(item);
  const pool = SEO_KEYWORD_POOLS[cat] || [];
  return count ? pool.slice(0, count) : pool.slice();
};

// ── 매물 상세 모달 ──
const ensureListingActionButton = (host, item, className = 'listing-favorite-btn') => {
  if (!host || !item?.id || host.querySelector('[data-favorite-id]')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.dataset.favoriteId = String(item.id);
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const active = toggleFavoriteListing(item.id);
    refreshFavoriteButtons();
    showSiteToast(active ? '찜한 매물에 담았습니다.' : '찜한 매물에서 뺐습니다.');
  });
  host.appendChild(btn);
  refreshFavoriteButtons();
};

const ensureModalActionButtons = (item = {}) => {
  const contact = document.querySelector('#listingModal .modal-contact');
  if (!contact) return;
  let favBtn = document.getElementById('modalFavoriteBtn');
  if (!favBtn) {
    favBtn = document.createElement('button');
    favBtn.id = 'modalFavoriteBtn';
    favBtn.type = 'button';
    favBtn.className = 'modal-copy-btn modal-favorite-btn';
    contact.appendChild(favBtn);
  }
  favBtn.dataset.favoriteId = String(item.id || '');
  favBtn.onclick = () => {
    const active = toggleFavoriteListing(item.id);
    refreshFavoriteButtons();
    showSiteToast(active ? '찜한 매물에 담았습니다.' : '찜한 매물에서 뺐습니다.');
  };
  let shareBtn = document.getElementById('modalShareBtn');
  if (!shareBtn) {
    shareBtn = document.createElement('button');
    shareBtn.id = 'modalShareBtn';
    shareBtn.type = 'button';
    shareBtn.className = 'modal-copy-btn modal-share-btn';
    contact.appendChild(shareBtn);
  }
  shareBtn.textContent = '↗';
  shareBtn.setAttribute('aria-label', '공유');
  shareBtn.title = '공유';
  shareBtn.onclick = () => shareListing(item);
  refreshFavoriteButtons();
};

const renderInlineConsultForm = (item = {}) => {
  const side = document.querySelector('#listingModal .modal-col-side');
  if (!side) return;
  let box = document.getElementById('modalInlineConsult');
  if (!box) {
    box = document.createElement('div');
    box.id = 'modalInlineConsult';
    box.className = 'modal-inline-consult';
    side.appendChild(box);
  }
  box.innerHTML = `
    <form id="modalConsultForm" class="modal-consult-form">
      <strong>매물 상담신청</strong>
      <div class="modal-consult-grid">
        <input id="modalConsultName" type="text" placeholder="이름" autocomplete="name" />
        <input id="modalConsultPhone" type="tel" placeholder="연락처" autocomplete="tel" />
      </div>
      <textarea id="modalConsultMessage" rows="3" placeholder="문의 내용을 남겨주세요."></textarea>
      <button type="submit">상담신청</button>
    </form>
  `;
  box.querySelector('#modalConsultForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = box.querySelector('#modalConsultName')?.value.trim();
    const phone = box.querySelector('#modalConsultPhone')?.value.trim();
    const message = box.querySelector('#modalConsultMessage')?.value.trim();
    if (!name || !phone) {
      showSiteToast('이름과 연락처를 입력해주세요.');
      return;
    }
    try {
      const { supabase } = await _supabaseCfg();
      const listingTitle = item.title || getShortListingNo(item) || '매물';
      const { error } = await supabase.from('consultations').insert({
        inquiry_type: '매물문의',
        title: `매물문의 - ${listingTitle}`,
        name,
        phone,
        message: message || `${listingTitle} 상담을 요청합니다.`,
        listing_title: listingTitle,
        source: 'listings-sidebar',
        status: '접수',
      });
      if (error) throw error;
      e.target.reset();
      showSiteToast('상담신청이 접수되었습니다.');
    } catch (err) {
      console.error('Listing consultation failed:', err);
      showSiteToast('상담신청 저장에 실패했습니다.');
    }
  });
};

const openModal = (item) => {
  const modal = document.getElementById('listingModal');
  if (!modal) return;
  const pt     = item.propertyType || '';
  const images = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
  const _mCat1      = getCategory1(item);
  const _mCat2      = item.category2 || PT_TO_CAT2[pt] || PT_TO_CAT2[String(pt).toLowerCase()] || '';
  const isFactory   = _mCat1 === '공장창고';
  const isStoreType = _mCat1 === '상가사무실';
  const isBuildingType  = _mCat1 === '공장창고' || _mCat1 === '단독전원주택' || _mCat1 === '건물빌딩';
  const isExclusiveType = _mCat1 === '상가사무실' || _mCat1 === '주거용';
  const isLandType      = _mCat1 === '토지';

  // ── 헤더 ──
  document.getElementById('modalId').textContent = getShortListingNo(item);
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
    const _badgeLabel = getPropertyTypeLabel(item);
    const promoHTML = getPromotionStickerHTML(item, 'modal-promo-sticker');
    modalBadgeEl.innerHTML = `<span class="modal-prop-badge ${propCls}">${_badgeLabel}</span>${getDealBadgeHTML(item.dealType)}${promoHTML}${getListingVerifiedBadgeHTML(item, 'modal-verified-badge')}`;
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
    // 그 외(매매가·분양가·전세보증금 등): 1억 이상이면 원 단위 간주 → 만원 변환
    const mw = n >= 100000000 ? Math.round(n / 10000) : n;
    return toKoreanPrice(mw);
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
    return { m2: hasM2 ? m2 : py * M2_PER_PY, py: hasPy ? py : m2 / M2_PER_PY };
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
    const py2str = parts.map(p => p.label ? `${p.label} ${toPyeong(p.m2)}평` : `${toPyeong(p.m2)}평`).join(' / ');
    return { m2str, pystr, py2str };
  };
  const areaInfo = buildAreaInfo();

  // ── 오른쪽 패널: 면적 하이라이트 ──
  const areaHlEl = document.getElementById('modalAreaHighlight');
  if (areaHlEl) {
    if (areaInfo) {
      const sideAreaM2 = isExclusiveType ? formatAreaSummaryM2(item) : (areaInfo.m2str || '-');
      const sideAreaPy = isExclusiveType ? formatAreaSummaryPy(item) : (areaInfo.py2str || areaInfo.pystr || '-');
      areaHlEl.innerHTML = `<div class="area-hl-row"><span class="area-hl-label">면적정보</span><div class="area-hl-control"><span class="area-hl-value" data-m2="${sideAreaM2}" data-py="${sideAreaPy}">${sideAreaM2}</span>${sideAreaM2 !== '-' ? '<button type="button" class="area-toggle-btn" id="modalAreaSummaryToggle" data-unit="m2">평</button>' : ''}</div></div>`;
      areaHlEl.style.display = '';
    } else {
      areaHlEl.innerHTML = '<div class="area-hl-row"><span class="area-hl-label">면적정보</span><span class="area-hl-value">-</span></div>';
      areaHlEl.style.display = '';
    }
    const areaSummaryToggle = areaHlEl.querySelector('#modalAreaSummaryToggle');
    if (areaSummaryToggle) {
      areaSummaryToggle.addEventListener('click', () => {
        const span = areaHlEl.querySelector('.area-hl-value');
        if (!span) return;
        if (areaSummaryToggle.dataset.unit === 'm2') {
          span.textContent = span.dataset.py;
          areaSummaryToggle.textContent = '㎡';
          areaSummaryToggle.dataset.unit = 'py';
        } else {
          span.textContent = span.dataset.m2;
          areaSummaryToggle.textContent = '평';
          areaSummaryToggle.dataset.unit = 'm2';
        }
      });
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
    const mw = n >= 100000000 ? Math.round(n / 10000) : n;
    return toKoreanPrice(mw);
  };

  const tableRows = [];
  const addRow = (label, value, cls) => {
    const v = (value !== null && value !== undefined && value !== '') ? String(value) : null;
    if (v) tableRows.push({ label, value: v, cls: cls || '' });
  };
  const propertyTypeLabel = getPropertyTypeLabel(item);

  addRow('주소',    getDisplayAddress(item));
  addRow('매물종류', propertyTypeLabel);
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
  addRow('주차대수', formatParkingCount(item.parkingCount ?? item.parkingSpaces ?? item.parking));
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
    infoTableEl.querySelectorAll('tr').forEach(row => {
      const labelEl = row.querySelector('.info-label');
      const valueEl = row.querySelector('.info-value');
      if (labelEl?.textContent?.trim() === '매물종류' && valueEl) {
        valueEl.textContent = propertyTypeLabel;
      }
    });
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
    // 이미지 없을 때: img 숨기고 안내 문구 표시
    mainImg.src = ''; mainImg.style.display = 'none'; mainImg.onclick = null;
    thumbsEl.innerHTML = '';
    const wrap = mainImg.closest('.modal-main-img');
    if (wrap && !wrap.querySelector('.modal-no-img')) {
      wrap.insertAdjacentHTML('beforeend',
        `<div class="modal-no-img">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <span>등록된 이미지 없음</span>
        </div>`
      );
    }
  }
  // 모달 열릴 때마다 이미지가 있으면 img 다시 표시
  if (images.length > 0) { mainImg.style.display = ''; mainImg.closest('.modal-main-img')?.querySelector('.modal-no-img')?.remove(); }

  // ── 사진 갤러리 하단 SEO 키워드 캡션 (전문관별 대표 키워드, listing-detail.html과 공용) ──
  // listing-detail.html은 이 openModal()을 그대로 재사용하므로 여기 한 곳만 고치면
  // listings.html/전문관 상세모달과 listing-detail.html 화면에 동일하게 반영된다.
  let seoKeywordsEl = document.getElementById('modalSeoKeywords');
  const photoCol = document.querySelector('.modal-col-photo');
  if (!seoKeywordsEl && photoCol) {
    seoKeywordsEl = document.createElement('div');
    seoKeywordsEl.id = 'modalSeoKeywords';
    seoKeywordsEl.className = 'modal-seo-keywords';
    photoCol.appendChild(seoKeywordsEl);
  }
  if (seoKeywordsEl) {
    const seoKeywords = getSeoKeywords(item, 6);
    if (seoKeywords.length) {
      seoKeywordsEl.textContent = `검색 키워드: ${seoKeywords.join(' · ')}`;
      seoKeywordsEl.style.display = '';
    } else {
      seoKeywordsEl.textContent = '';
      seoKeywordsEl.style.display = 'none';
    }
  }

  const printBtn = document.getElementById('modalPrintBtn');
  if (printBtn) {
    printBtn.dataset.id = getListingPrintId(item);
    printBtn.textContent = '⎙';
    printBtn.setAttribute('aria-label', '프린트');
    printBtn.title = '프린트';
  }
  const copyBtn = document.getElementById('modalCopyLinkBtn');
  if (copyBtn) {
    copyBtn.textContent = '🔗';
    copyBtn.setAttribute('aria-label', '링크복사');
    copyBtn.title = '링크복사';
    copyBtn.onclick = () => copyListingLink(item);
  }
  ensureModalActionButtons(item);
  renderInlineConsultForm(item);

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
const waitForAdminAuth = () => Promise.resolve(sessionStorage.getItem('hitopAdminLoggedIn') === 'true');
window.waitForAdminAuth = waitForAdminAuth;

const requireAdminLogin = () => {
  const overlay = document.getElementById('loginOverlay');
  const mainEl  = document.getElementById('adminMain');
  if (!overlay || !mainEl) return true;
  const ADMIN_PW = 'hitop2025';

  const showAdmin = () => {
    overlay.classList.add('hidden');
    mainEl.classList.remove('hidden');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-flex';
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('hitopAdminLoggedIn');
        location.reload();
      }, { once: true });
    }
  };

  if (sessionStorage.getItem('hitopAdminLoggedIn') === 'true') {
    showAdmin();
    return true;
  }

  overlay.classList.remove('hidden');
  mainEl.classList.add('hidden');

  const loginBtn   = document.getElementById('loginBtn');
  const loginPw    = document.getElementById('loginPw');
  const loginError = document.getElementById('loginError');
  const doLogin = () => {
    if (!loginPw) return;
    if (loginPw.value === ADMIN_PW) {
      sessionStorage.setItem('hitopAdminLoggedIn', 'true');
      location.reload();
      return;
    }
    loginError?.classList.remove('hidden');
    loginPw.value = '';
    loginPw.focus();
  };
  loginBtn?.addEventListener('click', doLogin);
  loginPw?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  return false;
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

  // ── 레거시 ?id= 상세보기 URL 정리 ──
  // listings.html?id=매물ID / factory-warehouse.html?id=매물ID 등으로 접속하면
  // 예전에는 모달을 자동으로 띄웠지만, 검색노출용 상세 URL을 listing-detail.html?id=
  // 하나로 통일하기 위해 모달을 열지 않고 즉시 그 주소로 리다이렉트한다.
  // listing-detail.html 자체는 data-page="listings"가 아니라 이 함수가 실행되지
  // 않지만, 방어적으로 한 번 더 경로를 확인한다.
  {
    const legacyId = new URLSearchParams(window.location.search).get('id');
    if (legacyId && !/listing-detail\.html$/.test(window.location.pathname)) {
      window.location.replace(getListingDetailUrl(legacyId));
      return;
    }
  }

  setupVisitorCounter();

  const CAT_LABELS = {
    '공장창고': '공장·창고',
    '상가사무실': '상가·사무실',
    '토지': '토지',
    '주거용': '주거용',
    '단독전원주택': '단독·전원주택',
    '건물빌딩': '건물·빌딩',
  };
  const SPECIALTY_TITLES = {
    '공장창고': '공장·창고 전문관',
    '상가사무실': '상가·사무실 전문관',
    '토지': '토지 전문관',
    '주거용': '주거용 전문관',
    '건물빌딩': '건물·빌딩 전문관',
  };
  const setSidebarSpecialtyTitle = (groupKey) => {
    const titleBar = document.getElementById('sidebarSpecialtyTitle');
    const titleText = document.getElementById('sidebarSpecialtyTitleText');
    if (!titleBar || !titleText) return;
    const title = SPECIALTY_TITLES[groupKey] || '';
    titleBar.hidden = !title;
    titleText.textContent = title;
  };
  const flt = { cat: '', deal: '', kw: '', formCat: '', formDeal: '', minPrice: '', maxPrice: '', minAreaPy: '', maxAreaPy: '', sidebarMatch: null };

  // ── "매물 구분" 사이드바 — 고객용으로 재편성한 1차·2차구분 트리 ──
  // 매물관리 프로그램 category1/category2(getCategory1/getCategory2로 레거시 표기까지 정규화됨)를
  // 홈페이지 노출 구조로 매핑한다. DB 값은 변경하지 않고 필터 매칭 함수로만 재편성한다.
  //  - 토지 > 단독택지  = category1=토지 & category2=택지
  //  - 주거용 > 단독주택/전원주택 = category1=단독전원주택 & category2로 구분(레거시로 category2가 비어있으면 단독주택으로 처리)
  //  - 주거용 > 다가구주택/상가주택 = category1=건물빌딩 & category2가 각각 일치
  //  - 건물·빌딩 > 건물/빌딩 = category1=건물빌딩 & category2가 각각 일치 (다가구주택·상가주택은 주거용으로만 노출, 여기서는 제외)
  const LP_CATEGORY_TREE = [
    {
      key: '공장창고',
      match: (i) => getCategory1(i) === '공장창고',
      children: [
        { key: '공장', match: (i) => getCategory1(i) === '공장창고' && getCategory2(i) === '공장' },
        { key: '창고', match: (i) => getCategory1(i) === '공장창고' && getCategory2(i) === '창고' },
      ],
    },
    {
      key: '상가사무실',
      match: (i) => getCategory1(i) === '상가사무실',
      children: [
        { key: '상가',   match: (i) => getCategory1(i) === '상가사무실' && getCategory2(i) === '상가' },
        { key: '사무실', match: (i) => getCategory1(i) === '상가사무실' && getCategory2(i) === '사무실' },
      ],
    },
    {
      key: '토지',
      match: (i) => getCategory1(i) === '토지',
      children: [
        { key: '토지',     match: (i) => getCategory1(i) === '토지' && getCategory2(i) === '토지' },
        { key: '단독택지', match: (i) => getCategory1(i) === '토지' && getCategory2(i) === '택지' },
      ],
    },
    {
      key: '주거용',
      match: (i) => {
        const c1 = getCategory1(i);
        if (c1 === '주거용' || c1 === '단독전원주택') return true;
        if (c1 === '건물빌딩') {
          const c2 = getCategory2(i);
          return c2 === '다가구주택' || c2 === '상가주택';
        }
        return false;
      },
      children: [
        { key: '아파트',     match: (i) => getCategory1(i) === '주거용' && getCategory2(i) === '아파트' },
        { key: '오피스텔',   match: (i) => getCategory1(i) === '주거용' && getCategory2(i) === '오피스텔' },
        { key: '단독주택',   match: (i) => getCategory1(i) === '단독전원주택' && getCategory2(i) !== '전원주택' },
        { key: '전원주택',   match: (i) => getCategory1(i) === '단독전원주택' && getCategory2(i) === '전원주택' },
        { key: '다가구주택', match: (i) => getCategory1(i) === '건물빌딩' && getCategory2(i) === '다가구주택' },
        { key: '상가주택',   match: (i) => getCategory1(i) === '건물빌딩' && getCategory2(i) === '상가주택' },
      ],
    },
    {
      key: '건물빌딩',
      // 다가구주택·상가주택은 "주거용"으로 이관되어 여기서는 제외(건물/빌딩/건물빌딩 등 순수 건물·빌딩 매물만)
      match: (i) => {
        if (getCategory1(i) !== '건물빌딩') return false;
        const c2 = getCategory2(i);
        return c2 !== '다가구주택' && c2 !== '상가주택';
      },
      children: [
        { key: '건물', match: (i) => getCategory1(i) === '건물빌딩' && getCategory2(i) === '건물' },
        { key: '빌딩', match: (i) => getCategory1(i) === '건물빌딩' && getCategory2(i) === '빌딩' },
      ],
    },
  ];
  // ?category= / data-default-category 초기 복원 시 CRM category1 값을 사이드바 그룹 키로 매핑
  const CAT1_TO_LP_GROUP = {
    '공장창고': '공장창고', '상가사무실': '상가사무실', '토지': '토지',
    '주거용': '주거용', '단독전원주택': '주거용', '건물빌딩': '건물빌딩',
  };
  let sortMode = 'date';
  let allPage  = 1;
  const ALL_SIZE = 15;
  let filtered = [];
  let _listings = [];

  // 돌아가기: 항상 Supabase 실제 추천매물로 재렌더링
  const restoreDefaultPanel = () => {
    const lpPanel = document.getElementById('lpPanel');
    if (lpPanel) lpPanel.classList.remove('cat-view-mode');
    document.querySelectorAll('.cat-card').forEach(card => card.classList.remove('active'));
    renderSpecialPanels(); // 샘플 HTML 복원 대신 실제 데이터로 다시 렌더링
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
    setSidebarSpecialtyTitle(CAT1_TO_LP_GROUP[categoryKey] || categoryKey);
    const lpPanel = document.getElementById('lpPanel');
    if (!lpPanel) return;

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
              ${getDisplayAddress(item)}
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
  let map = null, openIw = null, markerClusterer = null, markerRenderSeq = 0;
  let _mapReady = false;   // 지도 초기화 완료 플래그
  let _dataReady = false;  // Supabase 로드 완료 플래그
  const activeMarkers = [];

  // 매물종류별 숫자 원형 마커 색상
  const MARKER_COLORS = {
    '공장·창고':     '#0d9488',
    '상가·사무실':   '#e53e3e',
    '토지':         '#f97316',
    '주거용':       '#2563eb',
    '단독·전원주택': '#16a34a',
    '건물·빌딩':     '#7c3aed',
  };
  const MARKER_COLOR_MIXED = '#64748b';
  const getMarkerColorByCategory = (category1) => {
    const label = CAT1_DISPLAY[normalizeCategoryParam(category1)] || getPropertyTypeLabel(category1);
    return MARKER_COLORS[label] || MARKER_COLOR_MIXED;
  };
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
  const getListingAddress = (item = {}) => {
    return getMapSearchAddress(item);
  };
  const getListingAddressCandidates = (item = {}) => {
    const values = ['mapAddress', 'map_address', 'roadAddress', 'road_address', 'jibunAddress', 'jibun_address', 'address', 'publicAddress', 'public_address']
      .map(field => (typeof item[field] === 'string' ? item[field].trim() : ''))
      .filter(Boolean);
    const list = [];
    const add = value => {
      const clean = String(value || '').replace(/\s+/g, ' ').trim();
      if (clean && !list.includes(clean)) list.push(clean);
    };
    const address = getMapSearchAddress(item);
    const display = getPublicAddress(item);

    values.forEach(add);
    if (display && address && address !== display) {
      add(`${display} ${address}`);
      if (!/^경기|^서울|^인천|^부산|^대구|^광주|^대전|^울산|^세종|^강원|^충청|^전라|^경상|^제주/.test(display)) {
        add(`경기도 ${display} ${address}`);
      }
    }
    values.forEach(value => {
      if (/^파주/.test(value)) add(`경기도 ${value}`);
    });
    return list;
  };

  // ── 필드 헬퍼 ──
  const isCompleted = i => i.is_completed === true || i.status === 'done' || i.status === '거래완료';
  const isRec       = i => hasPromotionSticker(i, '추천매물');
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
  const updateDynamicCounts = () => {
    const all = _listings.filter(i => !isCompleted(i));
    const ensureBadge = (el) => {
      if (!el) return null;
      let badge = el.querySelector('.lp-cat-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'lp-cat-badge';
        el.appendChild(badge);
      }
      return badge;
    };
    const setBadge = (el, count) => {
      const badge = ensureBadge(el);
      if (badge) badge.textContent = count.toLocaleString('ko-KR');
    };
    document.querySelectorAll('.lp-cat-all').forEach(el => setBadge(el, all.length));
    LP_CATEGORY_TREE.forEach(group => {
      const groupCount = all.filter(group.match).length;
      document.querySelectorAll(`.lp-cat-group-toggle[data-group="${group.key}"]`).forEach(el => setBadge(el, groupCount));
      group.children.forEach(child => {
        const childCount = all.filter(child.match).length;
        document.querySelectorAll(`.lp-cat-sub-item[data-group="${group.key}"][data-child="${child.key}"]`).forEach(el => setBadge(el, childCount));
      });
    });
  };

  const placeMarkers = (items) => {
    console.log('[placeMarkers] 호출됨 | map준비:', _mapReady, '| 매물수:', items.length);
    if (!map || typeof kakao === 'undefined') {
      console.warn('[placeMarkers] 지도 미초기화 — 건너뜀');
      return;
    }
    const renderSeq = ++markerRenderSeq;
    markerClusterer?.clear();
    activeMarkers.forEach(m => m.setMap(null));
    activeMarkers.length = 0;
    if (openIw) { openIw.close(); openIw = null; }

    // 그룹 컬러: getCategory1으로 정규화된 정상 카테고리 색상 사용, 진짜 기타만 슬레이트
    const getGroupColor = (gi) => {
      const categories = [...new Set(gi.map(i => getCategory1(i)).filter(Boolean))];
      const coloredCategory = categories.find(cat => getMarkerColorByCategory(cat) !== MARKER_COLOR_MIXED);
      return coloredCategory ? getMarkerColorByCategory(coloredCategory) : MARKER_COLOR_MIXED;
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
    const withoutCoords = active.filter(i => !_hasCoord(i) && getListingAddress(i));

    // 진단 로그: 실제 데이터 필드 확인
    console.log('[placeMarkers] 좌표O:', withCoords.length, '| 좌표X(주소검색):', withoutCoords.length);
    if (active.length > 0) {
      const s = active[0];
      console.log('[매물 샘플]', {
        propertyType: s.propertyType, category: s.category, type: s.type,
        lat: s.lat, lng: s.lng, latitude: s.latitude, longitude: s.longitude,
        coordX: s.coordX, coordY: s.coordY,
        address: s.address, displayAddress: s.displayAddress, mapAddress: getListingAddress(s)
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
        const addrList = getListingAddressCandidates(item);
        if (!addrList.length) return;

        const tryNext = (idx) => {
          if (idx >= addrList.length) return;
          const addr = addrList[idx];
          geocoder.addressSearch(addr, (result, status) => {
            if (renderSeq !== markerRenderSeq) return;
            if (status !== kakao.maps.services.Status.OK) {
              console.log(`[지오코딩 실패 ${idx + 1}순위] ${addr}`);
              tryNext(idx + 1);
              return;
            }
            console.log(`[지오코딩 성공 ${idx + 1}순위] ${addr}`);
            const coords = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
            addOverlay(coords, [item]);
            if (withCoords.length === 0 && activeMarkers.length === 1) {
              map.setCenter(coords);
              map.setLevel(5);
            }
          });
        };

        tryNext(0);
      });
    }
  };

  // ── 지도+데이터 모두 준비됐을 때 마커 표시 ──
  // applyFilters()가 이미 계산해 둔 filtered(사이드바 sidebarMatch 포함 전체 필터 결과)를 그대로 사용한다.
  // 과거에는 여기서 category1만으로 별도 필터링해 sidebarMatch(예: 건물·빌딩에서 상가주택/다가구주택 제외)를
  // 무시한 채 마커를 덮어써, 카드 목록과 지도 마커 개수가 어긋나는 문제가 있었다.
  const _tryShowMarkers = () => {
    if (!_mapReady || !_dataReady) return;
    console.log('[_tryShowMarkers] 마커 표시 시작 | 필터 적용된 매물수:', filtered.length);
    placeMarkers(filtered);
  };

  // ── 지도 초기화 ──
  const loadKakaoMaps = (onReady, onFail) => {
    if (window.kakao && kakao.maps) {
      kakao.maps.load(onReady);
      return;
    }

    let script = document.getElementById('kakaoMapSdkLoader');
    const handleLoad = () => {
      if (window.kakao && kakao.maps) kakao.maps.load(onReady);
      else if (onFail) onFail();
    };
    const handleError = () => { if (onFail) onFail(); };

    if (script) {
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      return;
    }

    script = document.createElement('script');
    script.id = 'kakaoMapSdkLoader';
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=0cf11ac4a1f56654aa6b7f66b7b0d05f&libraries=services,clusterer&autoload=false';
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);
  };

  const relayoutMainMap = () => {
    if (!map || typeof kakao === 'undefined') return;
    const center = map.getCenter();
    map.relayout();
    map.setCenter(center);
  };

  const scheduleMainMapRelayout = () => {
    [0, 120, 360].forEach(delay => {
      window.setTimeout(relayoutMainMap, delay);
    });
  };

  window.addEventListener('load', () => {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    const showMapLoadError = () => {
      console.warn('[Map] Kakao Maps SDK 로드 실패');
      mapEl.innerHTML = '<div class="map-loading">지도를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>';
    };
    loadKakaoMaps(() => {
      mapEl.innerHTML = '';
      map = new kakao.maps.Map(mapEl, {
        center: new kakao.maps.LatLng(37.7512, 126.7820),
        level: 7
      });
      if (kakao.maps.MarkerClusterer) {
        markerClusterer = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
          minClusterSize: 2,
        });
      }
      if (typeof map.setDraggable === 'function') map.setDraggable(true);
      if (typeof map.setZoomable === 'function') map.setZoomable(true);
      scheduleMainMapRelayout();
      _mapReady = true;
      console.log('[Map] 카카오맵 초기화 완료');
      applyFilters();
      _tryShowMarkers();
    }, showMapLoadError);
  });

  window.addEventListener('resize', scheduleMainMapRelayout);
  window.addEventListener('orientationchange', scheduleMainMapRelayout);

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
    const minimapWrap = document.getElementById('modalBodyMapWrap') || document.getElementById('modalMinimapWrap');
    const minimapEl   = document.getElementById('modalBodyMap') || document.getElementById('modalMiniMap');
    if (!minimapWrap || !minimapEl) return;
    const modalAddressList = getListingAddressCandidates(item);
    minimapWrap.style.display = _hasCoord(item) || modalAddressList.length ? 'block' : 'none';
    const showModalMapLoadError = () => {
      minimapWrap.style.display = 'block';
      minimapEl.innerHTML = '<div class="map-loading">지도를 불러올 수 없습니다</div>';
    };

    loadKakaoMaps(() => {
      const renderMinimap = (coords) => {
        minimapWrap.style.display = 'block';
        minimapEl.innerHTML = '';
        const mm = new kakao.maps.Map(minimapEl, { center: coords, level: 4 });
        new kakao.maps.Marker({ map: mm, position: coords });
        window.setTimeout(() => {
          mm.relayout();
          mm.setCenter(coords);
        }, 120);
      };

      if (_hasCoord(item)) {
        const coords = new kakao.maps.LatLng(_getLat(item), _getLng(item));
        renderMinimap(coords);
      } else if (modalAddressList.length && kakao.maps.services) {
        const geocoder = new kakao.maps.services.Geocoder();
        const tryNextAddress = (idx) => {
          if (idx >= modalAddressList.length) {
            showModalMapLoadError();
            return;
          }
          geocoder.addressSearch(modalAddressList[idx], (result, status) => {
            if (status !== kakao.maps.services.Status.OK || !result || !result[0]) {
              tryNextAddress(idx + 1);
              return;
            }
            const coords = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
            renderMinimap(coords);
          });
        };
        tryNextAddress(0);
      } else if (modalAddressList.length) {
        showModalMapLoadError();
      }
    }, showModalMapLoadError);
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

  // ── 오른쪽 패널: 최근 등록 매물 (최신순, 내부 스크롤) ──
  const renderSpecialPanels = () => {
    const lpPanel = document.getElementById('lpPanel');
    if (!lpPanel) return;

    // 거래완료 제외, 현재 필터 기준 적용 → pinSlot 우선, 이후 createdAt 내림차순 정렬
    const recentItems = [...filtered.filter(i => !isCompleted(i))].sort((a, b) => {
      const pa = a.pinSlot || 0, pb = b.pinSlot || 0;
      if (pa !== pb) {
        if (pa > 0 && pb > 0) return pa - pb; // 1번이 2번보다 위
        return pb > 0 ? 1 : -1;
      }
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    const hasPinned = recentItems.some(i => (i.pinSlot || 0) > 0);

    const miniCardHTML = item => {
      const thumb    = getThumbnail(item);
      const fallback = getDefaultImageByCategory(getCategory1(item));
      const label    = getPropertyTypeLabel(item);
      const safeTitle = (item.title || '(제목 없음)').replace(/"/g, '&quot;');
      const areaHTML = getCardAreaHTML(item);
      const isSample = thumb.startsWith('images/') || thumb === fallback;
      const imgClass = `lp-mini-img${isSample ? ' lp-mini-img--sample' : ''}`;
      const verifiedHTML = getListingVerifiedBadgeHTML(item, 'lp-mini-verified');

      // ── 이미지 위 좌측 상태 배지 (최대 2개) ──
      const statusBadges = [];
      const _pinSlot = item.pinSlot || 0;
      if (_pinSlot === 1 || _pinSlot === 2) {
        statusBadges.push(`<span class="mcb mcb-pin">📌 대표추천</span>`);
      } else if (hasPromotionSticker(item, '추천매물')) {
        statusBadges.push(`<span class="mcb mcb-rec">⭐ 추천매물</span>`);
      }
      if (hasPromotionSticker(item, '급매물'))   statusBadges.push(`<span class="mcb mcb-urgent">급매물</span>`);
      if (item.isExclusive === true || item.is_exclusive === true)
                                   statusBadges.push(`<span class="mcb mcb-excl">전속</span>`);
      // 7일 이내 등록이면 신규 배지
      const createdMs = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      if (!statusBadges.length && createdMs && Date.now() - createdMs < 7 * 86400000)
                                   statusBadges.push(`<span class="mcb mcb-new">NEW</span>`);

      const badgeRow = statusBadges.length
        ? `<div class="mc-status-badges">${statusBadges.join('')}</div>` : '';

      // 매물번호 (고객용 단축번호)
      const propNo = getShortListingNo(item);
      const propNoHTML = propNo ? `<div class="mc-propno">No. ${propNo}</div>` : '';

      return `<article class="lp-mini-card" data-id="${item.id}">
        <div class="lp-mini-img-wrap">
          <img src="${thumb}" alt="${safeTitle}" class="${imgClass}"
               onerror="this.onerror=null;this.src='${fallback}';" />
          ${badgeRow}
        </div>
        <div class="lp-mini-body">
          <div class="mc-top-row">
            <span class="lp-mini-type-tag">${label}</span>
            ${propNoHTML}
          </div>
          <div class="lp-mini-title">${item.title || '(제목 없음)'}</div>
          ${verifiedHTML}
          <div class="lp-mini-price-row">
            ${getDealBadgeHTML(item.dealType)}
            <span class="lp-mini-price">${formatPropertyPrice(item)}</span>
          </div>
          <div class="lp-mini-addr">📍 ${getDisplayAddress(item) || '-'}</div>
          ${areaHTML ? `<div class="lp-mini-area">${areaHTML}</div>` : ''}
        </div>
      </article>`;
    };

    lpPanel.innerHTML = `
      <div class="lp-panel-hd-sticky">
        <span class="lp-panel-hd-title">${hasPinned ? '⭐ 추천 매물' : '🆕 최근 등록 매물'}</span>
        <span class="lp-panel-hd-count">${recentItems.length}건</span>
      </div>
      <div class="lp-panel-scroll-body">
        ${recentItems.length
          ? `<div class="lp-panel-section-body">${recentItems.map(miniCardHTML).join('')}</div>`
          : '<div class="lp-panel-empty" style="padding:20px 16px;">등록된 매물이 없습니다.</div>'}
      </div>`;

    lpPanel.querySelectorAll('.lp-mini-card').forEach(card => {
      const found = _listings.find(x => x.id === card.dataset.id);
      if (found) ensureListingActionButton(card.querySelector('.lp-mini-img-wrap'), found, 'listing-favorite-btn lp-mini-favorite-btn');
      card.addEventListener('click', () => {
        if (found) openModalFull(found);
      });
    });
  };

  // ── 전체 매물 그리드 카드 HTML ──
  const fullCardHTML = item => {
    const done    = isCompleted(item);
    const cat1    = getCategory1(item);
    const catLabel = getPropertyTypeLabel(item);
    const imgSrc  = getThumbnail(item);
    const areaHTML = getCardAreaHTML(item);
    const verifiedHTML = getListingVerifiedBadgeHTML(item, 'lp-all-verified');
    return `
      <article class="lp-all-card${done ? ' lp-all-done' : ''}" data-id="${item.id}">
        <div class="lp-all-img">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'" />` : ''}
          ${done ? '<div class="lp-all-sold">거래완료</div>' : ''}
          <span class="lp-all-cat-tag">${catLabel}</span>
          ${(item.pinSlot === 1 || item.pinSlot === 2)
            ? '<span class="promo-pin-sticker">📌 대표추천</span>'
            : isRec(item)
            ? '<span class="promo-rec-sticker">⭐ 추천매물</span>'
            : ''}
          ${hasPromotionSticker(item, '급매물') ? '<span style="position:absolute;bottom:6px;right:6px;background:#e53e3e;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;line-height:1.4;">급매물</span>' : ''}
        </div>
        <div class="lp-all-body">
          <div class="lp-all-row-top">
            <span class="lp-all-type-tag">${catLabel}</span>
            ${getDealBadgeHTML(item.dealType)}
          </div>
          <div class="lp-all-price">${formatCardPrice(item)}</div>
          <div class="lp-all-title">${item.title || ''}</div>
          ${verifiedHTML}
          ${areaHTML ? `<div class="lp-all-area-wrap">${areaHTML}</div>` : ''}
          ${getParkingMetaHTML(item, 'lp-all-parking')}
          <div class="lp-all-addr">${getDisplayAddress(item)}</div>
          <a class="lp-all-detail-link" href="listing-detail.html?id=${encodeURIComponent(item.id)}">상세페이지 보기</a>
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
      const foundForLink = filtered.find(x => x.id === card.dataset.id);
      const detailLink = card.querySelector('.lp-all-detail-link');
      if (foundForLink && detailLink) detailLink.href = getListingDetailUrl(foundForLink);
      if (foundForLink) ensureListingActionButton(card.querySelector('.lp-all-img'), foundForLink, 'listing-favorite-btn lp-all-favorite-btn');
      card.addEventListener('click', (e) => {
        if (e.target.closest('.lp-all-detail-link')) return;
        const found = filtered.find(x => x.id === card.dataset.id);
        if (found) openModalFull(found);
      });
      card.querySelector('.lp-all-detail-link')?.addEventListener('click', (e) => {
        e.stopPropagation();
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
    if (effectiveCat)     items = items.filter(i => getCategory1(i) === effectiveCat);
    if (flt.sidebarMatch) items = items.filter(flt.sidebarMatch);
    if (effectiveDeal)    items = items.filter(i => i.dealType === effectiveDeal);
    const minPrice = Number(flt.minPrice);
    const maxPrice = Number(flt.maxPrice);
    const minAreaPy = Number(flt.minAreaPy);
    const maxAreaPy = Number(flt.maxAreaPy);
    if (Number.isFinite(minPrice) && minPrice > 0) items = items.filter(i => (getComparablePriceManwon(i) ?? -1) >= minPrice);
    if (Number.isFinite(maxPrice) && maxPrice > 0) items = items.filter(i => {
      const price = getComparablePriceManwon(i);
      return price !== null && price <= maxPrice;
    });
    if (Number.isFinite(minAreaPy) && minAreaPy > 0) items = items.filter(i => (getComparableAreaPy(i) ?? -1) >= minAreaPy);
    if (Number.isFinite(maxAreaPy) && maxAreaPy > 0) items = items.filter(i => {
      const area = getComparableAreaPy(i);
      return area !== null && area <= maxAreaPy;
    });
    if (flt.kw)        items = items.filter(i => {
      const kw = flt.kw;
      return (i.title        || '').toLowerCase().includes(kw) ||
             getPublicAddress(i).toLowerCase().includes(kw) ||
             (i.detailDescription || '').toLowerCase().includes(kw) ||
             getPropertyTypeLabel(i).toLowerCase().includes(kw);
    });
    const pinSort = (a, b) => {
      const pa = a.pinSlot || 0, pb = b.pinSlot || 0;
      if (pa !== pb) {
        if (pa > 0 && pb > 0) return pa - pb;
        return pb > 0 ? 1 : -1;
      }
      return 0;
    };
    if (sortMode === 'price') items.sort((a, b) => pinSort(a, b) || Number(getMainPrice(b)) - Number(getMainPrice(a)));
    else items.sort((a, b) => pinSort(a, b) || (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || ''));
    filtered = items;
    allPage  = 1;
    renderAllGrid();
    renderSpecialPanels();
    updateCounts();
    updateDynamicCounts();
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

  // ── 사이드바 "매물 구분" 아코디언 (LP_CATEGORY_TREE 기반) ──
  const setSidebarActive = (el) => {
    document.querySelectorAll('.lp-catlist-item.active, .lp-cat-sub-item.active')
      .forEach(x => x.classList.remove('active'));
    el?.classList.add('active');
  };
  const openSidebarGroup = (groupKey) => {
    document.querySelectorAll('.lp-cat-group').forEach(g =>
      g.classList.toggle('open', !!groupKey && g.dataset.group === groupKey));
  };
  // 사이드바 선택은 formCatSelect(매물관리 6종 원본 구분)와 값 체계가 달라(예: 주거용은
  // 3개 category1을 묶은 값) 실제 필터에는 관여하지 않고, 큰 카테고리 클릭 시 표시만 맞춰준다.
  const syncFormCatSelect = (groupKey) => {
    const fc = document.getElementById('formCatSelect');
    if (fc) fc.value = groupKey || '';
  };
  const selectCategoryGroup = (groupKey) => {
    const group = LP_CATEGORY_TREE.find(g => g.key === groupKey);
    flt.sidebarMatch = group ? group.match : null;
    flt.cat = '';
    flt.formCat = '';
    syncFormCatSelect(groupKey);
    setSidebarSpecialtyTitle(groupKey);
    openSidebarGroup(groupKey);
    document.querySelectorAll('.lp-catlist-item.active, .lp-cat-sub-item.active')
      .forEach(x => x.classList.remove('active'));
    document.querySelector(`.lp-cat-group-toggle[data-group="${groupKey}"]`)?.classList.add('active');
    document.querySelectorAll('.cat-card').forEach(card => {
      const href = (card.getAttribute('href') || '').split('?')[0];
      const activeHref = {
        '공장창고': 'factory-warehouse.html',
        '상가사무실': 'commercial-office.html',
        '토지': 'land.html',
        '주거용': 'residential.html',
        '건물빌딩': 'building.html',
      }[groupKey];
      card.classList.toggle('active', href === activeHref);
    });
    applyFilters();
  };
  const clearCategoryGroup = () => {
    Object.assign(flt, { cat: '', formCat: '', sidebarMatch: null });
    syncFormCatSelect('');
    setSidebarSpecialtyTitle('');
    openSidebarGroup('');
    document.querySelectorAll('.lp-catlist-item.active, .lp-cat-sub-item.active')
      .forEach(x => x.classList.remove('active'));
    document.querySelector('.lp-cat-all')?.classList.add('active');
    document.querySelectorAll('.cat-card').forEach(card =>
      card.classList.toggle('active', (card.getAttribute('href') || '') === 'listings.html'));
    applyFilters();
  };

  // 전체 매물
  document.querySelectorAll('.lp-cat-all').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      clearCategoryGroup();
      setSidebarActive(el);
    });
  });

  // 큰 카테고리 — 해당 그룹 전체 표시 + 하위 선택 해제 + 하위 메뉴 펼침(다른 그룹은 접힘)
  document.querySelectorAll('.lp-cat-group-toggle').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      selectCategoryGroup(el.dataset.group);
      setSidebarActive(el);
    });
  });

  // 작은 카테고리 — 그룹의 하위 매칭함수 적용(부모 그룹은 펼쳐진 채 유지)
  document.querySelectorAll('.lp-cat-sub-item').forEach(el => {
    el.addEventListener('click', () => {
      const groupKey = el.dataset.group;
      const childKey = el.dataset.child;
      const group = LP_CATEGORY_TREE.find(g => g.key === groupKey);
      const child = group?.children.find(c => c.key === childKey);
      flt.sidebarMatch = child ? child.match : null;
      syncFormCatSelect(groupKey);
      setSidebarSpecialtyTitle(groupKey);
      setSidebarActive(el);
      applyFilters();
    });
  });

  // ── 오버레이 검색 폼 ──
  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    const kwInput = document.getElementById('kwInput');
    flt.kw       = (kwInput?.value || '').toLowerCase();
    flt.formDeal = document.getElementById('formDealSelect')?.value || '';
    flt.minPrice = document.getElementById('minPriceInput')?.value || '';
    flt.maxPrice = document.getElementById('maxPriceInput')?.value || '';
    flt.minAreaPy = document.getElementById('minAreaInput')?.value || '';
    flt.maxAreaPy = document.getElementById('maxAreaInput')?.value || '';
    // 상단 검색의 "매물종류"도 사이드바·URL 복원과 동일한 LP_CATEGORY_TREE 매칭 규칙을 사용한다.
    // (예전에는 category1 단순 일치만 사용해, 건물·빌딩 선택 시 상가주택/다가구주택이 섞여 나오거나
    //  주거용 선택 시 단독전원주택·건물빌딩(상가주택/다가구주택) 매물이 누락되는 문제가 있었다.)
    const rawFormCat = document.getElementById('formCatSelect')?.value || '';
    flt.formCat = '';
    let formGroupKey = '';
    if (rawFormCat) {
      formGroupKey = CAT1_TO_LP_GROUP[rawFormCat] || rawFormCat;
      const group = LP_CATEGORY_TREE.find(g => g.key === formGroupKey);
      flt.sidebarMatch = group ? group.match : (i => getCategory1(i) === rawFormCat);
    } else {
      flt.sidebarMatch = null;
    }
    setSidebarSpecialtyTitle(formGroupKey);
    applyFilters();
  });
  document.getElementById('filterResetBtn')?.addEventListener('click', () => {
    Object.assign(flt, { cat: '', deal: '', kw: '', formCat: '', formDeal: '', minPrice: '', maxPrice: '', minAreaPy: '', maxAreaPy: '', sidebarMatch: null });
    filterForm.reset();
    setSidebarSpecialtyTitle('');
    document.querySelectorAll('.lp-cat-item').forEach(x =>
      x.classList.toggle('active', x.dataset.cat === ''));
    setSortMode('date');
  });

  // ── 사이드바 상담신청 폼 제거됨 — contact.html로 이동 ──

  // ── 전체 매물 보기 버튼 (패널 하단) ──
  document.getElementById('btnScrollToAll')?.addEventListener('click', () => {
    document.getElementById('lp-bottom')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ── 하단 카테고리 카드 클릭 이벤트 바인딩 ──
  // href에 ?category=가 있는 경우에만 인터셉트(인페이지 카테고리뷰)하고,
  // 그 외(예: factory-warehouse.html 같은 실제 페이지 링크)는 기본 이동 동작을 그대로 둔다.
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', e => {
      const href = card.getAttribute('href') || '';
      const path = href.split('?')[0];
      const hrefToGroup = {
        'factory-warehouse.html': '공장창고',
        'commercial-office.html': '상가사무실',
        'land.html': '토지',
        'residential.html': '주거용',
        'building.html': '건물빌딩',
      };
      if (href === 'listings.html') {
        e.preventDefault();
        clearCategoryGroup();
        return;
      }
      if (hrefToGroup[path]) {
        e.preventDefault();
        selectCategoryGroup(hrefToGroup[path]);
        return;
      }
      const m = href.match(/[?&]category=([^&]+)/);
      if (m) {
        e.preventDefault();
        // URL 값(공장창고, 상가사무실, 토지, 주거용, 단독전원주택, 건물빌딩)을 category1 키로 정규화
        const cat = normalizeCategoryParam(decodeURIComponent(m[1]));
        renderCategoryPanel(cat);
      }
    });
  });

  // ── URL 파라미터 ──
  // ?id= 는 위에서 이미 listing-detail.html로 리다이렉트 처리했으므로 여기서는 다루지 않는다.
  const urlParams = new URLSearchParams(window.location.search);
  const urlCatRaw = urlParams.get('category');
  // urlCat 을 블록 밖에서도 참조할 수 있도록 함수 스코프에 선언
  const urlCat = urlCatRaw ? normalizeCategoryParam(urlCatRaw) : '';
  // 전문관 페이지(factory-warehouse.html 등)는 body[data-default-category]로 기본 카테고리를 지정한다.
  // URL의 ?category= 파라미터가 있으면 그 값이 우선한다.
  const defaultCatRaw = document.body.dataset.defaultCategory || '';
  const initialCat = urlCat || (defaultCatRaw ? normalizeCategoryParam(defaultCatRaw) : '');
  if (initialCat) {
    // 사이드바 active 상태 (레거시 .lp-cat-item — 현재 HTML에는 없음)
    document.querySelectorAll('.lp-cat-item').forEach(el => {
      el.classList.toggle('active', el.dataset.cat === initialCat);
    });
    // initialCat(매물관리 원본 category1, 예: 단독전원주택)을 사이드바 그룹 키로 매핑해
    // LP_CATEGORY_TREE의 매칭함수를 그대로 적용한다(주거용 통합 그룹 등도 올바르게 복원됨).
    const initialGroupKey = CAT1_TO_LP_GROUP[initialCat] || initialCat;
    const initialGroup = LP_CATEGORY_TREE.find(g => g.key === initialGroupKey);
    if (initialGroup) {
      flt.sidebarMatch = initialGroup.match;
      const catSel = document.getElementById('formCatSelect');
      if (catSel) catSel.value = initialGroupKey;
      setSidebarSpecialtyTitle(initialGroupKey);
      document.querySelectorAll('.lp-cat-group').forEach(g =>
        g.classList.toggle('open', g.dataset.group === initialGroupKey));
      const initialToggle = document.querySelector(`.lp-cat-group-toggle[data-group="${initialGroupKey}"]`);
      document.querySelectorAll('.lp-catlist-item.active, .lp-cat-sub-item.active')
        .forEach(x => x.classList.remove('active'));
      initialToggle?.classList.add('active');
    } else {
      flt.cat = initialCat;
    }
  }

  // 초기 렌더 (Supabase 로드 후 renderSpecialPanels가 채움)

  (async () => {
    const cardsEl = document.getElementById('listingCards');
    if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 목록을 불러오는 중...</div>';
    try {
      _listings = await readListingsFromSupabase({ publicOnly: true });
    } catch (err) {
      console.error('[Supabase] 매물 조회 오류 — 원인:', err?.code || err?.message || err);
      console.warn('[Supabase] Supabase 보안 규칙에서 비인증 읽기를 허용했는지 확인하세요.');
      if (cardsEl) cardsEl.innerHTML = '<div class="lp-empty" style="grid-column:1/-1;">매물 정보를 불러오지 못했습니다. (F12 콘솔에서 오류 확인)</div>';
      return;
    }
    _dataReady = true;
    console.log('[Supabase] 로드 완료 | 공개 매물수:', _listings.length);
    if (_listings.length > 0) {
      const s = _listings[0];
      console.log('[Supabase] 첫 매물 키 목록:', Object.keys(s).join(', '));
      console.log('[Supabase] 첫 매물 샘플:', JSON.stringify(s));
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
  const isRec       = i => hasPromotionSticker(i, '추천매물');
  const isNew       = i => i.is_new === true;
  const getPropNo   = i => i.property_number || i.listingNo || '-';

  // ── 통계 업데이트 ──
  const updateStats = () => {
    const all  = _allListings;
    const done = all.filter(isCompleted).length;
    const rec  = all.filter(isRec).length;
    const urgent = all.filter(i => hasPromotionSticker(i, '급매물')).length; // 급매물 수 계산 지원
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
          const pin   = item.pinSlot || 0;
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
                ${pin > 0 ? `<span class="adm-rec-ribbon">📌 상단${pin}</span>` : rec ? '<span class="adm-rec-ribbon">⭐ 추천</span>' : ''}
                ${isnew ? '<span class="adm-new-ribbon">🔥 최신</span>' : ''}
              </div>` : ''}
              <div class="adm-item-body">
                <div class="adm-item-row1">
                  <span class="adm-item-no">${propNo}</span>
                  <span class="adm-item-type">${getPropertyTypeLabel(item)}</span>
                  <span class="adm-item-deal">${item.dealType || '-'}</span>
                  <span class="adm-item-date">${date}</span>
                </div>
                <div class="adm-item-title">${item.title}</div>
                <div class="adm-item-info">${[getAdminAddressSummary(item), formatPropertyPrice(item), `${item.area || 0}㎡`, getParkingText(item) !== '-' ? `주차 ${getParkingText(item)}` : ''].filter(Boolean).join(' · ')}</div>
                <div class="adm-card-actions">
                  <div class="adm-card-actions-left">
                    <a href="admin-register.html?edit=${item.id}" class="adm-btn adm-btn-edit" style="text-decoration:none;">✏️ 수정</a>
                    <button class="adm-btn adm-btn-hp" data-action="prefill" data-id="${item.id}" type="button">🏠 홈페이지</button>
                    <button class="adm-btn adm-btn-done${done?' done-active':''}" data-action="done" data-id="${item.id}" type="button">${done?'↩ 완료취소':'✅ 거래완료'}</button>
                    <button class="adm-btn adm-btn-del" data-action="delete" data-id="${item.id}" type="button">🗑 삭제</button>
                  </div>
                  <div class="adm-card-actions-right">
                    <button class="adm-btn adm-btn-sm adm-btn-rec${rec?' rec-active':''}" data-action="recommend" data-id="${item.id}" type="button">⭐ 추천</button>
                    <button class="adm-btn adm-btn-sm adm-btn-pin1${pin===1?' pin-active':''}" data-action="pin1" data-id="${item.id}" type="button">📌 상단1</button>
                    <button class="adm-btn adm-btn-sm adm-btn-pin2${pin===2?' pin-active':''}" data-action="pin2" data-id="${item.id}" type="button">📌 상단2</button>
                    <button class="adm-btn adm-btn-sm adm-btn-unpin" data-action="unpin" data-id="${item.id}" type="button">해제</button>
                  </div>
                </div>
              </div>
            </article>`;
        }).join('')
      : '<p style="padding:24px;color:#999;">조건에 맞는 매물이 없습니다.</p>';
  };

  // ── 필터 적용 ──
  const applyFilters = () => {
    let listings = [..._allListings];
    if (filterCat)  listings = listings.filter(i => getCategory1(i) === filterCat);
    if (filterDeal) listings = listings.filter(i => i.dealType === filterDeal);
    if (filterKw) {
      const kw = filterKw.toLowerCase();
      listings = listings.filter(i =>
        (i.title || '').toLowerCase().includes(kw) ||
        getPublicAddress(i).toLowerCase().includes(kw) ||
        getMapSearchAddress(i).toLowerCase().includes(kw) ||
        getPrivateDetailAddress(i).toLowerCase().includes(kw)
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

  // ── 핀/추천 업데이트 (partial update) ──
  const updatePinRecommend = async (id, pinSlot, makeRec) => {
    try {
      const isAuthed = await waitForAdminAuth();
      if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
      const item = _allListings.find(i => i.id === id);
      if (!item) return;
      let newStickers = [...(item.stickers || [])];
      if (makeRec && !newStickers.includes('추천매물')) newStickers.push('추천매물');
      else if (!makeRec) newStickers = newStickers.filter(s => s !== '추천매물');
      if (pinSlot > 0) {
        const toUnpin = _allListings.find(i => i.id !== id && (i.pinSlot || 0) === pinSlot);
        if (toUnpin) {
          await updateListingInSupabase(toUnpin.id, { pinSlot: 0 });
          _allListings = _allListings.map(i => i.id === toUnpin.id ? { ...i, pinSlot: 0 } : i);
        }
      }
      await updateListingInSupabase(id, { stickers: newStickers, pinSlot });
      _allListings = _allListings.map(i => i.id === id ? { ...i, pinSlot, stickers: newStickers } : i);
      applyFilters();
    } catch(err) {
      const msg = err?.message || err?.details || err?.hint || err?.code || String(err);
      console.error('핀/추천 처리 오류:', msg, err);
      alert('처리 중 오류: ' + msg);
    }
  };

  // ── 대시보드 버튼 핸들러 (홈페이지·거래완료·삭제·핀·추천) ──
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'prefill') {
      window.location.href = `admin-register.html?prefill=${id}`;
      return;
    }
    if (action === 'recommend') {
      const item = _allListings.find(i => i.id === id);
      if (!item) return;
      const isCurrentlyRec = hasPromotionSticker(item, '추천매물');
      (async () => { await updatePinRecommend(id, item.pinSlot || 0, !isCurrentlyRec); })();
      return;
    }
    if (action === 'pin1') { (async () => { await updatePinRecommend(id, 1, true); })(); return; }
    if (action === 'pin2') { (async () => { await updatePinRecommend(id, 2, true); })(); return; }
    if (action === 'unpin') { (async () => { await updatePinRecommend(id, 0, false); })(); return; }
    if (action === 'done') {
      const newStatus = (_allListings.find(i => i.id === id)?.status === 'done') ? '' : 'done';
      const doneMsg = newStatus === 'done' ? '이 매물을 거래완료로 변경하시겠습니까?' : '거래완료를 취소하시겠습니까?';
      if (!confirm(doneMsg)) return;
      (async () => {
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInSupabase(id, { status: newStatus });
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
          await deleteListingFromSupabase(id);
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
      _allListings = await readListingsFromSupabase({ publicOnly: true });
      applyFilters();
    } catch (err) {
      console.error('Supabase 대시보드 매물 조회 오류:', err);
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
  const setupAddressSplitFields = () => {
    let publicInput = form.elements['publicAddress'];
    let mapInput = form.elements['mapAddress'];
    let privateInput = form.elements['privateDetailAddress'];
    let legacyAddress = form.elements['address'];
    let legacyDisplay = form.elements['displayAddress'];

    if (!publicInput && legacyDisplay) {
      legacyDisplay.name = 'publicAddress';
      legacyDisplay.placeholder = '예: 파주시 동패동';
      legacyDisplay.required = true;
      publicInput = legacyDisplay;
      const label = publicInput.closest('.form-group')?.querySelector('.form-label');
      if (label) label.innerHTML = '공개주소 <span class="form-hint">(고객 표시)</span>';
    }

    if (!mapInput && legacyAddress) {
      legacyAddress.name = 'mapAddress';
      legacyAddress.placeholder = '예: 파주시 동패동 2075';
      legacyAddress.required = true;
      mapInput = legacyAddress;
      const label = mapInput.closest('.form-group')?.querySelector('.form-label');
      if (label) label.innerHTML = '지도검색주소 <span class="form-hint">/ 비공개</span>';
    }

    if (publicInput && mapInput) {
      const row = mapInput.closest('.form-row-half') || mapInput.closest('.form-row-thirds');
      if (row) row.classList.replace('form-row-half', 'form-row-thirds');
      if (row && publicInput.closest('.form-group') && mapInput.closest('.form-group')) {
        row.insertBefore(publicInput.closest('.form-group'), mapInput.closest('.form-group'));
      }
      if (!privateInput) {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.style.marginBottom = '0';
        group.innerHTML = '<label class="form-label">상세주소·동호수 <span class="form-hint">/ 비공개</span></label><input name="privateDetailAddress" placeholder="예: 115동 1층, 상가 101호" />';
        row?.appendChild(group);
        privateInput = form.elements['privateDetailAddress'];
      }
    }

    if (!form.elements['address']) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'address';
      form.appendChild(hidden);
    }
    if (!form.elements['displayAddress']) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'displayAddress';
      form.appendChild(hidden);
    }
  };
  setupAddressSplitFields();
  const imageContainer = document.getElementById('imageUrlContainer');
  const addImageBtn    = document.getElementById('addImageBtn');
  const MAX_IMAGES     = 5;
  let isEditMode           = false;
  let importedLegacyDesc   = '';

  // Drive 링크 여부 판별
  const isDriveUrl = (url) => url && String(url).includes('drive.google.com');
  // Supabase public URL 여부 판별
  const isSupabaseUrl = (url) => url && String(url).includes('supabase.co/storage');

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

    // ② URL 입력창 (읽기전용 — 직접 편집 차단, 파일업로드로만 값 변경)
    const input = document.createElement('input');
    input.name = 'imageUrls'; input.type = 'url';
    input.placeholder = `📎 파일을 선택하면 자동으로 업로드됩니다 (${count + 1}번)`;
    input.value = value;
    input.readOnly = true;
    input.style.cursor = 'default';
    input.style.background = '#f8f8f8';

    // ③ 파일 업로드 버튼 → Supabase Storage 업로드
    const fileLabel = document.createElement('label');
    fileLabel.className = 'btn btn-outline btn-sm img-file-label';
    fileLabel.title = 'Supabase Storage에 업로드';
    fileLabel.innerHTML = '📎 파일 선택';
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
    fileLabel.appendChild(fileInput);

    // ④ 업로드 상태 / Drive 경고 표시
    const statusEl = document.createElement('span');
    statusEl.className = 'img-upload-status';

    // Drive 링크가 기존값으로 들어온 경우 → 경고 표시, 미리보기는 변환 URL로
    if (value && isDriveUrl(value)) {
      const previewUrl = normalizeImageUrl(value);
      thumb.src = previewUrl; thumb.classList.remove('hidden');
      statusEl.textContent = '⚠️ Google Drive 링크 — 파일을 다시 업로드해 주세요';
      statusEl.className = 'img-upload-status error';
      // input 값은 비워서 저장 시 Drive 링크가 들어가지 않게 함
      input.value = '';
      // 원본 Drive URL을 data 속성에만 보관 (참고용)
      input.dataset.driveUrl = value;
    } else if (value) {
      thumb.src = value; thumb.classList.remove('hidden');
      statusEl.textContent = '✅ 저장된 이미지';
      statusEl.className = 'img-upload-status done';
    }

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      statusEl.textContent = '⏳ 업로드 중…';
      statusEl.className = 'img-upload-status uploading';
      fileLabel.classList.add('disabled');
      try {
        const listingNo = form.elements['listingNo']?.value?.trim() || '';
        const url = await uploadListingImage(file, listingNo);
        // 업로드 성공 → Supabase URL로 input 값 교체, Drive 경고 제거
        input.value = url;
        delete input.dataset.driveUrl;
        fileLabel.classList.remove('disabled');
        statusEl.textContent = '✅ 업로드 완료'; statusEl.className = 'img-upload-status done';
        thumb.src = url; thumb.classList.remove('hidden');
        console.log('[IMAGE UPLOAD]', url);
      } catch (err) {
        fileLabel.classList.remove('disabled');
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
      else { input.value = ''; delete input.dataset.driveUrl; statusEl.textContent = ''; thumb.classList.add('hidden'); statusEl.className = 'img-upload-status'; }
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

  if (editId || prefillId) {
    (async () => {
      try {
        const isAuthed = await waitForAdminAuth();
        if (!isAuthed) return;
        const targetId = editId || prefillId;
        const target = await getListingFromSupabase(targetId);
        if (!target) { alert('매물을 찾을 수 없습니다.'); return; }

        if (editId) {
          isEditMode = true;
          const titleEl = document.getElementById('formTitle');
          if (titleEl) titleEl.textContent = '매물 수정';
        } else if (prefillId) {
          const titleEl = document.getElementById('formTitle');
          if (titleEl) titleEl.textContent = '홈페이지 매물 등록';
        }

        Object.entries(target).forEach(([key, value]) => {
          if (key === 'imageUrls' || (prefillId && key === 'id') || key === 'stickers' ||
              key === 'promotionStickers' || key === 'promotion_stickers' ||
              key === 'badges' || key === 'tags' || key === 'labels' ||
              key === 'isRecommended' || key === 'is_recommended' ||
              key === 'isUrgent' || key === 'is_urgent') return;
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
        if (form.elements['publicAddress']) form.elements['publicAddress'].value = getPublicAddress(target);
        if (form.elements['mapAddress']) form.elements['mapAddress'].value = getMapSearchAddress(target);
        if (form.elements['privateDetailAddress']) form.elements['privateDetailAddress'].value = getPrivateDetailAddress(target);

        form.querySelectorAll('input[name="stickers"]').forEach(el => el.checked = false);
        normalizePromotionStickers(target).forEach(sticker => {
          const chk = form.querySelector(`input[name="stickers"][value="${sticker}"]`);
          if (chk) chk.checked = true;
        });

        // 수정 모드: hidden id 필드에 Supabase 문서 ID를 명시적으로 설정
        // (hidden input 은 루프에서 propertyType 외에 값이 채워지지 않으므로 여기서 보완)
        if (editId) {
          const hiddenId = form.elements['id'];
          if (hiddenId) hiddenId.value = editId;
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

        if (typeof window.refreshPricePreviews === 'function') window.refreshPricePreviews();
        window.dispatchEvent(new Event('hitop:price-values-updated'));

        // 수정 모드 로드 시 이미지 URL 진단 로그
        console.log('[LOAD LISTING FOR EDIT]', {
          id: target.id,
          title: target.title,
          imageUrls: target.imageUrls,
          imageUrl: target.imageUrl,
        });

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
        await deleteListingFromSupabase(editId);
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
    // imageUrls: Supabase public URL만 저장 (Drive 링크·샘플 이미지 제외)
    payload.publicAddress = (payload.publicAddress || payload.displayAddress || '').trim();
    payload.mapAddress = (payload.mapAddress || payload.address || payload.privateAddress || payload.locationAddress || payload.roadAddress || payload.jibunAddress || payload.publicAddress || '').trim();
    payload.privateDetailAddress = (payload.privateDetailAddress || payload.detailAddress || '').trim();
    payload.displayAddress = payload.publicAddress;
    payload.address = payload.mapAddress;
    if (!payload.privateDetailAddress) delete payload.privateDetailAddress;

    payload.imageUrls = Array.from(form.querySelectorAll('input[name="imageUrls"]'))
      .map(el => el.value.trim())
      .filter(v => v && !isDriveUrl(v) && !v.startsWith('images/'));

    // category1/category2 저장 + propertyType 하위호환 도출
    const _sCat1 = form.elements['category1']?.value || '';
    const _sCat2 = form.elements['category2']?.value || '';
    if (_sCat1) {
      payload.category1 = _sCat1;
      if (_sCat2) payload.category2 = _sCat2;
      // 기존 propertyType 필드 하위호환 유지
      payload.propertyType = derivePropertyType(_sCat1, _sCat2);
    }

    // Price fields are stored as plain numeric strings. UI commas are display-only.
    ['price', 'salePrice', 'deposit', 'monthlyRent', 'presalePrice', 'managementFee', 'premium'].forEach(k => {
      if (payload[k] === '' || payload[k] === undefined) {
        delete payload[k];
        return;
      }
      const digits = String(payload[k]).replace(/[^\d]/g, '');
      if (digits) payload[k] = digits;
      else delete payload[k];
    });
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
    ['floorInfo','zoning','parkingCount','approvalDate','detailDescription',
     'complexName','buildingDong','unitNumber','unitType'].forEach(k => { if (payload[k] === '' || payload[k] === undefined) delete payload[k]; });
    // Legacy area handling for compatibility
    if (payload.area) {
      payload.area = Number(payload.area);
    } else if (payload.areaM2) {
      payload.area = Number(payload.areaM2);
    }
    payload.stickers = normalizePromotionStickers({
      stickers: Array.from(form.querySelectorAll('input[name="stickers"]:checked')).map(el => el.value)
    });
    payload.pinSlot = Number(form.elements['pinSlot']?.value || 0);
    if (payload.pinSlot > 0 && !payload.stickers.includes('추천매물')) {
      payload.stickers = [...payload.stickers, '추천매물'];
    }
    delete payload.isRecommended;
    delete payload.is_recommended;
    delete payload.isUrgent;
    delete payload.is_urgent;
    delete payload.promotionStickers;
    delete payload.promotion_stickers;
    delete payload.badges;
    delete payload.tags;
    delete payload.labels;
    if (!payload.status) payload.status = '거래가능';

    const address = getMapSearchAddress(payload);

    // Drive 링크가 아직 남아 있는 행이 있으면 경고 (저장 차단은 아님)
    const driveRows = Array.from(form.querySelectorAll('input[name="imageUrls"]'))
      .filter(el => isDriveUrl(el.dataset.driveUrl));
    if (driveRows.length > 0) {
      alert(`사진 ${driveRows.length}장이 아직 Google Drive 링크입니다.\n📎 파일 선택 버튼으로 이미지를 다시 업로드해 주세요.\n(Drive 링크는 저장되지 않으며 목록에서 이미지가 표시되지 않습니다.)`);
      return;
    }

    // 저장 직전 payload 진단 로그
    console.log('[SAVE LISTING PAYLOAD]', {
      title: payload.title,
      category1: payload.category1,
      propertyType: payload.propertyType,
      imageUrls: payload.imageUrls,
    });

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
        // 수정 — Supabase updateDoc
        const docId = payload.id;
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await updateListingInSupabase(docId, payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 수정 오류:', err);
          alert('매물 수정 중 오류가 발생했습니다.');
        }
      } else {
        // 신규 등록 — Supabase 저장
        if (!payload.listingNo) payload.listingNo = getNextPropertyNumber();
        if (!payload.property_number) payload.property_number = payload.listingNo;
        if (!payload.status) payload.status = '거래가능';
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await createListingInSupabase(payload);
          window.location.href = 'admin-listings.html';
        } catch (err) {
          console.error('매물 등록 오류:', err);
          console.error('저장 시도 데이터:', payload);
          alert(`매물 등록 중 오류가 발생했습니다.\n${err?.message || ''}`)
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
    if (search)   listings=listings.filter(i=>
      (i.title || '').toLowerCase().includes(search) ||
      getPublicAddress(i).toLowerCase().includes(search) ||
      getMapSearchAddress(i).toLowerCase().includes(search) ||
      getPrivateDetailAddress(i).toLowerCase().includes(search)
    );
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
          const isRecItem=hasPromotionSticker(item,'추천매물');
          const pin=item.pinSlot||0;
          return `<article class="admin-item${isDone?' admin-item-done':''}">
            <div class="admin-item-header">
              ${item.listingNo?`<span class="admin-item-no">${item.listingNo}</span>`:''}
              <strong class="admin-item-title">${item.title}${isDone?' <span class="badge-done">거래완료</span>':''}${pin>0?` <span class="badge-pin">📌 상단${pin}</span>`:''}${isRecItem&&pin===0?' <span class="badge-rec">⭐ 추천</span>':''}</strong>
              <span class="admin-item-date">등록 ${(item.createdAt||'').slice(0,10)||'-'}</span>
            </div>
            <p style="margin:4px 0;font-size:13px;">${getPropertyTypeLabel(item)} / ${item.dealType} · ${getAdminAddressSummary(item)}</p>
            <p style="margin:4px 0;font-size:13px;">${formatPropertyPrice(item)} · ${getCategory1(item) === '상가사무실' ? `${item.exclusiveAreaM2 || ''}㎡ (${item.exclusiveAreaPy || ''}평) / ${item.supplyAreaM2 || ''}㎡ (${item.supplyAreaPy || ''}평)` : `${item.areaM2 || item.area || ''}㎡ (${item.areaPy || ''}평)`}</p>
            <div class="admin-item-actions">
              <a href="admin-register.html?edit=${item.id}" class="adm-btn adm-btn-edit" style="text-decoration:none;">✏️ 수정</a>
              <button class="adm-btn adm-btn-hp" data-action="prefill" data-id="${item.id}" type="button">🏠 홈페이지</button>
              <button class="adm-btn adm-btn-done${isDone?' done-active':''}" data-action="done" data-id="${item.id}" type="button">${isDone?'↩ 완료취소':'✅ 거래완료'}</button>
              <button class="adm-btn adm-btn-del" data-action="delete" data-id="${item.id}" type="button">🗑 삭제</button>
            </div>
            <div class="admin-item-actions" style="margin-top:4px;border-top:1px solid #f0f0f0;padding-top:6px;">
              <button class="adm-btn adm-btn-rec${isRecItem?' rec-active':''}" data-action="recommend" data-id="${item.id}" type="button">⭐ ${isRecItem?'추천중':'추천'}</button>
              <button class="adm-btn adm-btn-pin1${pin===1?' pin-active':''}" data-action="pin1" data-id="${item.id}" type="button">📌 상단1${pin===1?' ✓':''}</button>
              <button class="adm-btn adm-btn-pin2${pin===2?' pin-active':''}" data-action="pin2" data-id="${item.id}" type="button">📌 상단2${pin===2?' ✓':''}</button>
              <button class="adm-btn adm-btn-unpin" data-action="unpin" data-id="${item.id}" type="button">해제</button>
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
  const updatePinRecommend = async (id, pinSlot, makeRec) => {
    try {
      const isAuthed = await waitForAdminAuth();
      if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
      const item = _allListings.find(i => i.id === id);
      if (!item) return;
      let newStickers = [...(item.stickers || [])];
      if (makeRec && !newStickers.includes('추천매물')) newStickers.push('추천매물');
      else if (!makeRec) newStickers = newStickers.filter(s => s !== '추천매물');
      // 같은 슬롯을 가진 다른 매물 먼저 해제 (partial update)
      if (pinSlot > 0) {
        const toUnpin = _allListings.find(i => i.id !== id && (i.pinSlot || 0) === pinSlot);
        if (toUnpin) {
          await updateListingInSupabase(toUnpin.id, { pinSlot: 0 });
          _allListings = _allListings.map(i => i.id === toUnpin.id ? { ...i, pinSlot: 0 } : i);
        }
      }
      // partial update: stickers + pin_slot만 변경
      await updateListingInSupabase(id, { stickers: newStickers, pinSlot });
      _allListings = _allListings.map(i => i.id === id ? { ...i, pinSlot, stickers: newStickers } : i);
      applyFilters();
    } catch(err) {
      const msg = err?.message || err?.details || err?.hint || err?.code || String(err);
      console.error('핀/추천 처리 오류:', msg, err);
      alert('처리 중 오류: ' + msg);
    }
  };

  listEl.addEventListener('click',e=>{
    const btn=e.target.closest('button[data-action]'); if(!btn)return;
    const {action,id}=btn.dataset;
    if (action==='recommend') {
      const item = _allListings.find(i => i.id === id);
      if (!item) return;
      const isCurrentlyRec = hasPromotionSticker(item, '추천매물');
      (async () => { await updatePinRecommend(id, item.pinSlot || 0, !isCurrentlyRec); })();
      return;
    }
    if (action==='pin1') { (async () => { await updatePinRecommend(id, 1, true); })(); return; }
    if (action==='pin2') { (async () => { await updatePinRecommend(id, 2, true); })(); return; }
    if (action==='unpin') { (async () => { await updatePinRecommend(id, 0, false); })(); return; }
    if (action==='delete') {
      if(!confirm('정말 이 매물을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'))return;
      (async()=>{
        try {
          const isAuthed = await waitForAdminAuth();
          if (!isAuthed) { alert('관리자 권한이 없습니다.'); return; }
          await deleteListingFromSupabase(id);
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
          await updateListingInSupabase(id,{status:newStatus});
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
      _allListings = await readListingsFromSupabase({ publicOnly: true });
    } catch (err) {
      console.error('Supabase 매물 조회 오류:', err);
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
  else if (page === 'admin-info')            requireAdminLogin();

  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('listingModal')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeModal(); });
  document.getElementById('modalPrintBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openListingPrintPage(e.currentTarget.dataset.id);
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
