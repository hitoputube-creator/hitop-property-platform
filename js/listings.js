(() => {
  const setupListingsPage = () => {
    const cardsEl = document.getElementById('listingCards');
    const detailEl = document.getElementById('listingDetail');
    const filterForm = document.getElementById('filterForm');
    if (!cardsEl || !detailEl || !filterForm || !window.HitopData) return;

    let current = window.HitopData.readListings();

    const render = (items) => {
      cardsEl.innerHTML = items.map((item) => `
      <article class="listing-card" data-id="${item.id}">
        <h3>${item.title}</h3>
        <div class="listing-meta"><span>${item.propertyType}</span><span>${item.dealType}</span><span>${item.address}</span><span>${window.HitopData.formatPrice(item.price)}만원</span><span>${item.area}㎡</span></div>
      </article>`).join('');

      cardsEl.querySelectorAll('.listing-card').forEach((card) => {
        card.addEventListener('click', () => {
          const selected = current.find((x) => x.id === card.dataset.id);
          if (!selected) return;
          detailEl.classList.remove('hidden');
          detailEl.innerHTML = `<h3>${selected.title}</h3><p><strong>${selected.propertyType} / ${selected.dealType}</strong></p><p>주소: ${selected.address}</p><p>금액: ${window.HitopData.formatPrice(selected.price)}만원 | 면적: ${selected.area}㎡</p><p>${selected.description}</p><img src="${selected.imageUrl}" alt="${selected.title}" style="width:100%;max-width:480px;border-radius:10px;" />`;
        });
      });
    };

    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const criteria = Object.fromEntries(new FormData(filterForm).entries());
      current = window.HitopData.readListings().filter((item) => {
        if (criteria.dealType && item.dealType !== criteria.dealType) return false;
        if (criteria.propertyType && item.propertyType !== criteria.propertyType) return false;
        if (criteria.region && !item.address.includes(criteria.region)) return false;
        if (criteria.maxPrice && Number(item.price) > Number(criteria.maxPrice)) return false;
        if (criteria.minArea && Number(item.area) < Number(criteria.minArea)) return false;
        return true;
      });
      render(current);
    });

    document.querySelectorAll('[data-category]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        filterForm.propertyType.value = link.dataset.category;
        filterForm.requestSubmit();
      });
    });

    render(current);
  };

  document.addEventListener('DOMContentLoaded', setupListingsPage);
})();
