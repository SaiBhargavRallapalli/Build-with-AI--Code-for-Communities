import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          500: "#2854d6",
          600: "#1f42ad",
          700: "#1a3689",
          900: "#122356",
        },
      },
    },
  },
  plugins: [],
};
export default config;
