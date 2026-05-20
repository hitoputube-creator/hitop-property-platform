(() => {
  const SITE_LINKS = {
    blog: 'https://blog.naver.com/newpajucity',
    cafe: 'https://cafe.naver.com/pajujjang',
    youtube: 'https://www.youtube.com/@hitop_ai'
  };

  const FOOTER_INFO = {
    company: '하이탑부동산',
    owner: '주현희',
    phone: '031-949-8969',
    address: '경기도 파주시 책향기로830, 1층'
  };

  const setupMobileNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
  };

  const wireExternalLinks = () => {
    document.querySelectorAll('[data-external]').forEach((el) => {
      const key = el.getAttribute('data-external');
      const href = SITE_LINKS[key];
      if (!href) return;
      el.setAttribute('href', href);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  };

  const renderSharedFooter = () => {
    const footer = document.querySelector('[data-shared-footer]');
    if (!footer) return;
    footer.className = 'site-footer compact';
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <p><strong>${FOOTER_INFO.company}</strong> | 대표: ${FOOTER_INFO.owner} | 전화: <a href="tel:${FOOTER_INFO.phone}">${FOOTER_INFO.phone}</a></p>
          <p>주소: ${FOOTER_INFO.address}</p>
          <p class="footer-links">
            <a href="${SITE_LINKS.blog}" target="_blank" rel="noopener noreferrer">블로그</a>
            <a href="${SITE_LINKS.cafe}" target="_blank" rel="noopener noreferrer">카페</a>
            <a href="${SITE_LINKS.youtube}" target="_blank" rel="noopener noreferrer">유튜브</a>
            <a href="index.html#contact">고객센터</a>
          </p>
        </div>
        <a class="footer-admin-link" href="admin.html">관리자</a>
      </div>`;
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileNav();
    wireExternalLinks();
    renderSharedFooter();
  });
})();
