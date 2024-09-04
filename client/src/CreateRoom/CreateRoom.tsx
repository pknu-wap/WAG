import { useState } from "react";
import Button from "../components/button/Button";
import RadioButton from "../components/radioButton/RadioButton";
import FullLayout from "../components/layout/FullLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IRoomResponseInfo } from "../types/dto";
import Toast from "../components/toast/Toast";
import DropdownSelect from "../components/dropDown/DropDown";
import { Option } from "react-dropdown";
import SliderComponent from "../components/slider/Slider";
import { useRecoilState } from "recoil";
import { firstCategoryRecoil, timerCount, soundEffectStatus } from "../recoil/recoil";
import Wrapper from "../components/Wrapper";

function CreateRoom() {
  const [isPrivate, setIsPrivate] = useState<boolean | null>(false); //일단은 공개방을 default로
  const [nickName, setNickname] = useState<string>("");
  const [soundEffectStatusValue, ] = useRecoilState(soundEffectStatus);
  const navigate = useNavigate();

  // const radioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   //console.log(event.target.value);
  // };

  const handlePlaySound = () => {

    const playSound = () => {
      if (soundEffectStatusValue){
        const audio = new Audio('audio/button_click.mp3')  
        audio.play()
      }
      
    };
  
    playSound();
    
  };

  const createRoom = async () => {
    handlePlaySound();
    if (await nicknamePossibleClick()=== false){
      Toast({ message: "사용 불가한 닉네임입니다!", type: "warn" });
      return;
    }

    try {
      //console.log("11", isPrivate);
      const response = await axios.post<IRoomResponseInfo>(
        "https://wwwag-backend.co.kr/room/create",
        {
          privateRoom: isPrivate,
          userNickName: nickName,
          category: selectedOption,
          timer: sliderValue,
        }
      );

      const roomId = response.data.roomId;
      localStorage.setItem("nickName", nickName ?? "");
      localStorage.setItem("roomId", roomId.toString());
      // socketConnect();
      const newResponse = {
        isPrivateRoom: response.data.privateRoom,
        userNickName: nickName,
        isCaptin: true,
        roomId: roomId,
      };

      navigate(`/ReadyToGame/${roomId}`, { state: newResponse });
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };

  // 카테고리 select
  const [, setFirstCategory] = useRecoilState(firstCategoryRecoil)
  const [selectedOption, setSelectedOption] = useState<string>("전체");
  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option.value);
    setFirstCategory(option.value)
    //console.log('Selected option:', option.value);
  };

  // 타이머 세팅
  const [sliderValue, setSliderValue] = useState(30);
  const [, setTimerRecoil] = useRecoilState(timerCount)

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    setTimerRecoil(value)
  };

  const renderButton = () => {
    if (isPrivate === null) {
      return <p>방 공개 / 비공개 여부를 선택해주십시오</p>; //체크가 안된 상태를 defult로 만들 수도 있음
    } else if (isPrivate === false) {
      return (
        <Button size="lg" onClick={createRoom}>
          공개방 생성
        </Button>
      );  
    } else {
      return (
        <Button size="lg" onClick={createRoom}>
          비공개방 생성
        </Button>
      );
    }
  };

  const nicknamePossibleClick = async () => {
    if (nickName === "" || nickName.includes(" ") || nickName.length > 9) {
      return false;
    }
    return true;

  };

  return (
    <Wrapper>
    <FullLayout>
      <div className="p-4">
        <div className="justify-center text-6xl mb-20">방 만들기</div>
        <div className="rounded-xl font-extrabold min-w-44 ">
          방 공개 / 비공개 여부 선택
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-5 mb-8 gap-2">
          <RadioButton
            id="public"
            label="공개"
            value="false"
            name="roomType"
            onChange={() => setIsPrivate(false)}
            checked={isPrivate === false}
          />
          <RadioButton
            id="private"
            label="비공개"
            value="true"
            name="roomType"
            onChange={() => setIsPrivate(true)}
          />
        </div>
        <div className="mb-8">
          <div className="rounded-xl font-extrabold min-w-44 mb-3">게임 카테고리 설정</div>
          <DropdownSelect onOptionSelect={handleOptionSelect} defaultValue="전체" />
        </div>
        <div>
          <div className="rounded-xl font-extrabold min-w-44 mb-3">턴 당 진행시간</div>
          <SliderComponent value={sliderValue} onChange={handleSliderChange} />
        </div>
        <input
          className="relative z-10 w-3/4 h-12 mb-5 mt-5 rounded shadow-md pl-5 text-[#000000]"
          type="error"
          required
          placeholder={"닉네임을 입력해주세요"}
          onChange={(e) => {
            setNickname(e.target.value);
          }}
          onKeyDown={async (e) => {
            if (e.nativeEvent.isComposing) return ;
            if (e.key === "Enter" && nickName?.trim() !== "") {
              createRoom()  
            } else if (e.key === "Enter" && nickName?.trim() === "") {
              Toast({ message: "사용 불가한 닉네임입니다!", type: "warn" });
            }
          }}
        ></input>

        <div className="mt-12">{renderButton()}</div>
      </div>
    </FullLayout>
    </Wrapper>
  );
}

export default CreateRoom;
