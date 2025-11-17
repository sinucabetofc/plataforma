/**
 * ============================================================
 * Página: /como-funciona
 * Descrição: Explicação de como funciona a plataforma SinucaBet
 * ============================================================
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import SEO from '../components/SEO';
import { 
  UserPlus, 
  Trophy, 
  Target, 
  DollarSign, 
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Users,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

export default function ComoFuncionaPage() {
  const router = useRouter();

  // FAQ Schema para SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Como funciona o sistema de apostas da SinucaBet?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A SinucaBet utiliza um sistema P2P (peer-to-peer), onde você aposta diretamente contra outros jogadores. Quando você aposta em um jogador, o sistema procura alguém que apostou no jogador oposto para casar a aposta. Se seu jogador vencer, você recebe o dobro do valor apostado.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como faço para depositar dinheiro na plataforma?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você pode depositar dinheiro através de PIX. Basta acessar sua carteira, clicar em "Depositar" e seguir as instruções. O depósito é processado instantaneamente.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como faço para sacar meus ganhos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Para sacar, acesse sua carteira e clique em "Sacar". Digite o valor desejado e confirme. Há uma taxa de 8% sobre o valor do saque. O saque é processado em até 24 horas úteis.',
        },
      },
      {
        '@type': 'Question',
        name: 'O que acontece se minha aposta não for casada?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Se sua aposta não for casada até o início da partida, o valor é automaticamente reembolsado para sua carteira. Você pode tentar apostar novamente em outra partida.',
        },
      },
      {
        '@type': 'Question',
        name: 'A plataforma é segura?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! A SinucaBet utiliza criptografia de ponta a ponta, sistema P2P transparente onde todas as apostas são públicas, e todas as transações são auditáveis. Seus dados e dinheiro estão seguros conosco.',
        },
      },
      {
        '@type': 'Question',
        name: 'Posso apostar durante a partida?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! A SinucaBet permite apostas ao vivo durante as partidas. Você pode acompanhar o placar em tempo real e fazer suas apostas enquanto a partida está acontecendo.',
        },
      },
    ],
  };

  const passos = [
    {
      numero: 1,
      icon: UserPlus,
      title: 'Crie sua conta',
      description: 'Cadastre-se gratuitamente em poucos minutos. Você só precisa de um email, CPF e criar uma senha segura.',
      details: [
        'Preencha seus dados pessoais',
        'Confirme seu email',
        'Complete seu cadastro',
      ],
    },
    {
      numero: 2,
      icon: DollarSign,
      title: 'Faça um depósito',
      description: 'Deposite dinheiro na sua carteira através de PIX. O depósito é instantâneo e seguro.',
      details: [
        'Acesse sua carteira',
        'Clique em "Depositar"',
        'Escaneie o QR Code PIX',
        'Confirme o pagamento',
      ],
    },
    {
      numero: 3,
      icon: Trophy,
      title: 'Escolha uma partida',
      description: 'Navegue pelas partidas disponíveis e escolha aquela em que deseja apostar.',
      details: [
        'Veja partidas ao vivo e agendadas',
        'Confira os jogadores',
        'Veja as odds e valores disponíveis',
        'Selecione a partida desejada',
      ],
    },
    {
      numero: 4,
      icon: Target,
      title: 'Faça sua aposta',
      description: 'Escolha em qual jogador você quer apostar e o valor. O sistema procurará alguém do lado oposto para casar sua aposta.',
      details: [
        'Selecione o jogador (A ou B)',
        'Escolha o valor da aposta',
        'Confirme sua aposta',
        'Aguarde o matching (casamento)',
      ],
    },
    {
      numero: 5,
      icon: CheckCircle,
      title: 'Acompanhe e ganhe',
      description: 'Acompanhe a partida ao vivo. Se seu jogador vencer, você recebe o dobro do valor apostado automaticamente na sua carteira.',
      details: [
        'Acompanhe o placar em tempo real',
        'Veja o status da sua aposta',
        'Receba seus ganhos automaticamente',
        'Saque quando quiser',
      ],
    },
  ];

  const vantagens = [
    {
      icon: Shield,
      title: '100% Transparente',
      description: 'Todas as apostas são públicas e auditáveis. Você sabe exatamente o que está acontecendo.',
    },
    {
      icon: Users,
      title: 'Sistema P2P',
      description: 'Você aposta diretamente contra outros jogadores, sem casa de apostas no meio.',
    },
    {
      icon: Zap,
      title: 'Apostas ao Vivo',
      description: 'Aposte durante as partidas e acompanhe tudo em tempo real.',
    },
    {
      icon: Clock,
      title: 'Reembolso Automático',
      description: 'Se sua aposta não for casada, o valor é reembolsado automaticamente.',
    },
  ];

  return (
    <>
      <SEO
        title="Como Funciona - SinucaBet"
        description="Aprenda como apostar na SinucaBet. Sistema P2P transparente, apostas ao vivo, depósitos via PIX e saques rápidos. Guia completo passo a passo."
        keywords="como apostar sinuca, como funciona sinucabet, apostas sinuca tutorial, sinuca bet guia, como apostar online sinuca"
        structuredData={faqSchema}
      />

      <div className="min-h-screen bg-[#171717] py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-verde-neon/20 rounded-full mb-6">
              <Trophy className="text-verde-neon" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Como <span className="text-verde-neon">Funciona</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Aprenda a apostar na SinucaBet em 5 passos simples
            </p>
          </div>

          {/* Passo a Passo */}
          <div className="space-y-8 mb-16">
            {passos.map((passo, index) => (
              <div key={index} className="relative">
                {/* Linha conectora (exceto no último) */}
                {index < passos.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-verde-neon/30 hidden md:block" />
                )}

                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 md:p-8 hover:border-verde-neon/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Número e Ícone */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-verde-neon/20 rounded-full flex items-center justify-center">
                          <passo.icon className="text-verde-neon" size={32} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-verde-neon rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-sm">{passo.numero}</span>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {passo.title}
                      </h3>
                      <p className="text-gray-400 mb-4">{passo.description}</p>
                      
                      {/* Detalhes */}
                      <ul className="space-y-2">
                        {passo.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2">
                            <ArrowRight className="text-verde-neon flex-shrink-0 mt-1" size={16} />
                            <span className="text-gray-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vantagens */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Vantagens da SinucaBet
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {vantagens.map((vantagem, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-verde-neon/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <vantagem.icon className="text-verde-neon" size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {vantagem.title}
                      </h3>
                      <p className="text-gray-400">{vantagem.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-r from-verde-neon/10 to-verde-claro/10 border border-verde-neon/30 rounded-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Perguntas Frequentes
            </h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((faq, index) => (
                <div key={index} className="bg-[#1a1a1a]/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {faq.name}
                  </h3>
                  <p className="text-gray-300">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-400 mb-6">
              Crie sua conta agora e comece a apostar em partidas de sinuca
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-verde-neon text-black font-bold rounded-lg hover:bg-verde-claro transition-colors text-center"
              >
                Criar Conta Grátis
              </Link>
              <Link
                href="/sobre"
                className="px-8 py-4 bg-transparent border-2 border-verde-neon text-verde-neon font-bold rounded-lg hover:bg-verde-neon/10 transition-colors text-center"
              >
                Saiba Mais Sobre Nós
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

