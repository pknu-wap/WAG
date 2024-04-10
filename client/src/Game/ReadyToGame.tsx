import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../components/button/IconButton";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import FullLayout from "../components/layout/FullLayout";

const ReadyToGame = () => {
  return (
    <FullLayout>
      <div className="flex flex-row justify-between items-center mt-10 mx-7">
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 1</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 2</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 3</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
        <div className="flex flex-col items-center relative">
          <IconButton
            size="lg"
            className="items-center bg-light-btn dark:bg-dark-btn relative"
          >
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
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
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
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
            <div className="w-20 h-6 rounded-md text-xs bg-[#C55959] shadow-xl flex justify-center items-center bottom-12 absolute"></div>
            <FontAwesomeIcon icon={faUser} size="xl" />
          </IconButton>
          <div className="mt-2">user 6</div>
          <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
        </div>
      </div>
      <div className="m-auto mt-16 flex justify-center items-center relative">
        <div className="w-1/2 h-16 shadow-lg flex justify-center items-center rounded-lg bg-[#A072BC]">
          <div>Ready To Game</div>
        </div>
      </div>
      <div className="m-auto w-3/4 h-96 mt-10 overflow-y-scroll rounded-3xl shadow-xl flex flex-col p-5 tracking-wider bg-[#572991]">
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 2</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
            ㅇㅇ 사람아님
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 3</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
            근데 너도 사람 아니잖아
          </span>
        </div>
        <div className="mt-1 flex flex-col items-end">
          <span className="text-[#ffffff]">Me</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tr-none bg-light-btn dark:bg-dark-btn">
            헉
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 5</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
            ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ
          </span>
        </div>
        <div className="mt-1 flex flex-col items-start">
          <span className="text-[#ffffff]">user 6</span>
          <span className="w-auto h-auto px-4 rounded-lg rounded-tl-none bg-light-btn dark:bg-dark-btn">
            아니 게임을 하라고
          </span>
        </div>
      </div>

      <div className="mt-10 flex flex-row justify-center algin-center">
        <IconButton size="md" className="mr-10">
          <FontAwesomeIcon icon={faGear} />
        </IconButton>
        <input
          className="w-3/4 rounded-2xl shadow-md pl-5 text-[#000000]"
          type="text"
        ></input>
      </div>
    </FullLayout>
  );
};

export default ReadyToGame;
