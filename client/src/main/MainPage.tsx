import { useEffect, useState } from "react";
import Button from "../components/button/Button";
import Modal from "../components/modal/Modal";
import FullLayout from "../components/layout/FullLayout";
import { ConnectedProps, connect } from "react-redux";
import { RootState } from "../modules";

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

  const [openModal, setOpenModal] = useState(false);
  const modalOnClick = () => {
    setOpenModal(!openModal);
  };
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
        <Button size="lg">방 생성</Button>
        <Button size="lg">방 참가</Button>
        <Button size="lg">랜덤 참가</Button>
        <Button size="md">순위 보러가기</Button>
        <Button onClick={modalOnClick} size="md">
          모달 열어보기
        </Button>
      </div>
      {openModal && <Modal onOpenModal={modalOnClick} />}
    </FullLayout>
  );
}

export default connector(MainPage);
