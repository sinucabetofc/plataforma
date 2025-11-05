/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SinucaBet Design System - Verde Elegante
        // Verde System - Apenas Verde Neon (#27E502)
        'verde-escuro': '#0f3529',
        'verde-medio': '#1b4d3e',
        'verde-principal': '#27E502',
        'verde-claro': '#3d8b6f',
        'verde-accent': '#27E502',
        'verde-neon': '#27E502',
        
        // Cinza System (backgrounds sofisticados)
        'cinza-escuro': '#0a0f14',
        'cinza-medio': '#1a1a1a',
        'cinza-claro': '#2a2a2a',
        'cinza-borda': '#000000',
        
        // Texto
        'texto-principal': '#ffffff',
        'texto-normal': '#e8edf2',
        'texto-secundario': '#9ca3af',
        'texto-desabilitado': '#6b7280',
        
        // Estados (mantém compatibilidade)
        sinuca: {
          black: "#0a0f14",
          green: "#27E502",
          'green-light': "#3d8b6f",
          'green-dark': "#0f3529",
          success: "#27E502",
          warning: "#eab308",
          error: "#ef4444",
        },
      },
      backgroundImage: {
        'gradient-verde-header': 'linear-gradient(135deg, #0f3529 0%, #1b4d3e 50%, #27E502 100%)',
        'gradient-verde-card': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        'gradient-verde-button': 'linear-gradient(135deg, #27E502 0%, #3d8b6f 100%)',
        'gradient-verde-hover': 'linear-gradient(135deg, #3d8b6f 0%, #27E502 100%)',
        'gradient-verde-glow': 'radial-gradient(circle at 50% 50%, rgba(39, 229, 2, 0.1) 0%, transparent 70%)',
      },
      
      boxShadow: {
        'verde-soft': '0 4px 12px rgba(45, 109, 86, 0.2)',
        'verde-medium': '0 8px 24px rgba(45, 109, 86, 0.3)',
        'verde-strong': '0 12px 32px rgba(45, 109, 86, 0.4)',
        'verde-glow': '0 0 20px rgba(39, 229, 2, 0.4)',
        'verde-neon': '0 0 30px rgba(39, 229, 2, 0.6)',
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        'pulse-live': {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(39, 229, 2, 0.5)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(39, 229, 2, 0.8)',
            transform: 'scale(1.05)',
          },
        },
        'pulse-dot': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '1',
          },
          '50%': { 
            transform: 'scale(1.3)', 
            opacity: '0.7',
          },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(39, 229, 2, 0.3)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(39, 229, 2, 0.6)',
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}





