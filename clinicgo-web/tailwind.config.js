/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        "primary":                     "#005dac",
        "primary-container":         "#1976d2",
        "primary-fixed":             "#d4e3ff",
        "primary-fixed-dim":         "#a5c8ff",
        "on-primary":                "#ffffff",
        "on-primary-container":      "#fffdff",
        secondary:                   "#40627b",
        "secondary-container":       "#bee1fe",
        "on-secondary-container":    "#43647d",
        surface:                     "#f9f9f9",
        "surface-container":         "#eeeeee",
        "surface-container-low":     "#f3f3f4",
        "surface-container-high":    "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-container-lowest":  "#ffffff",
        "on-surface":                "#1a1c1c",
        "on-surface-variant":        "#414752",
        outline:                     "#717783",
        "outline-variant":           "#c1c6d4",
        background:                  "#f9f9f9",
        "on-background":             "#1a1c1c",
        error:                       "#ba1a1a",
        "error-container":           "#ffdad6",
        "on-error":                  "#ffffff",
        "sidebar-dark":              "#002B49",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};