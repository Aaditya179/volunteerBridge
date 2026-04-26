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
        'brand-500': "#185FA5",
        'brand-700': "#0F3D6B",
        'brand-sidebar': "#0F1724",
        'brand-sidebar-text': "#CBD5E1",
        'surface-muted': "#F8FAFC",
        'surface-white': "#FFFFFF",
        'text-primary': "#1A202C",
        'text-secondary': "#64748B",
        'text-muted': "#94A3B8",
        'border-default': "#E2E8F0",
        'accent-teal': "#1D9E75",
        'urgency-critical': "#E24B4A",
        'urgency-moderate': "#EF9F27",
        'urgency-low': "#639922",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;