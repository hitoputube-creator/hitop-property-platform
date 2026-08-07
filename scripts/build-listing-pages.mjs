import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const siteOrigin = process.env.SITE_ORIGIN || 'https://hitoprealty.com';
// SEO 정적 페이지는 원본 listings 테이블이 아닌 공개용 뷰만 조회한다.
// public_listings 뷰는 owner_name/owner_phone*/quick_*/privateDetailAddress/drive_links/description 등
// 비공개 필드를 뷰 정의 자체에서 제외하며, is_public=true 행만 노출한다.
const listingTable = 'public_listings';
const publicListingColumns = 'id,type,title,address,status,created_at,resource_id,is_public,display_address,category1,category2,deal_type,sale_price,deposit,monthly_rent,area_m2,area_py,floor_info,zoning,detail_description,stickers,image_urls,pin_slot,last_verified_at,data';

const todayKst = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeJsonLd = (value = {}) => JSON.stringify(value).replace(/<\/script/gi, '<\\/script');

const stripTags = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const truncate = (value = '', max = 155) => {
  const text = stripTags(value);
  return text.length > max ? `${text.slice(0, max - 1).trim()}...` : text;
};

const sanitizeSeoText = (value = '') => stripTags(value)
  .replace(/\b01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}\b/g, '')
  .replace(/\b0(?:2|3[1-3]|4[1-4]|5[1-5]|6[1-4])[-\s.]?\d{3,4}[-\s.]?\d{4}\b/g, '')
  .replace(/(?:비번|비밀번호|문\s*비번|키번호)\s*[:：]?\s*[\w*#-]+/gi, '')
  .replace(/(?:주인번호|대표번호|담당자|임차인|세입자|소유자|명의|방문함|방문|전화)\s*[:：]?\s*[가-힣A-Za-z0-9().\s-]{0,24}/g, '')
  .replace(/\b\d{3,4}[-\s.]?\d{3,4}\b/g, '')
  .replace(/\s*[,，]\s*(?=,|·|$)/g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*[·,]\s*$/g, '')
  .trim();

const readSupabaseConfig = async () => {
  const source = await readFile(path.join(rootDir, 'supabase-config.js'), 'utf8');
  const url = process.env.SUPABASE_URL || source.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
  const anonKey = process.env.SUPABASE_ANON_KEY || source.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!url || !anonKey) {
    throw new Error('Supabase URL or anon key was not found.');
  }
  return { url, anonKey };
};

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const normalizeListing = (row) => {
  const data = row.data && typeof row.data === 'object' ? row.data : {};
  const imageUrls = asArray(row.image_urls ?? data.imageUrls ?? data.image_urls ?? data.imageUrl);
  return {
    ...data,
    id: row.id,
    title: row.title ?? data.title ?? '',
    address: row.display_address ?? data.displayAddress ?? data.publicAddress ?? row.address ?? data.address ?? '',
    category1: row.category1 ?? data.category1 ?? '',
    category2: row.category2 ?? data.category2 ?? '',
    dealType: row.deal_type ?? data.dealType ?? data.deal_type ?? '',
    status: row.status ?? data.status ?? '',
    description: row.detail_description ?? row.description ?? data.detailDescription ?? data.description ?? '',
    salePrice: row.sale_price ?? data.salePrice ?? data.sale_price ?? '',
    deposit: row.deposit ?? data.deposit ?? '',
    monthlyRent: row.monthly_rent ?? data.monthlyRent ?? data.monthly_rent ?? '',
    imageUrls,
    isPublic: row.is_public ?? data.is_public ?? true,
    isCompleted: row.is_completed ?? data.is_completed ?? false,
    createdAt: row.created_at ?? data.createdAt ?? data.created_at ?? '',
    updatedAt: row.updated_at ?? data.updatedAt ?? data.updated_at ?? '',
    lastVerifiedAt: row.last_verified_at ?? data.lastVerifiedAt ?? data.last_verified_at ?? '',
  };
};

const isCompletedListing = (listing) => {
  if (listing.isCompleted === true || listing.isCompleted === 'true') return true;
  const status = String(listing.status || '').replace(/\s+/g, '').toLowerCase();
  return ['done', 'sold', 'completed', '거래완료'].includes(status);
};

const formatPrice = (value) => {
  const n = Number(String(value || '').replace(/[,\s]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toLocaleString('ko-KR');
};

const buildPriceSummary = (listing) => {
  const parts = [];
  if (listing.salePrice) parts.push(`매매 ${formatPrice(listing.salePrice) || listing.salePrice}`);
  if (listing.deposit) parts.push(`보증금 ${formatPrice(listing.deposit) || listing.deposit}`);
  if (listing.monthlyRent) parts.push(`월세 ${formatPrice(listing.monthlyRent) || listing.monthlyRent}`);
  return parts.join(' / ');
};

const buildTitle = (listing) => {
  const base = stripTags(listing.title || listing.address || '하이탑부동산 매물');
  return `${base} | 하이탑부동산`;
};

const buildSummary = (listing) => {
  const parts = [
    sanitizeSeoText(listing.address),
    listing.category2 || listing.category1,
    listing.dealType,
    buildPriceSummary(listing),
  ].filter(Boolean);
  return parts.join(' · ');
};

const buildDescription = (listing) => {
  return truncate(buildSummary(listing), 160) || '하이탑부동산 매물 상세 정보입니다. 상담문의 031-949-8969';
};

const getListingUrl = (listing) => `${siteOrigin}/listing/${encodeURIComponent(String(listing.id))}/`;

const stripTemplateSeo = (html) => html
  .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
  .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '')
  .replace(/\s*<link\s+rel=["']icon["'][^>]*>/gi, '')
  .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
  .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
  .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, '');

const injectStaticMetadata = (template, listing) => {
  const title = buildTitle(listing);
  const description = buildDescription(listing);
  const summary = buildSummary(listing);
  const image = listing.imageUrls.find(Boolean) || `${siteOrigin}/images/hitoplogo.png`;
  const url = getListingUrl(listing);
  const keywords = [sanitizeSeoText(listing.address), listing.category1, listing.category2, listing.dealType, '하이탑부동산']
    .filter(Boolean)
    .join(', ');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    image,
    isPartOf: {
      '@type': 'WebSite',
      name: '하이탑부동산',
      url: siteOrigin,
    },
    provider: {
      '@type': 'RealEstateAgent',
      name: '하이탑부동산공인중개사사무소',
      telephone: '031-949-8969',
      address: '경기도 파주시 책향기로 830, 1층',
    },
  };
  const seoBlock = [
    '<base href="/" />',
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    '<meta name="robots" content="index,follow" />',
    '<link rel="icon" href="/favicon.ico" sizes="any" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="하이탑부동산" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>`,
  ].join('\n    ');

  let html = stripTemplateSeo(template)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="keywords" content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);

  html = html.replace(
    /(<meta name="viewport" content="[^"]*"\s*\/?>)/i,
    `$1\n    ${seoBlock}`
  );
  html = html.replace(
    '<script src="app.js',
    `<script>window.HITOP_STATIC_LISTING_ID = ${JSON.stringify(String(listing.id))};</script>\n    <script src="app.js`
  );
  html = html.replace('data-static-title=""', `data-static-title="${escapeHtml(title)}"`);
  html = html.replace('data-static-summary=""', `data-static-summary="${escapeHtml(summary || description)}"`);
  html = html.replace('<!-- STATIC_LISTING_SEO_CONTENT -->', [
    '<section class="static-listing-seo" aria-label="매물 요약">',
    `  <h1>${escapeHtml(stripTags(listing.title || '하이탑부동산 매물'))}</h1>`,
    `  <p>${escapeHtml(summary || description)}</p>`,
    '</section>',
  ].join('\n      '));
  return html;
};

const buildSitemap = (listings) => {
  const staticPages = [
    '/',
    '/listings.html',
    '/factory-warehouse.html',
    '/commercial-office.html',
    '/land.html',
    '/residential.html',
    '/building.html',
    '/about.html',
    '/info.html',
    '/unj3-land-map.html',
  ];

  const urls = [
    ...staticPages.map((loc) => ({
      loc: `${siteOrigin}${loc}`,
      lastmod: todayKst(),
      priority: loc === '/' ? '1.0' : '0.8',
      changefreq: loc === '/' || loc === '/listings.html' ? 'daily' : 'weekly',
    })),
    ...listings.map((listing) => ({
      loc: getListingUrl(listing),
      lastmod: String(listing.updatedAt || listing.lastVerifiedAt || listing.createdAt || todayKst()).slice(0, 10),
      priority: '0.7',
      changefreq: 'weekly',
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((item) => `  <url>\n` +
      `    <loc>${escapeHtml(item.loc)}</loc>\n` +
      `    <lastmod>${escapeHtml(item.lastmod)}</lastmod>\n` +
      `    <changefreq>${item.changefreq}</changefreq>\n` +
      `    <priority>${item.priority}</priority>\n` +
      `  </url>`).join('\n') +
    `\n</urlset>\n`;
};

const fetchListings = async () => {
  const { url, anonKey } = await readSupabaseConfig();
  const endpoint = new URL(`/rest/v1/${listingTable}`, url);
  endpoint.searchParams.set('select', publicListingColumns);
  endpoint.searchParams.set('order', 'created_at.desc');

  const res = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase listings fetch failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()).map(normalizeListing);
};

const main = async () => {
  const template = await readFile(path.join(rootDir, 'listing-detail.html'), 'utf8');
  const allListings = await fetchListings();
  const activeListings = allListings.filter((listing) => !isCompletedListing(listing));
  const completedCount = allListings.length - activeListings.length;

  const listingDir = path.join(rootDir, 'listing');
  await rm(listingDir, { recursive: true, force: true });

  for (const listing of activeListings) {
    const pageDir = path.join(listingDir, encodeURIComponent(String(listing.id)));
    await mkdir(pageDir, { recursive: true });
    await writeFile(path.join(pageDir, 'index.html'), injectStaticMetadata(template, listing), 'utf8');
  }

  await writeFile(path.join(rootDir, 'sitemap.xml'), buildSitemap(activeListings), 'utf8');

  console.log(`[listing-build] generated ${activeListings.length} listing pages`);
  console.log(`[listing-build] excluded ${completedCount} completed listings from static pages and sitemap`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
