/* ================================================================
   추천매물 / 최신등록 미리보기 섹션 JS
   app.js 의 매물 데이터(allListings 배열)가 로드된 후 호출하세요.
   
   사용법: app.js 에서 데이터 로드 완료 후
   renderPreviewSections(allListings);  // 호출 추가
   ================================================================ */

/**
 * 카테고리별 배경색
 */
const CAT_COLORS = {
  '공장창고': '#1D4ED8',
  '상가':     '#7C3AED',
  '토지':     '#059669',
  '오피스텔': '#0891B2',
  '힐스테이트더운정': '#BE185D',
  '단독주택': '#92400E',
};

/**
 * 미니카드 HTML 생성
 */
function buildMiniCard(item) {
  const img = (item.images && item.images[0])
    ? `<img src="${item.images[0]}" alt="${item.title}" loading="lazy" />`
    : `<div style="width:100%;height:100%;background:#dce8f5;"></div>`;

  const catColor = CAT_COLORS[item.category] || '#374151';
  const priceText = item.price
    ? item.price.toLocaleString() + '만원'
    : (item.monthly_rent ? '월세 ' + item.monthly_rent.toLocaleString() + '만원' : '-');

  return `
    <div class="lp-mini-card" data-id="${item.id}">
      <div class="lp-mini-img">${img}</div>
      <div class="lp-mini-body">
        <div class="lp-mini-badges">
          <span class="lp-mini-cat" style="background:${catColor}">${item.category || ''}</span>
          <span class="lp-mini-deal">${item.deal_type || ''}</span>
        </div>
        <div class="lp-mini-title">${item.title || '(제목없음)'}</div>
        <div class="lp-mini-addr">${item.address || ''}</div>
      </div>
      <div class="lp-mini-price">${priceText}</div>
    </div>`;
}

/**
 * 추천매물 / 최신등록 섹션 렌더링
 * @param {Array} listings - 전체 매물 배열
 * @param {number} maxItems - 섹션당 최대 표시 개수 (기본 3)
 */
function renderPreviewSections(listings, maxItems = 3) {
  // ── 추천매물 (is_featured 또는 tag에 '추천' 포함) ──
  const featured = listings
    .filter(x => !x.is_done && (x.is_featured || (x.tags && x.tags.includes('추천'))))
    .slice(0, maxItems);

  const featuredEl = document.getElementById('featuredCards');
  if (featuredEl) {
    featuredEl.innerHTML = featured.length
      ? featured.map(buildMiniCard).join('')
      : '<div class="lp-preview-empty">등록된 추천매물이 없습니다.</div>';
  }

  // ── 최신등록 (등록일 기준 최신 N개) ──
  const latest = [...listings]
    .filter(x => !x.is_done)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, maxItems);

  const latestEl = document.getElementById('latestCards');
  if (latestEl) {
    latestEl.innerHTML = latest.length
      ? latest.map(buildMiniCard).join('')
      : '<div class="lp-preview-empty">등록된 매물이 없습니다.</div>';
  }

  // ── 미니카드 클릭 → 모달 열기 ──
  document.querySelectorAll('.lp-mini-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      // app.js의 openModal 함수 호출 (함수명이 다르면 수정)
      if (typeof openListingModal === 'function') openListingModal(id);
      else if (typeof openModal === 'function') openModal(id);
    });
  });

  // ── 전체보기 버튼 ──
  const btnFeatured = document.getElementById('btnShowFeatured');
  if (btnFeatured) {
    btnFeatured.addEventListener('click', () => {
      // 검색필터에서 추천매물만 필터링
      const sel = document.getElementById('formSpecialSelect');
      if (sel) { sel.value = '추천'; }
      document.getElementById('filterForm')?.dispatchEvent(new Event('submit'));
      // 전체매물 영역으로 스크롤
      document.querySelector('.lp-all-divider')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnLatest = document.getElementById('btnShowLatest');
  if (btnLatest) {
    btnLatest.addEventListener('click', () => {
      // 정렬을 최신순으로
      document.getElementById('sortDateBtn')?.click();
      document.querySelector('.lp-all-divider')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// app.js에 통합하기 전 임시 노출
window.renderPreviewSections = renderPreviewSections;
