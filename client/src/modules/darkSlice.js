import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDark:
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches),
};

const darkSlice = createSlice({
  name: "darkSlice",
  initialState,
  reducers: {
    toggleDarkMode: (state, action) => {
      const update = !state.isDark;
      console.log(action.payload);
      if (update) {
        localStorage.theme = "dark";
      } else {
        localStorage.theme = "light";
      }
      state.isDark = update;
    },
  },
});

export const { toggleDarkMode } = darkSlice.actions;
export default darkSlice;
