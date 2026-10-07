// Conteúdo da página de links (juninhomoro.com.br).
// O número do WhatsApp vem do painel do professor (Perfil → WhatsApp).
// As planilhas "Em breve" vêm da tela Planilhas do painel: crie a planilha e coloque o status "Em breve".

export const LINKS_CONFIG = {
  instagram: 'juninhomoro_',
  supportEmail: 'suportejmteam@outlook.com',

  messages: {
    consultoria: 'Oi, Juninho! Vim pelo seu site e quero saber como funciona a consultoria.',
    suporte: 'Oi! Comprei uma planilha e preciso de ajuda com o meu acesso ao app.',
    emBreve: (produto: string) => `Oi, Juninho! Quero ser avisado(a) quando a planilha ${produto} lançar.`,
  },

  // Planilha em destaque (sempre aparece, com a página de vendas própria)
  featured: {
    name: 'Glúteos 3D',
    eyebrow: 'Planilha · 6 semanas',
    text: 'Treino novo liberado no app toda semana.',
    priceCents: 2790,
    oldPriceCents: 9990,
    href: '/gluteos3d',
  },

  // Depoimentos que estavam no site antigo (as fotos ficam para quando chegarem os arquivos originais)
  results: [
    {
      metric: '−14 kg',
      context: 'em 3 anos',
      quote: 'Nunca imaginei que conseguiria mudar tanto. O treino fez toda a diferença!',
      name: 'Karla R.',
    },
    {
      metric: '−31 kg',
      context: 'de gordura em 6 meses',
      quote: 'A melhor decisão que tomei foi começar. Em 6 meses eliminei 31 kg e recuperei minha autoestima.',
      name: 'Lucas P.',
    },
    {
      metric: 'Top 1',
      context: 'Open Copa Fitness 2025',
      quote: 'Quem vê o troféu não imagina as batalhas que vieram antes dele. Da obesidade e da depressão ao lugar mais alto do pódio.',
      name: 'Victor R.',
    },
  ],
}
