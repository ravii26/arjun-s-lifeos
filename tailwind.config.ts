import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        s1: "var(--s1)",
        s2: "var(--s2)",
        s3: "var(--s3)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-muted": "var(--primary-muted)",
        teal: "var(--teal)",
        "teal-muted": "var(--teal-muted)",
        amber: "var(--amber)",
        "amber-muted": "var(--amber-muted)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        borderPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulse: "pulse 2s infinite",
        "border-pulse": "borderPulse 2s infinite",
        "slide-up": "slideUp 250ms cubic-bezier(0.32,0.72,0,1)",
        "fade-in-up": "fadeInUp 200ms ease forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
