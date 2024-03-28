import { useState } from "react";
import "./App.css";
import Button from "./component/button/Button";
import Modal from "./component/modal/Modal";

function App() {

  const [openModal, setOpenModal] = useState(false);
  const modalOnClick = () => {
    setOpenModal(!openModal)
  }
  return (
    <div className="App">
      <div className="justify-center text-9xl mb-20 text-black dark:text-dark-text">WAG</div>
      <div className="flex flex-col items-center justify-center space-y-5">
        <Button size="lg" >방 생성</Button>
        <Button size="lg" >방 참가</Button>
        <Button size="lg" >랜덤 참가</Button>
        <Button size="md" >순위 보러가기</Button>
        <Button onClick={modalOnClick} size="md" >모달 열어보기</Button>
      </div>
      {openModal && <Modal onOpenModal={modalOnClick} />}
    </div>
  );
}

export default App;
