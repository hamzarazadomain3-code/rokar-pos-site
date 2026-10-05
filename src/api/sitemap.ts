import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..', '..');

const SITE_URL = 'https://rokarpos.co.uk';

function getIndustryRoutes() {
  const contentPath = join(__dirname, 'src', 'content.json');
  const content = JSON.parse(readFileSync(contentPath, 'utf8'));
  return (content.industries || []).map((ind: { id: string }) => ({
    path: `/industry/${ind.id}`,
    changefreq: 'monthly',
    priority: 0.7,
  }));
}

function getBlogRoutes() {
  const blogPath = join(__dirname, 'src', 'content', 'blog.ts');
  const blogContent = readFileSync(blogPath, 'utf8');
  const match = blogContent.match(/export const blogPosts: BlogPost\[\] = (\[[\s\S]*?\]);/);
  if (!match) return [];
  const blogPosts = new Function('return ' + match[1])();
  return [
    { path: '/blog', changefreq: 'daily', priority: 0.7 },
    ...blogPosts.map((post: { slug: string; updatedAt: string; publishedAt: string }) => ({
      path: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: post.updatedAt || post.publishedAt,
    })),
  ];
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

const TODAY = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/#features', changefreq: 'monthly', priority: 0.8 },
  { path: '/#tour', changefreq: 'monthly', priority: 0.8 },
  { path: '/#industries', changefreq: 'monthly', priority: 0.8 },
  { path: '/#how', changefreq: 'monthly', priority: 0.7 },
  { path: '/#pricing', changefreq: 'weekly', priority: 0.9 },
  { path: '/#download', changefreq: 'weekly', priority: 0.9 },
];

export const config = { runtime: 'nodejs' };

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const industryRoutes = getIndustryRoutes().map((r: { path: string; changefreq: string; priority: number }) => ({ ...r, lastmod: TODAY }));
    const blogRoutes = getBlogRoutes();
    const allRoutes = [...staticRoutes, ...industryRoutes, ...blogRoutes];

    const urls = allRoutes
      .map((route) => `
  <url>
    <loc>${escapeXml(SITE_URL + route.path)}</loc>
    <lastmod>${route.lastmod || TODAY}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>
  `).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
    res.statusCode = 200;
    res.end(sitemap);
  } catch (e) {
    console.error('Sitemap error:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Sitemap generation failed');
  }
}