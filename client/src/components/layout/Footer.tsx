import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../modules/index";
import { toggleDarkMode } from "../../modules/darkSlice";
import IconButton from "../button/IconButton";
import RulesModal from "../modal/RulesModal";
import { useRecoilState } from "recoil";
import { rulesModalState, soundEffectStatus } from "../../recoil/recoil";
import FullLayout from "./FullLayout";
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
    <FullLayout>
      <footer className={`absolute bottom-10 w-full flex justify-between items-center pr-3 pl-3 `}>
          <div>
            © WAG!
          </div>
          <div>
            v1.0.1
          </div>
      </footer>
</FullLayout>

  );
};

const connector = connect((state: RootState) => ({ dark: state.dark.isDark }), {
  toggleDarkMode,
});
export default connector(Footer);
