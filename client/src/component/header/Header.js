import { connect } from "react-redux";
import { toggleDarkMode } from "../../modules/darkSlice";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../button/IconButton";

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
      <div className="flex justify-end ">
        <IconButton
          onClick={() => {
            toggleDarkMode();
          }}
        >
          {dark ? (
            <FontAwesomeIcon icon={faMoon} size="x" />
          ) : (
            <FontAwesomeIcon icon={faSun} size="x" regula />
          )}
        </IconButton>
      </div>
    </header>
  );
};

const connector = connect((state) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Header);
