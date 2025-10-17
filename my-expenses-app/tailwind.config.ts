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
        // Use CSS custom properties for dynamic theming
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },

        secondary: {
          50: "var(--color-secondary-50)",
          100: "var(--color-secondary-100)",
          200: "var(--color-secondary-200)",
          300: "var(--color-secondary-300)",
          400: "var(--color-secondary-400)",
          500: "var(--color-secondary-500)",
          600: "var(--color-secondary-600)",
          700: "var(--color-secondary-700)",
          800: "var(--color-secondary-800)",
          900: "var(--color-secondary-900)",
        },

        accent: {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
        },

        // Semantic colors
        success: "var(--color-semantic-success)",
        warning: "var(--color-semantic-warning)",
        error: "var(--color-semantic-error)",
        info: "var(--color-semantic-info)",

        // Background colors
        background: {
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
          glass: "var(--color-background-glass)",
          card: "var(--color-background-card)",
        },

        // Text colors
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },

        // Border colors
        border: {
          primary: "var(--color-border-primary)",
          secondary: "var(--color-border-secondary)",
          focus: "var(--color-border-focus)",
          glass: "var(--color-border-glass)",
        },
      },

      // Gradient configurations using CSS custom properties
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(to right, var(--color-primary-500), var(--color-secondary-500))",
        "gradient-secondary":
          "linear-gradient(to right, var(--color-secondary-500), var(--color-accent-500))",
        "gradient-accent":
          "linear-gradient(to right, var(--color-accent-500), var(--color-primary-500))",
        "gradient-background":
          "linear-gradient(to bottom right, var(--color-background-primary), var(--color-background-secondary), var(--color-background-primary))",
      },
    },
  },
  plugins: [],
} satisfies Config;
