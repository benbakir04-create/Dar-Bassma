/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: "#1a3a5c", light: "#2980b9" },
        accent:     { DEFAULT: "#27ae60" },
        warning:    { DEFAULT: "#f39c12" },
        danger:     { DEFAULT: "#e74c3c" },
      },
      fontFamily: {
        arabic: ["Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
