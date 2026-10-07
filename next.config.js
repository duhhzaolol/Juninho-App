/** @type {import('next').NextConfig} */

// O app fica todo dentro de /app: juninhomoro.com.br/app/login, /app/treino, /app/trainer/...
// As páginas continuam nas mesmas pastas (app/(student), app/trainer, app/cadastro...):
// aqui o Next só "traduz" o endereço, e /app/treino abre a página da pasta treino.
// Fora do /app ficam a página de links (/), as páginas de venda (/gluteos3d) e a API (/api).

// Endereços antigos, de antes do /app (links já enviados, favoritos, avisos salvos no banco).
// Eles continuam funcionando: redirecionam para o mesmo lugar dentro do /app.
const OLD_APP_PAGES = [
  'login',
  'cadastro',
  'confirmar-email',
  'definir-senha',
  'esqueci-senha',
  'aguardando-aprovacao',
  'dashboard',
  'treino',
  'planilhas',
  'perfil',
  'progresso',
  'mensagens',
  'notificacoes',
  'biblioteca',
  'calendario',
  'alendario',
  'trainer',
]

const nextConfig = {
  async redirects() {
    return OLD_APP_PAGES.map((page) => ({
      source: `/${page}/:path*`,
      destination: `/app/${page}/:path*`,
      permanent: false,
    }))
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: '/app/:path+', destination: '/:path+' }],
    }
  },
}

module.exports = nextConfig
