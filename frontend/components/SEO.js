/**
 * ============================================================
 * SEO Component - Componente Reutilizável para SEO
 * ============================================================
 * Gerencia todas as meta tags, Open Graph, Twitter Cards e Structured Data
 */

import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sinucabet.com.br';
const SITE_NAME = 'SinucaBet';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Plataforma de apostas em sinuca. Acompanhe partidas ao vivo, faça suas apostas e ganhe prêmios. Sistema P2P transparente e seguro.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  structuredData,
  keywords,
  author = 'SinucaBet',
  publishedTime,
  modifiedTime,
}) {
  const router = useRouter();
  const canonicalUrl = url || `${SITE_URL}${router.asPath}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Apostas em Sinuca`;

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent.join(', ')} />
      <meta name="author" content={author} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article specific (se type for article) */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />
      <meta name="twitter:site" content="@sinucabet" />
      <meta name="twitter:creator" content="@sinucabet" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0a0f14" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )
      )}
    </Head>
  );
}

/**
 * Helper function para criar structured data de Organization
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      // Adicionar redes sociais quando disponíveis
      // 'https://www.facebook.com/sinucabet',
      // 'https://www.instagram.com/sinucabet',
      // 'https://twitter.com/sinucabet',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Suporte',
      email: 'contato@sinucabet.com.br',
    },
  };
}

/**
 * Helper function para criar structured data de WebSite
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/partidas?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Helper function para criar structured data de Event (Partida)
 */
export function getEventSchema(match) {
  if (!match) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.player1?.name || 'Jogador 1'} vs ${match.player2?.name || 'Jogador 2'}`,
    description: `Partida de sinuca entre ${match.player1?.name || 'Jogador 1'} e ${match.player2?.name || 'Jogador 2'}. Faça sua aposta agora!`,
    startDate: match.start_time || match.created_at,
    endDate: match.end_time,
    location: {
      '@type': 'Place',
      name: 'SinucaBet - Plataforma Online',
      url: SITE_URL,
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    sport: 'Sinuca',
    url: `${SITE_URL}/partidas/${match.id}`,
  };
}

/**
 * Helper function para criar structured data de BreadcrumbList
 */
export function getBreadcrumbSchema(items) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

