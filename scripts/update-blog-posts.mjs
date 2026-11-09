// 네이버 블로그 전체 글 목록(제목 API)과 RSS 썸네일을 합쳐 blog-posts.json으로 저장
import fs from 'node:fs';
const BLOG = 'newpajucity';
const CATS = {"1":"하이탑부동산소개","6":"부동산 정보","8":"운정역 상가","10":"야당역 상가","12":"산내마을 상가","18":"오피스텔/아파트","20":"자유게시판","22":"토지","25":"기타상가","28":"기타 매물","29":"운정3지구 상가","34":"운정 상권 분석"};
const dec = s => decodeURIComponent(String(s).replace(/\+/g, ' '));
const enc = u => { if (!u) return ''; const k = u.lastIndexOf('/'); return u.slice(0, k + 1) + encodeURIComponent(decodeURIComponent(u.slice(k + 1))); };

// 1) 전체 글 목록
const list = [];
for (let pg = 1; pg <= 30; pg++) {
  const r = await fetch('https://blog.naver.com/PostTitleListAsync.naver?blogId=' + BLOG + '&viewdate=&currentPage=' + pg + '&categoryNo=0&parentCategoryNo=&countPerPage=30');
  if (!r.ok) throw new Error('list ' + r.status);
  const j = JSON.parse((await r.text()).replace(/\\'/g, "'"));
  list.push(...(j.postList || []));
  if (!j.postList || j.postList.length < 30) break;
}
if (!list.length) throw new Error('no posts');

// 2) RSS(최근 50개) 썸네일·카테고리 이름
const rss = await (await fetch('https://rss.blog.naver.com/' + BLOG + '.xml')).text();
const rssItems = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
const rssImg = {}, rssCat = {};
for (const i of rssItems) {
  const g = re => (i.match(re) || [])[1] || '';
  const id = g(/<guid>(.*?)<\/guid>/).split('/').pop();
  const thumb = enc(g(/<img src="([^"]+)"/).split('?')[0]);
  if (thumb) rssImg[id] = thumb.replace('blogthumb.pstatic.net', 'postfiles.pstatic.net') + '?type=w773';
  rssCat[id] = g(/<category><!\[CDATA\[([\s\S]*?)\]\]>/).trim();
}

// 3) 이전 파일의 썸네일 유지
let prev = {};
try { prev = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8')); } catch {}
const prevImg = Object.fromEntries((prev.posts || []).map(p => [p.id, p.img]));

const posts = list.map(a => {
  const m = String(a.addDate).match(/(\d+)\.\s*(\d+)\.\s*(\d+)/);
  const date = m ? m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0') : '';
  return {
    id: a.logNo,
    title: dec(a.title),
    category: rssCat[a.logNo] || CATS[a.categoryNo] || '기타',
    date,
    img: rssImg[a.logNo] || prevImg[a.logNo] || '',
    url: 'https://blog.naver.com/' + BLOG + '/' + a.logNo
  };
});
if (JSON.stringify(prev.posts) === JSON.stringify(posts)) { console.log('no change'); process.exit(0); }
fs.writeFileSync('blog-posts.json', JSON.stringify({ updated: new Date().toISOString(), posts }));
console.log('updated', posts.length);
