import type { Config } from "tailwindcss";

// Configuração do Tailwind CSS.
// Aqui definimos onde o Tailwind procura classes e os tokens de design (cores, raios, etc.).
const config: Config = {
  // Arquivos varridos pelo Tailwind para gerar somente o CSS usado (tree-shaking).
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Mapeamos cores para variáveis CSS (definidas em globals.css).
      // Esse é o padrão usado pelo ShadCN/UI: permite trocar de tema (claro/escuro) só mexendo nas variáveis.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Raios de borda baseados numa variável, para consistência visual.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Animações usadas em componentes (ex: spinner de loading).
      keyframes: {
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  // Plugin que adiciona utilitários de animação (usado por componentes ShadCN).
  plugins: [require("tailwindcss-animate")],
};

export default config;
