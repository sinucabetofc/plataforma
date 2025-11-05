import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document - Configuração do HTML base
 */
export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0f14" />
        <meta
          name="description"
          content="SinucaBet - Plataforma de apostas em sinuca"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

