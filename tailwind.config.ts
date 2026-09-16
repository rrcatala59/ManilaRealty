import type { Config } from "tailwindcss";

/**
 * Brisa design system: warm neutrals, stone greys, luxury serif headings.
 * Loaded by Tailwind v4 via `@config` in app/globals.css.
 */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        olive: "var(--olive)",
        cream: "oklch(0.965 0.012 85)",
        sand: "oklch(0.93 0.016 80)",
        stone: {
          DEFAULT: "oklch(0.55 0.02 60)",
          warm: "var(--stone-warm)",
          50: "oklch(0.97 0.008 85)",
          100: "oklch(0.94 0.012 82)",
          200: "oklch(0.88 0.018 80)",
          300: "oklch(0.78 0.02 75)",
          400: "oklch(0.62 0.03 70)",
          500: "oklch(0.48 0.02 60)",
          600: "oklch(0.38 0.02 55)",
          700: "oklch(0.30 0.02 50)",
          800: "oklch(0.26 0.02 50)",
          900: "oklch(0.20 0.018 48)",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "ui-serif", "Georgia", "serif"],
        heading: ["var(--font-cormorant)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        luxury: "0.22em",
      },
      borderRadius: {
        sm: "calc(var(--radius) * 0.6)",
        md: "calc(var(--radius) * 0.8)",
        lg: "var(--radius)",
      },
    },
  },
} satisfies Config;

export default config;
