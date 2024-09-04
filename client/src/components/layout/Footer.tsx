import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import IconButton from "../button/IconButton";
import RulesModal from "../modal/RulesModal";
import { useRecoilState } from "recoil";
import { rulesModalState, soundEffectStatus } from "../../recoil/recoil";
const { useEffect, useState, useRef } = React;

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;

const Footer = ({ dark, toggleDarkMode }: ComponentProps) => {
  const [soundEffectStatusValue, ] = useRecoilState(soundEffectStatus);
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);



  return (
<footer className="m-5 z-30 flex absolute bottom-0 w-11/12 justify-between">
  <div className="relative bottom-3">
    © WAG!
  </div>
  <div className="relative bottom-3">
    v1.0.0
  </div>
</footer>
  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Footer);
