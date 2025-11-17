import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document - Configuração do HTML base
 */
export default function Document() {
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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

