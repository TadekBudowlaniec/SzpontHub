import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Geist", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "monospace"],
      },
      boxShadow: {
        "2xs": "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.07)",
        xs: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.07)",
        sm: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.15), 0.25px 1px 2px -1px hsl(236.58 64.23% 21.44% / 0.15)",
        DEFAULT: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.15), 0.25px 1px 2px -1px hsl(236.58 64.23% 21.44% / 0.15)",
        md: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.15), 0.25px 2px 4px -1px hsl(236.58 64.23% 21.44% / 0.15)",
        lg: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.15), 0.25px 4px 6px -1px hsl(236.58 64.23% 21.44% / 0.15)",
        xl: "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.15), 0.25px 8px 10px -1px hsl(236.58 64.23% 21.44% / 0.15)",
        "2xl": "0.25px 1px 3px 0px hsl(236.58 64.23% 21.44% / 0.38)",
      },
    },
  },
  plugins: [],
};

export default config;
