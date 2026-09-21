/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ARP design system — surface.*
        background: "#090909", // surface.canvas — app/page background
        surface: "#1E1E1E", // surface.default — cards, sheets, navigation, primary surfaces
        surfaceRaised: "#373737", // surface.input — inputs, controls, notices
        surfaceInset: "#0A0A0A", // surface.inset — inset information areas

        // text.*
        text: "#FFFFFF", // text.primary
        secondaryText: "#CCCCCC", // text.secondary
        textOnAction: "#002B26", // text.on-action — label on accent-filled buttons/CTAs
        textOnChip: "#252525", // text on a selected filter chip

        // action / border accent — single controlled teal accent
        primary: "#00AF9E", // action.primary / text.accent / border.active
        primaryDark: "#007F73", // pressed/active shade of the same accent hue (not a new hue)
        border: "#373737", // border.default
        borderActive: "#00AF9E", // border.active

        // status — only status.positive is defined by the spec; error/warning are
        // pragmatic, unstyled extensions the app needs (payment/report states) and are
        // left at their existing values since the spec doesn't address them.
        success: "#20E300", // status.positive
        warning: "#f59e0b",
        error: "#ef4444",

        // reference grays
        placeholderText: "#A1A1A1", // input placeholder
        metadataText: "#BABABA", // low-emphasis metadata
        supportingText: "#D0D0D0", // address / supporting text
        inactiveIndicator: "#646464", // inactive tab indicator
      },
      borderRadius: {
        none: "0px",
        xs: "2px",
        card: "16px",
        button: "16px",
        pill: "16px",
        sheet: "30px",
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
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        action: [
          "Poppins",
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
    },
  },
  plugins: [],
};
