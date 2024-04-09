/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      light: {
        bg: "#FFE5E5",
        text: "#262626",
        btn: "#B931FC",
        btn_hover: "rgba(185,49,252, 0.9)",
        btn_disabled: "rgb(75 85 99)",
      },
      dark: {
        bg: "#595959",
        text: "rgb(255, 255, 255)",
        btn: "#FF6AC2",
        btn_hover: "rgba(255,106,194, 0.9)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
