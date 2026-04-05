import fs from 'fs';

const BASE_URL = 'https://testhub-three.vercel.app';

const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/exams', priority: '0.9', changefreq: 'weekly' },
    { url: '/tests', priority: '0.9', changefreq: 'weekly' },
    { url: '/blogs', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { url: '/terms', priority: '0.5', changefreq: 'yearly' },
    { url: '/refund', priority: '0.5', changefreq: 'yearly' }
];

const exams = [
    'rajasthan-cet', 'ssc-cgl', 'upsc', 'banking', 'railway'
];

exams.forEach(exam => {
    pages.push({
        url: `/exam/${exam}`,
        priority: '0.8',
        changefreq: 'weekly'
    });
    pages.push({
        url: `/exam/${exam}/content`,
        priority: '0.7',
        changefreq: 'weekly'
    });
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('./public/sitemap.xml', sitemap);
console.log('✅ sitemap.xml generated!');