import { useEffect, useState } from "react";
import "./App.css";
import Button from "./components/button/Button";
import Modal from "./components/modal/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import IconButton from "./components/button/IconButton";
import { faClock, faGear } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [openModal, setOpenModal] = useState(false);
  const modalOnClick = () => {
    setOpenModal(!openModal);
  };
  const [count, setCount] = useState(30);

  useEffect(() => {
    const sec = setInterval(() => {
      // 타이머 숫자가 하나씩 줄어들도록
      setCount((count) => count - 1);
    }, 1000);

    // 0이 되면 카운트가 멈춤
    if (count === 0) {
      clearInterval(sec);
    }
    return () => clearInterval(sec);
    // 카운트 변수가 바뀔때마다 useEffecct 실행
  }, [count]);

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
      <div className="my-80">
        <div>Game Playing</div>
        <div className="flex flex-row justify-between items-center mt-10 mx-7">
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                코끼리
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">user 1</div>
            <div className="w-12 h-6 mt-1 rounded-md bg-[#9FDDFF]">{count}</div>
          </div>
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                아이언맨
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">user 2</div>
            <div className="w-3 h-5 rounded absolute top-12 left-12 bg-[#FF0000]"></div>
            <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
          </div>
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                토르
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">user 3</div>
            <div className="w-3 h-5 rounded absolute top-12 left-12 bg-[#FFFF00]"></div>
            <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
          </div>
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                ???
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">{"Me"}</div>
            <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
          </div>
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                권오흠
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">user 5</div>
            <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
          </div>
          <div className="flex flex-col items-center relative">
            <IconButton
              size="lg"
              className="items-center bg-light-btn dark:bg-dark-btn relative"
            >
              <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute">
                박진영
              </div>
              <FontAwesomeIcon icon={faUser} size="xl" />
            </IconButton>
            <div className="mt-2">user 6</div>
            <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
          </div>
        </div>
        <div className="m-auto mt-16 flex justify-center items-center relative">
          <div className="w-1/2 h-16 shadow-lg flex justify-center items-center rounded-lg bg-[#A072BC]">
            <div>user 1의 정답</div>
            <div className="ml-3 text-xl font-semibold text-white">
              {"코끼리"}
            </div>
          </div>
          <div className="absolute right-28">
            <FontAwesomeIcon className="" size="2xl" icon={faClock} />
            {count <= 5 ? (
              <div className="mt-2 text-xl animate-ping">{count}</div>
            ) : (
              <div className="mt-2 text-xl text-red-600">{count}</div>
            )}
          </div>
        </div>
        <div className="m-auto w-3/4 h-60 mt-10 overflow-y-scroll rounded-3xl shadow-xl flex flex-col p-5 tracking-wider bg-[#572991]">
          <div className="mt-1 flex flex-col items-start">
            <span>user 2</span>
            <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
              ㅇㅇ 사람아님
            </span>
          </div>
          <div className="mt-1 flex flex-col items-start">
            <span>user 3</span>
            <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
              근데 너도 사람 아니잖아
            </span>
          </div>
          <div className="mt-1 flex flex-col items-end">
            <span>Me</span>
            <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-btn dark:bg-dark-btn">
              헉
            </span>
          </div>
          <div className="mt-1 flex flex-col items-start">
            <span>user 5</span>
            <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
              ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ
            </span>
          </div>
          <div className="mt-1 flex flex-col items-start">
            <span>user 6</span>
            <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
              아니 게임을 하라고
            </span>
          </div>
        </div>
        <div className="m-auto w-3/4 h-40 mt-10 rounded-3xl text-xl shadow-xl flex justify-center items-center bg-[#572991]">
          이것은 사람인가요?
        </div>
        <div className="mt-10 flex flex-row justify-center algin-center">
          <IconButton size="md" className="mr-10">
            <FontAwesomeIcon icon={faGear} />
          </IconButton>
          <input
            className="w-3/4 rounded-2xl shadow-md pl-5"
            type="text"
          ></input>
        </div>
      </div>
      {openModal && <Modal onOpenModal={modalOnClick} />}
    </div>
  );
}

export default App;
