/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/html/utils/withMT";

module.exports = withMT({
  content: ["./src/**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {},
    colors: {
      light: {
        bg: "#FFE5E5",
        chat: "#FFCCFF",
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
  plugins: [require("@tailwindcss/forms")],
  darkMode: "class",
});
