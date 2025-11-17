import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document - Configuração do HTML base
 */
export default function Document() {
  const GA_MEASUREMENT_ID = 'G-HKDJ908R07';

  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0f14" />
        <meta
          name="description"
          content="SinucaBet - Plataforma de apostas em sinuca. Acompanhe partidas ao vivo, faça suas apostas e ganhe prêmios. Sistema P2P transparente e seguro."
        />
        {/* Preconnect para melhor performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS Prefetch para APIs externas */}
        <link rel="dns-prefetch" href="https://sinucabet-backend.onrender.com" />
        <link rel="dns-prefetch" href="https://atjxmyrkzcumieuayapr.supabase.co" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google Analytics (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

