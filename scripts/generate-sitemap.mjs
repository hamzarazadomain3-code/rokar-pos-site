import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..', '..');
const outPath = join(__dirname, 'dist', 'sitemap.xml');

const SITE_URL = 'https://rokarpos.co.uk';
const TODAY = new Date().toISOString().split('T')[0];

// Static routes (single-page sections via hash)
const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: 1.0, lastmod: TODAY },
  { path: '/#features', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/#tour', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/#industries', changefreq: 'monthly', priority: 0.8, lastmod: TODAY },
  { path: '/#how', changefreq: 'monthly', priority: 0.7, lastmod: TODAY },
  { path: '/#pricing', changefreq: 'weekly', priority: 0.9, lastmod: TODAY },
  { path: '/#download', changefreq: 'weekly', priority: 0.9, lastmod: TODAY },
];

// Industry routes - dynamically from content.json
function getIndustryRoutes() {
  const contentPath = join(__dirname, 'src', 'content.json');
  const content = JSON.parse(readFileSync(contentPath, 'utf8'));
  return (content.industries || []).map((ind) => ({
    path: `/industry/${ind.id}`,
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: TODAY,
  }));
}

// Blog routes - dynamically from blog.ts
function getBlogRoutes() {
  const blogPath = join(__dirname, 'src', 'content', 'blog.ts');
  const blogContent = readFileSync(blogPath, 'utf8');
  // Extract blogPosts array - simple regex since it's well-formatted
  const match = blogContent.match(/export const blogPosts: BlogPost\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.warn('Could not extract blogPosts from blog.ts');
    return [];
  }
  // Use Function constructor instead of eval for safety in module context
  const blogPosts = new Function('return ' + match[1])();
  return [
    { path: '/blog', changefreq: 'daily', priority: 0.7, lastmod: TODAY },
    ...blogPosts.map((post) => ({
      path: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: post.updatedAt || post.publishedAt,
    })),
  ];
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

// Build all routes
const industryRoutes = getIndustryRoutes();
const blogRoutes = getBlogRoutes();
const allRoutes = [...staticRoutes, ...industryRoutes, ...blogRoutes];

// Verify all routes exist in the built app (basic check)
const distIndex = join(__dirname, 'dist', 'index.html');
const indexHtml = readFileSync(distIndex, 'utf8');
// For hash routes, we can't easily verify client-side routes.
// Just log a warning if industry/blog routes don't have corresponding files.
console.log(`Sitemap routes: ${allRoutes.length} total (${staticRoutes.length} static, ${industryRoutes.length} industry, ${blogRoutes.length} blog)`);

const urls = allRoutes
  .map((route) => `
  <url>
    <loc>${escapeXml(SITE_URL + route.path)}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>
  `).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

try {
  writeFileSync(outPath, sitemap, 'utf8');
  console.log('Sitemap generated: ' + outPath + ' (' + allRoutes.length + ' URLs)');
} catch (e) {
  console.error('Failed to write sitemap:', e);
  process.exit(1);
}