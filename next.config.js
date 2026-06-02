/** @type {import('next').NextConfig} */
// Arquivo de configuração do Next.js.
const nextConfig = {
  images: {
    // Lista de domínios externos autorizados para o componente <Image>.
    // O <Image> só otimiza imagens de domínios explicitamente liberados (segurança).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Usado nas imagens de demonstração da landing page.
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",      // Gera avatares automáticos a partir do nome do usuário.
      },
    ],
  },
};

// Exporta a configuração para o Next.js consumir.
module.exports = nextConfig;
