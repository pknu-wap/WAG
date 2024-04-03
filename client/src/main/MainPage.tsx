import { useState } from "react";
import Button from "../components/button/Button";
import Modal from "../components/modal/Modal";

function MainPage() {
  const [openModal, setOpenModal] = useState(false);
  const modalOnClick = () => {
    setOpenModal(!openModal);
  };
  return (
    <div className="App">
      <div className="justify-center text-9xl mb-20">WAG</div>
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
    </div>
  );
}

export default MainPage;
