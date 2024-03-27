import React, { useLayoutEffect } from "react";

const LOCAL_STORAGE_KEY = {
  THEME: "theme",
};
const THEME = {
  LIGHT: "light",
  DARK: "dark",
};

const ThemeButton = () => {
  useLayoutEffect(() => {
    const theme = localStorage.getItem(LOCAL_STORAGE_KEY.THEME) || THEME.LIGHT;
    if (theme === THEME.DARK) {
      document.querySelector("html")?.classList.add(THEME.DARK);
    }
  }, []);
  const toggleTheme = () => {
    // html 태그를 가지고 옴
    const htmlEl = document.querySelector("html");
    if (!htmlEl) return;

    const enabledDarkMode = htmlEl.classList.contains("dark");
    if (enabledDarkMode) {
      // 다크모드인 경우(html 태그의 className에 dark가 있을때)
      // -> className에서 dark를 제거
      htmlEl.classList.remove("dark");
      localStorage.removeItem(LOCAL_STORAGE_KEY.THEME);
    } else {
      // 다크모드가 아닌 경우, className에서 dark를 추가
      htmlEl.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_KEY.THEME, THEME.DARK);
    }
  };

  return <button onClick={toggleTheme}>toggle theme</button>;
};

export default ThemeButton;
