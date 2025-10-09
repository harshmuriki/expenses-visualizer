import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#80A1BA", // Blue-grey
          secondary: "#91C4C3", // Teal
          success: "#B4DEBD", // Mint green
          accent: "#FFF7DD", // Cream
          "primary-dark": "#6B8BA4",
          "secondary-dark": "#7AAFAD",
          "success-dark": "#9AC9A4",
          "accent-dark": "#F5ECC8",
          "primary-light": "#C2D4E0",
          "secondary-light": "#C8E5E4",
          "success-light": "#D9EDDE",
          "accent-light": "#FFFBEE",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
