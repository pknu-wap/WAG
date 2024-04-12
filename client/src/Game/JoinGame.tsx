import { useEffect, useState } from "react";
import FullLayout from "../components/layout/FullLayout";
import Button from "../components/button/Button";
import { useGetNicknamePossibleQuery } from "../api/joinRoom";
import { INicknamePossible } from "../types/dto";
import Modal from "../components/modal/Modal";

// 방장이 아닌 초대된 사람들 참가 페이지(비공개방)
function JoinGame() {
  const [openModal, setOpenModal] = useState(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [inputNickname, setInputNickname] = useState("");
  const { data: nicknameData } = useGetNicknamePossibleQuery({
    nickname: inputNickname,
  });
  const [checkNickname, setCheckNickname] = useState<INicknamePossible>();
  const modalOnClick = () => {
    setOpenModal(!openModal);
  };
  const CheckNicknameOnClick = () => {
    if (!checkNickname?.isPossible) {
      modalOnClick();
      setDisabled(true);
    } else {
      modalOnClick();
      setDisabled(false);
    }
  };

  useEffect(() => {
    setCheckNickname(nicknameData);
    setDisabled(disabled);
  }, [nicknameData, disabled]);

  return (
    <FullLayout>
      <div className="m-auto w-4/5 h-4/5 p-10 rounded-2xl shadow-2xl">
        <div className="text-6xl">JOIN</div>
        <div className="m-auto mt-20 w-full">
          <div className="flex flex-row justify-between">
            <input
              className="w-3/4 h-12 mr-10 rounded shadow-md pl-5 text-[#000000]"
              type="text"
              required
              placeholder={"닉네임을 입력해주세요"}
              onChange={(e) => {
                setInputNickname(e.target.value);
              }}
            />
            <Button className="" size="sm" onClick={CheckNicknameOnClick}>
              중복 확인
            </Button>
          </div>
          <div className="my-10 h-12 flex justify-start">
            <input
              className="w-3/4 h-12 rounded shadow-md pl-5 text-[#000000]"
              type="text"
              required
              placeholder={"입장코드를 입력해주세요"}
            ></input>
          </div>
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

      {openModal && <Modal onOpenModal={modalOnClick} />}
    </FullLayout>
  );
}

export default JoinGame;