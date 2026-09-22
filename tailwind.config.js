/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'Avenir', 'Verdana', 'Nunito', 'sans-serif'],
      },
      animation: {
        iconPulse: "iconPulse 2s ease-in-out infinite",
      },
      keyframes: {
        iconPulse: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};