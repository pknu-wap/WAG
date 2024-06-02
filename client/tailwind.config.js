/** @type {import('tailwindcss').Config} */
module.exports = { 
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
  plugins: [require("@tailwindcss/forms"), 
    function ({addUtilities}) {
      addUtilities({
        ".scrollbar-thin": {
          '::-webkit-scrollbar': {
            'width': '10px',
          },
          '::-webkit-scrollbar-thumb': {
            'background': '#FFCCFF',
            'border-radius': '10px',
          },
        },
        ".scrollbar-thin-horizontal": {
          '::-webkit-scrollbar': {
            'height': '8px',
          },
          '::-webkit-scrollbar-thumb': {
            'background': '#FFCCFF',
            'border-radius': '8px',
          },
          'scrollbar-width': 'thin',
          'scrollbar-color': '#FFCCFF #f1f1f1',
        }
      }, ['responsive'])
    }
  ],
  darkMode: "class",
}; 