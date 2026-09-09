/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#161616",
        surfaceRaised: "#1f1f1f",
        primary: "#0fbfa8",
        primaryDark: "#0a8f7e",
        text: "#f5f5f5",
        secondaryText: "#9a9a9a",
        border: "#2a2a2a",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        pill: "999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
