(() => {
  const STORAGE_KEY = 'hitop_listings_v1';

  const sampleListings = [
    { id: 's1', propertyType: '공장창고', dealType: '매매', address: '파주시 탄현면', price: 125000, area: 860, title: '대형 물류창고', description: 'IC 접근성 우수, 층고 높음', imageUrl: 'https://picsum.photos/seed/factory/640/360' },
    { id: 's2', propertyType: '상가', dealType: '월세', address: '고양시 일산동구', price: 250, area: 82, title: '대로변 1층 상가', description: '유동인구 풍부, 주차 가능', imageUrl: 'https://picsum.photos/seed/store/640/360' },
    { id: 's3', propertyType: '오피스텔', dealType: '전세', address: '운정신도시', price: 23000, area: 49, title: '신축 오피스텔', description: '역세권, 풀옵션', imageUrl: 'https://picsum.photos/seed/officetel/640/360' }
  ];

  const readListings = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings));
      return [...sampleListings];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...sampleListings];
    }
  };

  const writeListings = (listings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  };

  const formatPrice = (value) => Number(value).toLocaleString('ko-KR');

  window.HitopData = {
    readListings,
    writeListings,
    formatPrice
  };
})();
