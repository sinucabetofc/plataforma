/**
 * ============================================================
 * Página: /sobre
 * Descrição: Página sobre a SinucaBet
 * ============================================================
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO, { getOrganizationSchema } from '../components/SEO';
import { 
  Trophy, 
  Shield, 
  Users, 
  Target, 
  Zap, 
  Heart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function SobrePage() {
  const router = useRouter();

  // Structured Data para AboutPage
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'SinucaBet',
      description: 'Plataforma de apostas em sinuca. Sistema P2P transparente e seguro.',
      url: 'https://sinucabet.com.br',
      logo: 'https://sinucabet.com.br/logo.png',
      foundingDate: '2024',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Suporte',
        email: 'contato@sinucabet.com.br',
      },
      sameAs: [
        // Adicionar redes sociais quando disponíveis
      ],
    },
  };

  const organizationSchema = getOrganizationSchema();
  const structuredData = [organizationSchema, aboutPageSchema];

  const valores = [
    {
      icon: Shield,
      title: 'Transparência',
      description: 'Todas as apostas são públicas e auditáveis. Você sabe exatamente o que está acontecendo.',
    },
    {
      icon: Target,
      title: 'Justiça',
      description: 'Sistema P2P sem manipulação de odds. Você aposta diretamente contra outros jogadores.',
    },
    {
      icon: Zap,
      title: 'Inovação',
      description: 'Tecnologia de ponta para uma experiência moderna e intuitiva.',
    },
    {
      icon: Heart,
      title: 'Responsabilidade',
      description: 'Aposte com consciência. Promovemos o jogo responsável.',
    },
  ];

  const diferencial = [
    'Sistema P2P transparente - sem casa de apostas',
    'Apostas em tempo real durante as partidas',
    'Plataforma 100% brasileira',
    'Suporte dedicado em português',
    'Transações seguras via PIX',
    'Interface moderna e intuitiva',
  ];

  return (
    <>
      <SEO
        title="Sobre a SinucaBet"
        description="Conheça a SinucaBet - A plataforma de apostas em sinuca mais transparente do Brasil. Sistema P2P, apostas ao vivo e tecnologia de ponta. Aposte com responsabilidade."
        keywords="sobre sinucabet, plataforma apostas sinuca, sinuca bet brasil, apostas sinuca online, como funciona sinucabet"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-[#171717] py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-verde-neon/20 rounded-full mb-6">
              <Trophy className="text-verde-neon" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sobre a <span className="text-verde-neon">SinucaBet</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A plataforma de apostas em sinuca mais transparente e moderna do Brasil
            </p>
          </div>

          {/* Missão, Visão, Valores */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <Target className="text-verde-neon mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Missão</h3>
              <p className="text-gray-400">
                Democratizar as apostas esportivas em sinuca, proporcionando uma experiência transparente, segura e divertida para todos os brasileiros.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <Trophy className="text-verde-neon mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Visão</h3>
              <p className="text-gray-400">
                Ser a maior plataforma de apostas em sinuca da América Latina até 2027, reconhecida pela transparência e inovação.
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <Heart className="text-verde-neon mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Valores</h3>
              <p className="text-gray-400">
                Transparência, segurança, inovação, responsabilidade e foco no usuário são os pilares da nossa plataforma.
              </p>
            </div>
          </div>

          {/* Nossos Valores */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {valores.map((valor, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-verde-neon/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <valor.icon className="text-verde-neon" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {valor.title}
                      </h3>
                      <p className="text-gray-400">{valor.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diferenciais */}
          <div className="bg-gradient-to-r from-verde-neon/10 to-verde-claro/10 border border-verde-neon/30 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Por que escolher a SinucaBet?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {diferencial.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-verde-neon flex-shrink-0 mt-1" size={20} />
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Como Funciona (Preview) */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 mb-16">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Quer saber como funciona?
                </h2>
                <p className="text-gray-400">
                  Descubra como apostar na SinucaBet de forma simples e segura.
                </p>
              </div>
              <Link
                href="/como-funciona"
                className="flex items-center gap-2 px-6 py-3 bg-verde-neon text-black font-semibold rounded-lg hover:bg-verde-claro transition-colors"
              >
                Ver Como Funciona
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-400 mb-6">
              Junte-se a milhares de apostadores e comece a apostar agora mesmo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/home"
                className="px-8 py-4 bg-verde-neon text-black font-bold rounded-lg hover:bg-verde-claro transition-colors text-center"
              >
                Ver Partidas
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-transparent border-2 border-verde-neon text-verde-neon font-bold rounded-lg hover:bg-verde-neon/10 transition-colors text-center"
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

