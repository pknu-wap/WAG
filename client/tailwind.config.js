/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    colors: {
      light: {
        bg: "#FFE5E5",
        text: "#262626"

      },
      dark: {
        bg: "#595959",
        text: "rgb(255, 255, 255)"
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
