import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EBF5FF",
          100: "#D6EAFF",
          200: "#A3D1FF",
          300: "#70B8FF",
          400: "#3D9FFF",
          500: "#185FA5",
          600: "#134D87",
          700: "#0E3B69",
          800: "#0A294B",
          900: "#05172D",
        },
        urgency: {
          critical: "#E24B4A",
          moderate: "#EF9F27",
          low: "#639922",
        },
        accent: {
          teal: "#1D9E75",
          purple: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "count-up": "countUp 1s ease-out",
        "fill-bar": "fillBar 0.8s ease-out forwards",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fillBar: {
          "0%": { width: "0%" },
          "100%": { width: "var(--fill-width)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
