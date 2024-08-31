import IconButton from "../components/button/IconButton";
import FullLayout from "../components/layout/FullLayout";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  captainReadyToGameModalState,
  ingameTimerCount,
  loadingModalState,
  readyToGameModalState,
  timerCount,
} from "../recoil/recoil";
import { useEffect, useState, useRef } from "react";
import ReadyToGameModal from "../components/modal/ReadyModal";
import Button from "../components/button/Button";
import axios from "axios";
import {
  ChatMessage,
  GameUserDto,
  INicknamePossible,
  IRoomResponseInfo,
  IUserDto,
  URL,
  UserAnswerDto,
  AnswerUserDto,
} from "../types/dto";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ChatRoom from "../components/chatRoom/ChatRoom";
import CaptainReatyToModal from "../components/modal/CaptainReadyModal";
import LoadingModal from "../components/modal/LoadingModal";
import RadioButton from "../components/radioButton/RadioButton";
import Toast from "../components/toast/Toast";
import { history } from "../util/history";
import JoinUser from "../components/ingameComponents/JoinUser";
import Timer from "./timer/Timer";
import useTimer, { TimerHookProps } from './timer/useTimer';
import { Realistic } from "../components/party/Realistic";
import RankingUser from "../components/ingameComponents/RankingUser";
import DropdownSelect from "../components/dropDown/DropDown";
import { Option } from "react-dropdown";
import ReadyStartButton from "./RedayStartButton";
import SliderComponent from "../components/slider/Slider";
import Wrapper from "../components/Wrapper";
import {motion} from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

var stompClient: any = null; //웹소켓 변수 선언

const ReadyToGame = () => {
  const params = useParams(); // params를 상수에 할당
  const [, setIsOpen] = useRecoilState(readyToGameModalState);
  const [, setCaptainIsOpen] = useRecoilState(captainReadyToGameModalState);
  const [, setLoadingIsOpen] = useRecoilState(loadingModalState);
  const [nickname, setNickname] = useState<string>("");
  const [beforeNickname, setBeforeNickname] = useState("")
  const [possible, setPossible] = useState<boolean>();
  const [myChatMessages, setMyChatMessages] = useState<string>("");
  const [changeIsPrivate, setChangeIsPrivate] = useState<boolean>(); // 대기방 방장 모달 내 바꾸는 여부
  const [isNicknameChecked, setIsNicknameChecked] = useState(false); //닉네임 검사를 했는지 안했는 지 여부
  const [isLoading, setIsLoading] = useState(false); //닉네임 검사중인지

  // 방 정보 관리
  const [enterCode, setEnterCode] = useState<number>();
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>();
  const [isMeCaptain, setIsMeCaptain] = useState(false);
  const [category, setCategory] = useState("")
  const [userCount, setUserCount] = useState(0)
  const [isGameEnd, setIsGameEnd] = useState(false)

  const location = useLocation();
  const navigate = useNavigate();
  const roomInfo = { ...location.state };
  
  const [width, setWidth] = useState<number>(window.innerWidth); 
  const sliderRef = useRef<Slider>(null);


 const handleResize = () => {
  setWidth(window.innerWidth);
 };

  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);

  };
  const captainCloseModal = () => {
    setCaptainIsOpen(false);
  };
  const captainOpenModal = () => {
    setCaptainIsOpen(true);
  };

  const loadingCloseModal = () => {
    setLoadingIsOpen(false)
  }

  const loadingOpenModal = () => {
    setLoadingIsOpen(true)
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 채팅 데이터 상태
  const [readyMessage, setReadyMessage] = useState<any[]>([]) // 레디 상태
  const [joinUsers, setJoinUsers] = useState<IUserDto[]>([]); // 입장 유저
  const [gameUserDtos, setGameUserDtos] = useState<GameUserDto[]>([]); // 게임 중 유저 dto
  const [isReady, setIsReady] = useState<boolean>(false); //준비상태인지 아닌지
  const [myState, setMyState] = useState({
    isHost: isMeCaptain, // isMeCaptain 상태를 사용하여 초기값 설정
    isReady: isReady,
  });
  const [allReady, setAllReady] = useState(false);

  //게임 중
  const [countdown, setCountdown] = useState<number | null>(null); //게임 시작전 초대기
  const [gameStart, setgameStart] = useState(false); //방장이 게임시작 눌렀는지
  const [isCORRECTMode, setIsCORRECTMode] = useState(false); //정답 입력 <-> 채팅 입력 버튼 클릭 시의 입력창 변경

  const nextTurnUserRef = useRef<any>(null);  //다음턴 사람을 받아와서 저장해둔다.
  const [isMyTurn, setIsMyTurn] = useState(false);
  const gameCycleRef = useRef<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [hasSentCorrect, setHasSentCorrect] = useState(false);  //정답을 외쳤는지 
  const [hasSentAsk, setHasSentAsk] = useState(false);  //질문을 했는지 

  const answerListRef = useRef<any>(null); //정답어 리스트가 도착하면 상태를 바꾸어줌
  const currentAnswerRef = useRef<any>(null); 
  const [currentUserAnswer, setCurrentUserAnswer] = useState<AnswerUserDto>(); //다음 유저의 정보를 바탕으로 정답어 받아놓기

  const [currentUserNickName, setCurrentUserNickName] = useState<string>("")
  const [currentUserIndex, setCurrentUserIndex] = useState<number>();

  const [, setIsLocationLoading] = useState<boolean>(false);

  //boolean값으로 한번만 뜨게 새로고침 이후에 안뜨게
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    if ("isCaptin" in roomInfo) {
      if (roomInfo.isCaptin === true) {
        console.log("Captain is in");
        socketConnect();
        setSelectedOption(category)
        roomInfo.isCaptin = false;
        console.log("roomInfo : ", roomInfo)
      }
    } else {
      if (roomInfo.userCount === 1) {
      } else {
        openModal();
        console.log("roomInfo : ", roomInfo)
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    // ... (기존 useEffect 로직)
    setMyState({ isHost: isMeCaptain, isReady: isReady }); // 상태 업데이트
  }, [isMeCaptain, isReady]); // isMeCaptain, isReady 변경 시 상태 업데이트
  // useEffect(() => {
  //   setNickname()
  // }, [nickname])

  //빠른 입장으로 roomid받기
  // const nicknameParams = {
  //   roomId: Number(params.roomId),
  //   nickname: nickname,
  // };

  //닉네임 확인 이후에 닉네임 변경을 하면 다시 setIsNicknameChecked을 초기화 해주는 useEffect
  useEffect(() => {
    setIsNicknameChecked(false);
    setPossible(undefined);
  }, [nickname]);

  const nicknamePossibleClickRenderButton = () => {
    if (nickname === beforeNickname) {
      return (
        <Button className ="mt-3 m-auto flex justify-center items-center" size="sm" disabled={false} onClick={nicknamePossibleClick}>
          닉네임 확인
        </Button>
      )
    } else {
      return (
        <Button className ="mt-3 m-auto flex justify-center items-center" size="sm" disabled={false} onClick={nicknamePossibleClick}>
          닉네임 확인
        </Button>
      )
    }
  }

  // 닉네임 유효한지 api get
  const getNicknamePossible = async () => {
    try {
      const response = await axios.get<INicknamePossible>(
        "https://wwwag-backend.co.kr/nickname/possible",
        {
          params: {
            roomId: Number(params.roomId),
            nickname: nickname,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("랜덤 입장 요청 중 오류 발생:", error);
      throw error;
    }
  };


  const handlePlaySound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/button_click.mp3')  
      audio.play()
    };
  
    playSound();
  };

  const handleCorrectSound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/correct_answer2.mp3')  
      audio.play()
    };
  
    playSound();

  };

  const handleWrongSound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/blip03.mp3')  
      audio.play()
    };
  
    playSound();
  };

  const handleQuestionSound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/question.mp3')  
      audio.play()
    };
  
    playSound();
    
  };

  const handlePartySound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/yay.mp3')  
      const audioFire = new Audio('/audio/fireworkblast.mp3')  
      audio.play()
      audioFire.play()
    };
  
    playSound();
  };

  const handleBooSound = () => {
    const playSound = () => {
      const audio = new Audio('/audio/fail.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
  
    playSound();
  }

  const handleStartSound = () => {
    
    const playSound = () => {
      const audio = new Audio('/audio/start.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
  
    playSound();
  }

  const handleGameStartSound = () => {
    
    const playSound = () => {
      const audio = new Audio('/audio/startGame.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
  
    playSound();
  }

  const handleWarningSound = () => {

    const playSound = () => {
      const audio = new Audio('/audio/warning.mp3'); // 새로운 audio 요소 생성
      audio.play(); // 소리를 재생합니다.
    };
  
    playSound();
  }

  const nicknamePossibleClick = async () => {
    handlePlaySound();
    setIsNicknameChecked(true);
    setIsLoading(true);
  
    if (nickname === "" || nickname.includes(" ") || nickname.length > 9) {
      setPossible(false);
      setIsLoading(false);
      return;
    }
  
    try {
      const data = await getNicknamePossible();
      setPossible(data.possible);
      setBeforeNickname(nickname)
      localStorage.setItem("nickName", data.nickName);
    } catch (error) {
      console.error("닉네임 확인 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // const nicknamePossibleClick = async () => {
  //   setIsNicknameChecked(true);
  //   if (nickname === "" || nickname.includes(" ")) {
  //     console.log("error with blank");
  //     setPossible(false);
  //     return;
  //   }

  //   const data = await getNicknamePossible();
  //   setPossible(data.possible);
  //   localStorage.setItem("nickName", data.nickName);
  // };

  // 방 정보 get api
  const getRoomInfo = async () => {
    try {
      const response = await axios.get<IRoomResponseInfo>(
        "https://wwwag-backend.co.kr/room/info",
        {
          params: {
            roomId: Number(params.roomId),
          },
        }
      );
      console.log("방 정보 get api : ", response.data)
      setUserCount(response.data.userCount)
      return response.data;
    } catch (error) {
      console.error("방 정보 get api 오류 발생 : ", error);
      throw error;
    }
  };

  // 방 정보 업데이트
  const setRoomInfo = async () => {
    const roomInfo = await getRoomInfo();
    setEnterCode(roomInfo.roomEnterCode);
    setIsPrivateRoom(roomInfo.privateRoom);
    setChangeIsPrivate(roomInfo.privateRoom);
    setCategory(roomInfo.category);
    setIngameTimerRecoil(roomInfo.timer)
    let userDtos = roomInfo.userDtos;
    setReadyMessage(userDtos);
    userDtos.forEach((dto) => {
      const nickName = localStorage.getItem("nickName");
      if (dto.captain && dto.roomNickname === nickName) setIsMeCaptain(true);
    });
  };

  //웹소켓 만들기
  const socketConnect = () => {
    const socket = new SockJS(URL);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected);
  };

  //STOMP 소켓 구독 및 JOIN으로 입장
  async function onConnected() {
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
    console.log("roomId: ", roomId, "nickName: ", nickName);
    stompClient.subscribe(`/topic/public/${roomId}`, onMessageReceived);
    sendMessageToSocket("/app/chat.addUser", "JOIN");
  }

  //드가자 버튼 클릭시
  const handleGoIn = async () => {
    handlePlaySound();
    socketConnect();
    closeModal();
  };

  //게임중 채팅메세지 MessageType에 따라 소켓에 객체를 전달하는 함수  -- 매개변수 : 소켓 URL, messageType
  function sendMessageToSocket(socketURL: string, messageType: string) {
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
    let contentToSend = myChatMessages; // 기본적으로 myChatMessages 값을 사용합니다. 
    // messageType이 'JOIN', 'START', 'CHANGE' 중 하나라면, contentToSend를 빈 문자열로 보냄
    if (["JOIN", "START", "CHANGE", "RESET", "READY"].includes(messageType)) {
      contentToSend = "";
    } else if (messageType === "CATEGORY") {
      // nickname은 방장 이름으로만 send
      contentToSend = selectedOption;
    } else if (messageType === "TIMER") {
      // nickname은 방장 이름으로만 send
      contentToSend = sliderValue.toString()
      console.log(sliderValue)
    }
    console.log(contentToSend, messageType)
    
    stompClient.send(
      socketURL,
      {},
      JSON.stringify({
        sender: nickName,
        content: contentToSend,
        messageType: messageType,
        roomId: roomId,
      })
    );
    setMyChatMessages(""); // 채팅입력필드 초기화를 위해 필요
  }

  //대기방 채팅, 게임중 질문, 답변, 정답 입력 4가지를 조건에 따라 전달하는 함수  -> 답변은 나중에 추가해야함
  function sendMessage() {
    if (gameStart) {
      if (isMyTurn) { 
        if (isCORRECTMode && !hasSentCorrect) 
          { // CORRECT 메시지 전송 여부 확인
          sendMessageToSocket("/app/chat.sendGameMessage", "CORRECT");
          setHasSentCorrect(true); // 전송 후 상태 업데이트
        } else if (!isCORRECTMode && !hasSentAsk) 
          { // ASK 메시지 전송 여부 확인
            handleQuestionSound();
          sendMessageToSocket("/app/chat.sendGameMessage", "ASK");
          setHasSentAsk(true); // 전송 후 상태 업데이트
        } 
        else {
          Toast({ message: "기회를 모두 소진했습니다!", type: "error" });
        }
      } else {
        sendMessageToSocket("/app/chat.sendGameMessage", "ANSWER");
      }
    } else {
      sendMessageToSocket("/app/chat.sendMessage", "CHAT");
    }
  }
  //구독된 방에서 받아오는 모든 메세지 처리 부분
  function onMessageReceived(payload: any) {
    var message = JSON.parse(payload.body);
    receiveChatMessage(message);
    if (message.messageType === "JOIN") {
      //addJoinUser();
      setJoinUsers(message.roomResponse.userDtos);
      setRoomInfo();
      setReadyMessage(message.roomResponse.userDtos);
      setAllReady(false) // 유저 추가입장 시 게임시작 버튼 비활성화
      console.log(message.sender + " joined!");
      console.log("JOIN 즉시 userCount : ", userCount)
      getAllReady(message); //레디상태 재검사
      console.log("JOIN으로 온 메세지", message);
    } else if (message.messageType === "LEAVE") {
      //addJoinUser();
      setJoinUsers(message.roomResponse.userDtos);
      setRoomInfo();
      getAllReady(message); //레디상태 재검사
      console.log("LEAVE 즉시 userCount : ", userCount)
      console.log("LEAVE으로 온 메세지", message);
    } else if (message.messageType === "CHAT") {
      console.log("CHAT으로 온 메세지", message);
      setRoomInfo();
    } else if (message.messageType === "CATEGORY") {
      console.log("CATEGORY로 온 메세지", message);
      setCategory(message.content)
    } else if (message.messageType === "TIMER") {
      console.log("TIMER로 온 메세지", message);
      setIngameTimerRecoil(parseInt(message.content))
    }
    else if (message.messageType === "CHANGE") {
      console.log("CHANGE로 온 메세지", message);
      setRoomInfo();
      Toast({ message: message.privateRoom ? '방이 비공개로 설정되었습니다.' : '방이 공개로 설정되었습니다.', type: 'info' });
    } else if (message.messageType === "ASK") {
      console.log("ASK로 온 메세지", message);
      getGameCycle(message);
      getNextTurnInfo(message);
    } else if (message.messageType === "ANSWER") {
      console.log("ANSWER로 온 메세지", message);
    } else if (message.messageType === "CORRECT") {
      handleCorrectAnswer(message);
      setGameUserDtos(message.gameUserDtos);
      console.log("CORRECT로 온 메세지", message);
    } else if(message.messageType === "READY"){
      console.log("READY로 온 메세지", message);
      setRoomInfo();
      setReadyMessage(message.userDtos)
      getAllReady(message);
    } else if (message.messageType === "START") {
      handleStartSound();
      console.log("START로 온 메세지", message);
      setCountdown(5);
      getGameAnswer();
      // API 응답을 받은 후에 5초를 기다립니다.
      setTimeout(() => {
        getGameCycle(message);
        getNextTurnInfo(message);
        setgameStart(true);
        GameLogic(); // 5초 후에 GameLogic 실행
      }, 5000);
    } else if (message.messageType === "PENALTY") {
      setGameUserDtos(message.gameUserDtos);
      console.log("PENALTY로 온 메세지", message);
    } else if(message.messageType === "END"){
      stopTimer();
      handleCorrectSound();
      Toast({ message: "게임이 끝났습니다!", type: "success" });
      setGameUserDtos(message.gameUserDtos);
      setTimeout(() => {
        setIsGameEnd(true)
      }, 5000);
      console.log("END로 온 메세지", message);
    } else if (message.messageType === "RESET") {
      stopTimer();
      resetTimer();
      handleTimerEnd();
      setIsCORRECTMode(false)
      console.log("RESET으로 온 메세지", message);
  }
    else {
      console.log(message);
    }
  }

  const receiveChatMessage = (message: ChatMessage) => {
    setChatMessages([...chatMessages, message]); // 채팅 데이터 상태 업데이트
  };

  // 대기방 방장 모달 공개/비공개 바꾸는 소켓
  const privateModeOnclick = () => {
    handlePlaySound();
    sendMessageToSocket("/app/chat.changeMode", "CHANGE");
    if (isPrivateRoom) {
      // 공개 방으로 변경
      setChangeIsPrivate(false);
    }
    // 바꾸기 전 공개 방일 때
    else {
      // 비공개 방으로 변경
      setChangeIsPrivate(true);
    }
    setIsPrivateRoom(changeIsPrivate);
    console.log("방 설정 바꾸기 완료, isPrivate : ", isPrivateRoom);
  };

  // 대기방 방장 모달 공개/비공개 바꾸는 버튼
  const renderButton = () => {
    if (isPrivateRoom === false) {
      // 공개방일 때
      return (
        // 바꾸고자 하는 값(changeIsPrivate) = true(공개로 변경하고 싶음) 일 때 활성화
        <Button
          size="sm"
          onClick={privateModeOnclick}
          disabled={changeIsPrivate === false}
        >
          비공개방으로 변경
        </Button>
      );
    } else {
      // 비공개방일 때
      return (
        // 바꾸고자 하는 값(changeIsPrivate) = false(공개로 변경하고 싶음) 일 때 활성화
        <Button
          size="sm"
          onClick={privateModeOnclick}
          disabled={changeIsPrivate === true}
        >
          공개방으로 변경
        </Button>
      );
    }
  };

  // 카테고리 select
  const [selectedOption, setSelectedOption] = useState<string>(category);
  const [beforeCategory, setBeforeCategory] = useState(selectedOption)
  const [count, setCount] = useState(1)
  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option.value);
    console.log('Selected option:', option.value);
  };
  const sendCategoryOnClick = () => {
    handlePlaySound();
    if (category === selectedOption) {
      Toast({ message: "기존 카테고리 입니다!", type: "warn" });
    } else {
      sendMessageToSocket("/app/chat.setCategory", "CATEGORY")
      setCount((v) => v + 1)
      setBeforeCategory(selectedOption)
    }
    captainCloseModal(); //모달 닫기
  }

  // 타이머 세팅
  const [timerRecoil, ] = useRecoilState(timerCount) // 방 만들기에서 가져온 recoil
  const [sliderValue, setSliderValue] = useState(timerRecoil); // 슬라이더 변경 값
  const [ingameTimerRecoil, setIngameTimerRecoil] = useRecoilState(ingameTimerCount) // 게임 중 타이메 recoil

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  const sendSliderChange = () => {
    handlePlaySound();
    sendMessageToSocket("/app/chat.setTimer", "TIMER")
    captainCloseModal(); //모달 닫기
  }

  // 새로고침 방지
  const usePreventRefresh = () => {
    const preventClose = (e: any) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // 브라우저에 렌더링 시 한 번만 실행하는 코드
    useEffect(() => {
      (() => {
        window.addEventListener("beforeunload", preventClose);
      })();

      return () => {
        window.removeEventListener("beforeunload", preventClose);
      };
    });
  };
  usePreventRefresh();

  const { pathname } = useLocation();
  useEffect(() => {
    if (enterCode) {
      const unlistenHistoryEvent = history.listen(({ action }) => {
        if (action !== "POP") return;
        history.push(pathname);
      });
      console.log("entercode 존재");
      return unlistenHistoryEvent;
    } else {
      console.log("entercode 존재x");
    }
  }, [enterCode]);

  function socketPenaltyOnClick(recipient: string) {
    handleWarningSound();
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
        stompClient.send(
      "/app/chat.sendGameMessage",
      {},
      JSON.stringify({
        sender: nickName,
        content: recipient,
        messageType: "PENALTY",
        roomId: roomId,
      })
    );
  }

  const ClickReady = () => {
    setIsReady(isReady => !isReady);
    sendMessageToSocket("/app/chat.ready", "READY");
    handlePlaySound();
    if(isReady)
      Toast({ message: "준비 취소 ❌", type: "error" });
    else
      Toast({ message: "준비 완료 ✅", type: "success" });
  }


  const getAllReady = async (message : any) => {

    // message.userDtos가 정의되지 않았을 경우 빈 배열로 처리
    if (message.messageType === "JOIN" || message.messageType === "LEAVE") {
      const userDtos = message.roomResponse.userDtos;
      // userDtos가 배열인지 확인하여 필터링
      const readyUsersCount = Array.isArray(userDtos) ? userDtos.filter((user: any) => user.ready).length : 0;
      const totalUsersCount = Array.isArray(userDtos) ? userDtos.length : 0;

      // 최소 두 명 이상의 사용자가 전체 준비 상태인지 확인합니다.
      if (totalUsersCount > 1 && readyUsersCount === totalUsersCount) {
        Toast({ message: "모든 사용자 게임 준비 완료", type: "success" });
        setAllReady(true);
      } else {
        setAllReady(false); // 그렇지 않으면 전체 준비 상태를 false로 설정합니다.
      }
    } else if (message.messageType === "READY") {
      const userDtos = message.userDtos;
      // userDtos가 배열인지 확인하여 필터링
      const readyUsersCount = Array.isArray(userDtos) ? userDtos.filter((user: any) => user.ready).length : 0;
      const totalUsersCount = Array.isArray(userDtos) ? userDtos.length : 0;

      // 최소 두 명 이상의 사용자가 전체 준비 상태인지 확인합니다.
      if (totalUsersCount > 1 && readyUsersCount === totalUsersCount) {
        Toast({ message: "모든 사용자 게임 준비 완료", type: "success" });
        setAllReady(true);
      } else {
        setAllReady(false); // 그렇지 않으면 전체 준비 상태를 false로 설정합니다.
      }
    }
  };
  const categoryChangeRenderButton = () => {
    if (category === selectedOption || selectedOption === beforeCategory) {
      return (
        <Button size="sm" disabled={true} onClick={sendCategoryOnClick}>카테고리 바꿀래?</Button>
      )
    } else {
      return (
        <Button size="sm" disabled={false} onClick={sendCategoryOnClick}>변경</Button>
      )
    }
  }
  const timerChangeRenderButton = () => {
    if (ingameTimerRecoil === sliderValue) {
      return (
        <Button size="sm" disabled={true} onClick={sendSliderChange}>시간 바꿀래?</Button>
      )
    } else {
      return (
        <Button size="sm" disabled={false} onClick={sendSliderChange}>변경</Button>
      )
    }
  }

  /*====================== 게임 중 코드 ====================== */

      const exitOnClick = () => {
        handlePlaySound();
        window.location.replace("/")
      };
      const {
        time,
        startTimer,
        stopTimer,
        resetTimer,
      }: TimerHookProps = useTimer();

      useEffect(() => {
        if (time === 5 && isMyTurn) { //질문을 30초 안에 하지 않는다면 강제로 턴을 넘긴다
            if(!hasSentAsk){
              const roomId = localStorage.getItem("roomId");
              const nickName = localStorage.getItem("nickName");
              handleQuestionSound();
              stompClient.send(
                "/app/chat.sendGameMessage",
                {},
                JSON.stringify({
                  sender: nickName,
                  content: "질문 시간이 종료되어 강제로 전송합니다.",
                  messageType: "ASK",
                  roomId: roomId,
                }));
            }
        }
        if(time < 0) {
          stopTimer();
          resetTimer();
          if(isMyTurn) //질문을 30초 안에 하지 않는다면 강제로 턴을 넘긴다
            sendMessageToSocket("/app/chat.sendGameMessage", "RESET"); 
          }
      }, [stopTimer, resetTimer, time]);

    
  //타이머 30초 종료 후 로직
  const handleTimerEnd = () => {
    handleGameStartSound();
    const nickname = localStorage.getItem("nickName");
    startTimer();
    setHasSentCorrect(false); // 턴이 끝나면 다시 보낼 수 있도록 초기화
    setHasSentAsk(false);    // 턴이 끝나면 다시 보낼 수 있도록 초기화
    const nextUserNickname = nextTurnUserRef.current?.roomNickname;// 다음 턴 유저 정보 업데이트
    setIsMyTurn(nextUserNickname === nickname); //다음턴이 나라면 isMyTurn
    setCurrentUserAnswer(currentAnswerRef.current); //다음 턴 유저의 정답어를 화면에 띄운다.
    if (gameCycleRef.current !== currentCycle) { // 사이클 수가 바뀌었다면 게임턴수 재랜더링
      setCurrentCycle(gameCycleRef.current);
    }
    if(nextUserNickname === nickname)
    {
      Toast({ message: '당신은 질문자입니다.', type: 'info' });
    }
    else
    {
      Toast({ message: '당신은 답변자입니다.', type: 'info' });
    }
    setChatMessages([]);
  };

  //정답자 처리 함수

  function handleCorrectAnswer(message:any) {
    const sender = message.sender;
    const gameUserDtos = message.gameUserDtos;
    const senderIndex = gameUserDtos.findIndex((user:any) => user.roomNickname === sender);
    const myName = localStorage.getItem("nickName");
    
    if (senderIndex !== -1) {
      if(gameUserDtos[senderIndex].ranking !== 0){
        handleCorrectSound();
        Toast({ message: `${sender}가 정답을 맞추었습니다!`, type: 'success' });
        if(!hasSentAsk){
          console.log("질문하지 않았을 때")
          stompClient.send(
            "/app/chat.sendGameMessage",
            {},
            JSON.stringify({
              sender: sender,
              content: "정답이다!!",
              messageType: "ASK",
              roomId: localStorage.getItem("roomId"),
            }));
        }
        stopTimer(); // 타이머 멈춤
        setTimeout(() => {
          if (sender === myName) {
            sendMessageToSocket("/app/chat.sendGameMessage", "RESET");
          }
        }, 5000);
      }
      else{
        handleWrongSound();
        Toast({ message: `${sender}가 정답을 맞추지 못했습니다!`, type: 'info' });
      }

    }
  }
    
    //게임시작 버튼 클릭 이벤트
  const clickGameStart = () => {
    handlePlaySound();
    if(joinUsers.length > 1 && joinUsers.length === userCount)
    {
      captainCloseModal(); //모달 닫기
      sendMessageToSocket("/app/chat.sendGameMessage", "START");  //소켓에 START로 보냄
    }
    else Toast({ message: '2명 이상 모여야 게임 시작 가능!', type: 'error' });
  };

  // 정답 입력 모드로 전환하는 함수
  const switchToCORRECT = () => {
    handlePlaySound();
    if(currentCycle === 1)
      {
        Toast({ message: '정답 맞추기는 2라운드부터!', type: 'error' });
        return;
      }
      setIsCORRECTMode(true);
    };
    
  // 채팅 모드로 전환하는 함수
  const switchToASK = () => {
    handlePlaySound();
    setIsCORRECTMode(false);
  };

  //게임중 작동 함수를 넣는 함수
  const GameLogic = async () => { // async 추가ㅌ
    Toast({ message: "게임을 시작합니다!", type: "success" });
      handleTimerEnd(); 
  };

  // 게임 사이클의 정보를 받아와서 UseRef에 저장합니다.
  const getGameCycle = (socketMessage: any) => {
    const cycle = socketMessage.cycle;
    gameCycleRef.current = cycle;
  };
      
  // 다음 턴의 정보를 받아와서 UseRef에 저장합니다.
  const getNextTurnInfo = (socketMessage: any) => {
    const nextTurnUser = socketMessage.gameUserDtos.find((user: any) => user.nextTurn === true);
    if (!nextTurnUser) {
      console.log("다음 턴 유저 정보를 찾을 수 없습니다.");
      return; // 반환 값 없이 함수 종료
    }
    nextTurnUserRef.current = nextTurnUser; // nextTurnUserRef에 다음 턴 유저 정보 저장
    const answerUserDtos = answerListRef.current.answerUserDtos; 
    currentAnswerRef.current = answerUserDtos.find(
      (user: any) => user.nickname === nextTurnUser.roomNickname
    );
  }

  //사용자 턴에 따라 질문 <-> 답변 버튼을 보여준다.
  function GameActionButton({ isMyTurn, isAnswerMode }: { isMyTurn: boolean; isAnswerMode: boolean }) {
    if (!gameStart) { // 게임 시작 전에는 버튼 숨김
      return null;
    }
  
    if (isMyTurn) { // 질문자의 경우
      if (isAnswerMode) {
        return <Button size="sm" className="mr-10" onClick={switchToASK}>질문 하기</Button>;
      } else {
        return <Button size="sm" className="mr-10" onClick={switchToCORRECT}>정답 맞추기</Button>;
      }
    } else { 
      return null; //답변자의 경우 버튼이 필요없음
    }
  }
      
  // 자기자신만 제외하고 정답어를 받아오는 api
  const getGameAnswer = async () => {
    const nickname = localStorage.getItem("nickName");
    try {
      const response = await axios.get<UserAnswerDto>(
        "https://wwwag-backend.co.kr/answer/list",
        {
          params: {
            roomId: Number(params.roomId),
            nickname
          },
        }
      );
      const answerList = response.data
      answerListRef.current = answerList;
      console.log("answerList : ", answerList)
      console.log("answerListRef.current : ", answerListRef.current)
      return response.data;
    } catch (error) {
      console.error("정답 리스트 get api 오류 발생 : ", error);
      throw error;
    }
  };
  useEffect(() => {
    if (gameStart) {
      getGameAnswer();
    }
  }, [currentCycle]);
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null); // 카운트다운 종료
    }
    return () => clearInterval(countdownInterval); // 컴포넌트 언마운트 시 setInterval 정리
  }, [countdown]);


   /*====================== 게임 결과 코드 ====================== */
   const [size, setSize] = useState(window.innerWidth);
   const [showConfetti, setShowConfetti] = useState(false);
   const [myRank, setMyRank] = useState<number>()
   const myName = localStorage.getItem("nickName");

   const haveParty = () => {
    gameUserDtos.forEach((user) => {
        if (user.roomNickname === myName) {
            setMyRank(user.ranking);
            if (user.ranking <= 3 && user.ranking !== 0) {
                handlePartySound();
                setShowConfetti(true);
            }
            else {
              handleBooSound();
            }
        }
    });
    }
    useEffect(() => {
      haveParty();
  }, [isGameEnd]);

  const restartOnClick = () => {
    handlePlaySound();
    setIsLocationLoading(true)
    loadingOpenModal()
    setTimeout( () => {
      setIsGameEnd(false);
      loadingCloseModal()
    }, 1000);

    setgameStart(false);
    setIsMyTurn(false);
    setIsReady(false);
    setAllReady(false);
    setIsCORRECTMode(false)
    setChatMessages([]);
    setGameUserDtos([]);
    setReadyMessage([]);
    setRoomInfo();
    setCurrentUserAnswer({
      nickname: "",
      answer: "",
    });
  }
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
          setSize(window.innerWidth);
      } else {
          setSize(1024)
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const LoadingSpinner = () => (
    <>
      <div className="banter-loader">
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
        <div className="banter-loader__box"></div>
      </div> 
      <div className="mt-60">
        이름들을 섞는 중이에요!
      </div>
      </>
  );

  useEffect(() => {
      const initialIndex = joinUsers.findIndex(user => user.roomNickname  === localStorage.getItem("nickName"));
      setCurrentUserIndex(initialIndex !== -1 ? initialIndex : 1);
    
  }, [joinUsers]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  
  return (
    <Wrapper>
    <FullLayout>
    <LoadingModal onRequestClose={loadingCloseModal}>
      <LoadingSpinner/>
    </LoadingModal>
    
      {isGameEnd ? (
      <div>
        <motion.div className="relative"
                    initial={{ scale: 0 }} // 초기 상태에서 원의 크기를 작게 설정
                    animate={{ scale: 1 }} // 애니메이션을 통해 원의 크기를 정상 크기로 설정
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20
                    }}>
          {/* Bottom section with purple semi-circle */}
          <div className="w-full h-[96px] absolute -top-[96px] bg-light-btn dark:bg-dark-btn"></div>
          <div 
            style={{
                width: '100%',
                height: `${size/2}px`,
                maxHeight: '1024px',
                clipPath: 'ellipse(50% 50% at 50% 0%)'
            }} 
            className="absolute text-white max-w-5xl bg-light-btn dark:bg-dark-btn overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center">
              {myRank !== 0 ? (
                <h1 className="text-[#ffffff] pt-0 sm:text-3xl text-2xl font-bold">{myRank}등</h1>
              ) : (
                <h1 className="text-[#ffffff] pt-0 sm:text-3xl text-2xl font-bold">순위권에 들지 못했습니다</h1>
              )}
              <p className="text-[#ffffff] text-xl">{myName}</p>
            </div>
          </div>
        </motion.div>
    
    
          {/* List of players */}
          <div style={{height: `${size/3}px`}}></div>
          <div className="m-auto w-3/4">
            {showConfetti && <div className="flex justify-center"><Realistic /></div>}
            {gameUserDtos.map((user, index) => {
                return (
                    <RankingUser 
                    key={index}
                    roomNickname={user.roomNickname} 
                    answer={user.answername} 
                    ranking={user.ranking}/>
                )
            })}
          </div>
          <div className="m-auto grid-cols-1 md:grid-cols-2 mt-5 gap-2">
            <Button className="mr-5 mb-5" size="sm" onClick={restartOnClick}>재시작하기</Button>
            <Button className="mr-5 mb-5" size="sm" onClick={exitOnClick}>메인페이지로 가기</Button>
          </div>
          

      </div>
      ) : (
      <div>
        <div className="flex flex-row justify-around items-center mt-5 mb-5 mx-7 ">
          {(width > 650 || joinUsers.length ===1) ? (<>
            {joinUsers.map((info, index) => {
              return (
                <div key={index} className="relative">
                  <JoinUser
                    Nickname={info.roomNickname}
                    isCaptain={info.captain}
                    isReady={readyMessage}
                    gameStart={gameStart}
                    className={""}
                    currentCycle={currentCycle}
                    gameUserDto={gameUserDtos}
                    whoseTurn={currentUserAnswer?.nickname}
                    children={
                      gameStart ? (
                        <div className={""}>
                          <Button size="sm"
                            onClick={() => { socketPenaltyOnClick(info.roomNickname); }}>
                            경고 주기
                          </Button>
                        </div> ) : ( <div></div> )}
                  />
                </div>
              );
            })}
            </>
          ) : (
            
            <div className="w-1/2 h-1/2 mb-5 mx-7">
  <Slider  ref={sliderRef} {...settings} initialSlide={currentUserIndex}>
    {joinUsers.map((info, index) => (
      
      <div key={index} className="relative">
        <JoinUser
          Nickname={info.roomNickname}
          isCaptain={info.captain}
          isReady={readyMessage}
          gameStart={gameStart}
          className={"mt-4"}
          currentCycle={currentCycle}
          gameUserDto={gameUserDtos}
          whoseTurn={currentUserAnswer?.nickname}
          children={
            gameStart ? (
              <div className={""}>
                <Button
                  size="sm"
                  onClick={() => {
                    socketPenaltyOnClick(info.roomNickname);
                  }}
                >
                  경고 주기
                </Button>
              </div>
            ) : (
              <div></div>
            )
          }
        />
      </div>
    ))}
  </Slider>
</div>
        )}
        </div>

        {gameStart&&(
        <div className="flex justify-center items-center">
          <Timer time={time} />
        </div>)
        }
        <div className="m-auto sm:mt-8 mt-4 flex justify-center items-center relative">
          {!gameStart &&(
            <div className="sm:mr-5 mr-3">
              <div className="text-base">입장코드</div>
              <div className="text-xl">{enterCode}</div>
            </div>
          )}
          {gameStart &&(
            <div className="sm:mr-5 mr-3">
              <div className="sm:text-base text-sm">현재</div>
              <div className="sm:text-base text-sm">라운드</div>
              <div className="sm:text-xl text-lg">{currentCycle}</div>
            </div>
          )}
          <div className="w-7/12 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
            {countdown !== null ? ( // 카운트다운 중일 때
              <div className="text-xl font-semibold">{countdown}</div>
            ) : gameStart ? ( // 게임 시작 후
              <div className="font-semibold">
                현재 질문자 : <span className="sm:text-xl text-base text-[#5b33de]"> {currentUserAnswer?.nickname}</span>
                <br />
                정답어 : <span className="sm:text-xl text-base text-[#c93290]"> {currentUserAnswer?.answer}</span>
              </div>
            ) : ( // 게임 시작 전
              <div>
                <div className="sm:text-xl text-base font-semibold">게임 대기 중</div>
                <div className="sm:text-xl text-base font-semibold">카테고리 : {category}</div>
              </div>
            )}
          </div>
          <div className="sm:ml-5 ml-3 sm:text-base text-sm">
            방 인원
            <div className="sm:text-lg text-base">{joinUsers.length}/6</div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative m-auto w-3/4 sm:h-[384px] h-[320px] sm:mt-10 mt-5 pb-1 overflow-y-hidden rounded-t-2xl pl-0 flex flex-col tracking-wider bg-[#A072BC] overflow-y-scroll scrollbar-custom">
            {chatMessages.map((m, index) => (
              <ChatRoom key={index} message={m} whoseTurn={currentUserAnswer?.nickname} />
            ))}
          </div>
            <div className="m-auto w-3/4 h-[53px] overflow-y-hidden rounded-b-2xl flex flex-col tracking-wider bg-[#A072BC] relative">
              <div className="w-full absolute bottom-1 px-1 flex juftify-center items-end">
                {(!gameStart && isMeCaptain) ? (
                  <IconButton size="md" className="" onClick={captainOpenModal} isInput={true}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </IconButton>
                ) : (<div></div>)}
                <textarea
                  className={`${isCORRECTMode && isMyTurn ? 
                    "w-full text-xs h-[42px] pt-[10px] pb-1 sm:text-base sm:h-[48px] rounded-2xl text-[#000000] border-[3px] border-[#FFA500]" 
                    : "text-xs h-[42px] pt-[10px] pb-1 sm:text-base sm:h-[48px] w-full rounded-2xl text-[#000000]"}`}
                  placeholder={
                    gameStart // gameStart가 true인 경우에만 조건부 렌더링
                      ? isMyTurn
                        ? isCORRECTMode
                          ? "정답을 입력하세요"
                          : "질문을 시작하세요" // isMyTurn이 true일 때
                        : "답변을 시작하세요" // isMyTurn이 false일 때
                      : "채팅 메시지를 입력해주세요" // gameStart가 false일 때
                  }
                  value={myChatMessages}
                  onKeyDown={(e) => {
                    if (e.nativeEvent.isComposing) return; 
                    if (e.key === "Enter" && !e.shiftKey) {  // Enter 키를 누를 때 Shift 키가 눌려있지 않은 경우
                      e.preventDefault();  // 기본 Enter 키 동작 방지 (줄 바꿈 방지)
                      if (myChatMessages.trim() !== "") {
                        sendMessage();
                      } else {
                        Toast({ message: "채팅 메시지를 입력해주세요!", type: "warn" });
                      }
                    }
                  }}
                  onChange={(e) => {
                    setMyChatMessages(e.target.value);
                  }}
                  rows={3}
                  style={{resize: 'none'}}
                />
                <IconButton
                  className="right-0 bottom-0 absolute"
                  size="sm"
                  onClick={() => {  // onClick 핸들러 수정
                    if (myChatMessages.trim() !== "") { 
                      sendMessage();
                    } else {
                      Toast({ message: "채팅 메시지를 입력해주세요!", type: "warn" });
                    }
                  }}
                  isInput={true}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 text-[#000000]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </IconButton>
            </div>
          </div>
        </div>
        
        {countdown === null && !gameStart && (
          <div className="m-auto max-w-[700px] grid grid-cols-1 sm:grid-cols-2 mt-5">
        
          {width > 650 ? (
            <>
              <div className= "mr-5 mb-5"><Button size="md" disabled={false} onClick={exitOnClick} > 게임 나가기 </Button></div>  
              <div className="mr-5 mb-5">
              <ReadyStartButton
                myState={myState}
                allReady={allReady} // 모든 유저 준비 상태 확인
                handleStart={clickGameStart}
                handleReady={ClickReady}
              />
            </div>
            </>
          ) : (
            <>
              <div className="mr-5 mb-5">
              <ReadyStartButton
                myState={myState}
                allReady={allReady} // 모든 유저 준비 상태 확인
                handleStart={clickGameStart}
                handleReady={ClickReady}
              />
            </div>
            <div className= "mr-5 mb-5"><Button size="md" disabled={false} onClick={exitOnClick} > 게임 나가기 </Button></div>  
            </>
          )}

        </div>
        )}

        <div className="mt-5 flex flex-row justify-center algin-center">
          {gameStart && (<GameActionButton isMyTurn={isMyTurn} isAnswerMode={isCORRECTMode} />)}
        </div>
      </div>
      )}
      
      {/* 방장 제외 입장 시 닉네임 설정 모달 */}
      <ReadyToGameModal onRequestClose={closeModal}>
        <div className="flex flex-col justify-between">
          <div className="my-5 flex flex-row justify-between items-center">
            <div className="text-4xl">JOIN</div>
          </div>

          <input
            className="w-full h-12 mb-2 rounded shadow-md pl-5 text-[#000000]"
            type="error"
            required
            placeholder={"닉네임을 입력해주세요"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                nicknamePossibleClick();
              }
            }}
            onChange={(e) => {
              setNickname(e.target.value);
              setPossible(false);
            }}
          ></input>
          <div>
          {isLoading ? (
            <div>확인 중...</div>
          ) : (
            isNicknameChecked && (
              possible ? (
                <div className="text-[#33B3FF]">사용가능!</div>
              ) : (
                <div className="text-[#FF0000]">사용 불가한 닉네임입니다!</div>
              )
            )
          )}
          {!isNicknameChecked && (
            <div className="text-[#d98e0d]">닉네임을 검사해주세요!</div>
          )}
        </div>

          {nicknamePossibleClickRenderButton()}

          <div className="mt-3 m-auto flex justify-end items-end">
            {possible ? (
              <Button disabled={false} size="md" onClick={handleGoIn}>
                드가자
              </Button>
            ) : (
              <Button className="" disabled={true} size="md">
                아직 멀었다
              </Button>
            )}
            
          </div>

          <div className="mt-3 m-auto" onClick={() => {navigate(location.state?.from || "/")}}>딛자</div>
        </div>
      </ReadyToGameModal>

      {/* 방장 방 관리 모달 */}
      <CaptainReatyToModal onRequestClose={captainCloseModal}>
        <div> 
          <div className="text-xl font-bold mb-4">방장 기능</div>
          <div className="text-md">
            <span>현재 방 상태 : </span>
              {isPrivateRoom ? ( <span className="text-[#FF0000]">비공개방</span>) : ( <span className="text-[#33B3FF]">공개방</span>)}
          </div>
            {isMeCaptain ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-2">
                    <RadioButton id="public" label="공개" value="false" name="roomType" onChange={() => setChangeIsPrivate(false)}/>
                    <RadioButton id="private" label="비공개" value="true" name="roomType" onChange={() => setChangeIsPrivate(true)}/>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <div className="mt-5">{renderButton()}</div>
                <div>
              <div className="rounded-xl font-extrabold min-w-44 mb-3">게임 카테고리 설정</div>
              <div>
                <DropdownSelect onOptionSelect={handleOptionSelect} defaultValue={count === 1 ? category : selectedOption}/>
                {categoryChangeRenderButton()}
              </div>
            <div>
              <div className="rounded-xl font-extrabold min-w-44 mb-3">턴 당 진행시간</div>
              <SliderComponent value={sliderValue} onChange={handleSliderChange} />
              {timerChangeRenderButton()}
            </div>
            </div>
                </div>
              </div>
            ) : (
              <div className="m-auto flex flex-col justify-center items-center">
                <div className="text-md mt-5">나는 방장이 아니니깐 할 수 있는게 없어</div>
              </div>
            )}
        </div>
      </CaptainReatyToModal>
    </FullLayout>
    </Wrapper>
  );
};

export default ReadyToGame;
