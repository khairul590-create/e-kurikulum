import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy sidebar / brand
        navy: {
          50: "#EEF3FB",
          100: "#D6E0F0",
          600: "#1B3A6B",
          700: "#143461",
          800: "#0F2A4A",
          900: "#0B2038",
        },
        brand: {
          DEFAULT: "#2563EB",
          50: "#EFF5FF",
          100: "#DBE8FE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        sky: "#0EA5E9",
        indigo: "#818CF8",
        ocean: {
          DEFAULT: "#1E3A8A",
          deep: "#172554",
          bright: "#60A5FA",
        },
        sun: {
          DEFAULT: "#FBBF24",
          deep: "#E09600",
        },
        canvas: "#F0F6FF",
        paper: "#F0F6FF",
        cream: "#EFF5FF",
        line: "#D8E6FB",
        ink: {
          DEFAULT: "#152244",
          muted: "#4A5A7E",
          soft: "#8B99B8",
        },
        ok: "#16A34A",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Nunito", "'Trebuchet MS'", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Poppins", "Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 8px 26px rgba(37,99,235,0.08)",
        chunky: "0 14px 34px rgba(37,99,235,0.16)",
        pop: "0 18px 44px rgba(37,99,235,0.20)",
        sun: "0 8px 24px rgba(251,191,36,0.45)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        float1: {
          "0%,100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-26px) scale(1.06)" },
        },
        float2: {
          "0%,100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(24px) scale(0.95)" },
        },
        bob: {
          "0%,100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        float1: "float1 9s ease-in-out infinite",
        float2: "float2 11s ease-in-out infinite",
        bob: "bob 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
