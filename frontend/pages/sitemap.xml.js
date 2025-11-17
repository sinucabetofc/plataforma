/**
 * ============================================================
 * Sitemap Dinâmico - Gera sitemap.xml automaticamente
 * ============================================================
 */

function generateSiteMap(matches = []) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sinucabet.com.br';
  const currentDate = new Date().toISOString();

  // Páginas estáticas principais
  const staticPages = [
    {
      url: `${SITE_URL}/home`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
    },
    {
      url: `${SITE_URL}/partidas`,
      lastmod: currentDate,
      changefreq: 'hourly',
      priority: '0.9',
    },
    {
      url: `${SITE_URL}/games`,
      lastmod: currentDate,
      changefreq: 'hourly',
      priority: '0.9',
    },
  ];

  // Páginas dinâmicas de partidas
  const matchPages = matches.map((match) => ({
    url: `${SITE_URL}/partidas/${match.id}`,
    lastmod: match.updated_at || match.created_at || currentDate,
    changefreq: 'hourly',
    priority: '0.8',
  }));

  const allPages = [...staticPages, ...matchPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
     ${allPages
       .map((page) => {
         return `
       <url>
           <loc>${page.url}</loc>
           <lastmod>${page.lastmod}</lastmod>
           <changefreq>${page.changefreq}</changefreq>
           <priority>${page.priority}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sinucabet.com.br';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sinucabet-backend.onrender.com';

  // Buscar partidas ativas do backend
  let matches = [];
  try {
    const response = await fetch(`${API_URL}/api/matches?limit=1000&status=open,in_progress`);
    if (response.ok) {
      const data = await response.json();
      matches = data.data || [];
    }
  } catch (error) {
    console.error('Erro ao buscar partidas para sitemap:', error);
    // Continuar mesmo se falhar - pelo menos as páginas estáticas estarão no sitemap
  }

  // Gerar o XML do sitemap com os dados
  const sitemap = generateSiteMap(matches);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;

