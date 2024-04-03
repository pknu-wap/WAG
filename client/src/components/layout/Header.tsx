import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import IconButton from "../button/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
const { useEffect } = React;

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;

const Header = ({ dark, toggleDarkMode }: ComponentProps) => {
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
          size="md"
          onClick={() => {
            toggleDarkMode("");
          }}
        >
          {dark ? (
            <FontAwesomeIcon icon={faMoon} size="1x" />
          ) : (
            <FontAwesomeIcon icon={faSun} size="1x" />
          )}
        </IconButton>
      </div>
    </header>
  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Header);
