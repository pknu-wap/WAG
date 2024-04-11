import { useEffect, useState } from "react";
import Button from "../components/button/Button";
import FullLayout from "../components/layout/FullLayout";
import { ConnectedProps, connect } from "react-redux";
import { RootState } from "../modules";
import { useRecoilState } from "recoil";
import { modalState } from "../recoil/modal";
import Modal from "../components/modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

type Props = {
  children?: React.ReactNode;
};

type PropsFromRedux = ConnectedProps<typeof connector>;
type ComponentProps = Props & PropsFromRedux;
const connector = connect(
  (state: RootState) => ({ dark: state.dark.isDark }),
  {}
);

function MainPage({ dark }: ComponentProps) {
  const [theme, setTheme] = useState(localStorage.theme);
  const [, setIsOpen] = useRecoilState(modalState);
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const [disabled] = useState<boolean>(true);

  useEffect(() => {
    if (dark) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, [dark]);

  return (
    <FullLayout>
      {theme === "light" ? (
        <img src="images/WAG_white.2.png" alt="logo light mode"></img>
      ) : (
        <img src="images/WAG_dark.2.png" alt="logo dark mode"></img>
      )}
      <div className="flex flex-col items-center justify-center space-y-5">
        <Button size="lg" onClick={openModal}>
          랜덤 참가
        </Button>
        <Button size="lg">방 생성</Button>
        <Button size="lg">방 참가</Button>
      </div>
      <Modal onRequestClose={closeModal}>
        <div className="flex flex-col justify-between items-end">
          <div>
            <div className="my-5 flex flex-row justify-between items-center">
              <div className="text-4xl">JOIN</div>
              <button onClick={closeModal}>
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>

            <input
              className="w-3/4 h-12 mb-5 rounded shadow-md pl-5 text-[#000000]"
              type="text"
              required
              placeholder={"입장코드를 입력해주세요"}
            ></input>
            <Button className="" size="sm">
              중복 확인
            </Button>
          </div>

          <div className="m-auto flex justify-end items-end">
            {!disabled ? (
              <Button disabled={disabled} size="lg">
                드가자
              </Button>
            ) : (
              <Button
                className="bg-light-btn_disabled dark:bg-light-btn_disabled hover:shadow-sm hover:bg-light-btn_disabled active:bg-light-btn_disabled dark:hover:bg-light-btn_disabled dark:active:bg-light-btn_disabled"
                disabled={disabled}
                size="lg"
              >
                아직 멀었다
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </FullLayout>
  );
}

export default connector(MainPage);
