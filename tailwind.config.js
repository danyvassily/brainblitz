/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend-react/index.html",
    "./frontend-react/src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        background: "#F3F4F6",
        text: "#1F2937",
      },
      fontFamily: {
        abril: ['"Abril Fatface"', "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
