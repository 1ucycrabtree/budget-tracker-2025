/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily:{
        sans: ["Chivo", "sans-serif"],
      },
      colors: {
        linen: "#f9eae1",
        roseTaupe: "#7d4f50",
        cinereous: "#aa998f",
        dun: "#d1be9c",
        oldRose: "#cc8b86",
      },
    },
  },
  plugins: [],
};
