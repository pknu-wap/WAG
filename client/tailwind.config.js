/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
    colors: {
      light: {
        bg: "#FFE5E5",
        text: "#262626",
        btn: 'B931FC',
      },
      dark: {
        bg: "#595959",
        text: "rgb(255, 255, 255)",
        btn: 'FF6AC2',
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
