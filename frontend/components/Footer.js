import Link from 'next/link';

/**
 * Componente Footer - Rodapé simples
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 border-verde-neon bg-gradient-to-b from-verde-escuro to-cinza-escuro">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo e descrição */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-2 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-neon shadow-verde-glow">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-texto-principal">SinucaBet</span>
            </div>
            <p className="text-center text-sm text-texto-secundario md:text-left">
              Plataforma de apostas em sinuca
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <Link
              href="/sobre"
              className="text-base text-texto-normal transition-colors hover:text-verde-accent md:text-lg"
            >
              Sobre
            </Link>
            <Link
              href="/como-funciona"
              className="text-base text-texto-normal transition-colors hover:text-verde-accent md:text-lg"
            >
              Como Funciona
            </Link>
            <Link
              href="/terms"
              className="text-base text-texto-normal transition-colors hover:text-verde-accent md:text-lg"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacy"
              className="text-base text-texto-normal transition-colors hover:text-verde-accent md:text-lg"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/contact"
              className="text-base text-texto-normal transition-colors hover:text-verde-accent md:text-lg"
            >
              Contato
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-cinza-borda pt-6 text-center">
          <p className="text-sm text-texto-secundario">
            © {currentYear} SinucaBet. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-texto-desabilitado">
            Jogue com responsabilidade. +18 anos.
          </p>
        </div>
      </div>
    </footer>
  );
}

