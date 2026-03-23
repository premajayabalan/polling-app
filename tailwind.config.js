/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1c1c2e",
          accent: "#6c63ff",
          soft: "#a78bfa",
          glow: "#c4b5fd",
        },
      },
    },
  },
  plugins: [],
};
