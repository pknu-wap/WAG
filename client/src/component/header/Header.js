import { connect } from "react-redux";
import { toggleDarkMode } from "../../modules/darkSlice";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";

const Header = ({ dark, toggleDarkMode }) => {
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <header className="m-5">
      <div className="flex justify-end text-black dark:text-white">
        <button
          onClick={() => {
            toggleDarkMode("이렇게전달해요");
          }}
        >
          {dark ? (
            <FontAwesomeIcon icon={faMoon} size="2x" />
          ) : (
            <FontAwesomeIcon icon={faSun} size="2x" regula />
          )}
        </button>
      </div>
    </header>
  );
};

const connector = connect((state) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Header);
