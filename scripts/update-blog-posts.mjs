// 네이버 블로그 RSS에서 최신 글을 읽어 blog-posts.json으로 저장
import fs from 'node:fs';
const res = await fetch('https://rss.blog.naver.com/newpajucity.xml');
if (!res.ok) throw new Error('RSS ' + res.status);
const xml = await res.text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
const enc = u => { if (!u) return ''; const k = u.lastIndexOf('/'); return u.slice(0, k + 1) + encodeURIComponent(decodeURIComponent(u.slice(k + 1))); };
const posts = items.map(i => {
  const g = re => (i.match(re) || [])[1] || '';
  const guid = g(/<guid>(.*?)<\/guid>/);
  const d = new Date(g(/<pubDate>(.*?)<\/pubDate>/));
  const date = new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
  const thumb = enc(g(/<img src="([^"]+)"/).split('?')[0]);
  return {
    id: guid.split('/').pop(),
    title: g(/<title><!\[CDATA\[([\s\S]*?)\]\]>/).trim(),
    category: g(/<category><!\[CDATA\[([\s\S]*?)\]\]>/).trim(),
    date,
    img: thumb ? thumb.replace('blogthumb.pstatic.net', 'postfiles.pstatic.net') + '?type=w773' : '',
    url: guid
  };
}).filter(p => p.id && p.title);
if (!posts.length) throw new Error('no posts');
let prev = {};
try { prev = JSON.parse(fs.readFileSync('blog-posts.json', 'utf8')); } catch {}
if (JSON.stringify(prev.posts) === JSON.stringify(posts)) { console.log('no change'); process.exit(0); }
fs.writeFileSync('blog-posts.json', JSON.stringify({ updated: new Date().toISOString(), posts }));
console.log('updated', posts.length);
