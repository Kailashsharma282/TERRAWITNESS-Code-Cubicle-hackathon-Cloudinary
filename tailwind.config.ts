import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0d11",
        surface: "#11141a",
        "surface-elevated": "#171b23",
        "surface-overlay": "#1d232e",
        border: "#232a36",
        "border-subtle": "#1b212b",
        "border-strong": "#374151",
        foreground: "#f3f4f6",
        "foreground-muted": "#9ca3af",
        "foreground-dim": "#6b7280",
        witness: {
          green: "#10b981",
          emerald: "#059669",
          amber: "#f59e0b",
          red: "#ef4444",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          slate: "#64748b",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
