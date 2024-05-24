import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../components/button/IconButton";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import FullLayout from "../components/layout/FullLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  captainReadyToGameModalState,
  readyToGameModalState,
} from "../recoil/modal";
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
import RadioButton from "../components/radioButton/RadioButton";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import Toast from "../components/toast/Toast";
import { history } from "../util/history";
import JoinUser from "../components/ingameComponents/JoinUser";
import Timer from "./timer/Timer";
import useTimer, { TimerHookProps } from './timer/useTimer';

var stompClient: any = null; //웹소켓 변수 선언

const ReadyToGame = () => {
  const navigate = useNavigate();
  const params = useParams(); // params를 상수에 할당
  const [, setIsOpen] = useRecoilState(readyToGameModalState);
  const [, setCaptainIsOpen] = useRecoilState(captainReadyToGameModalState);
  const [nickname, setNickname] = useState<string>("");
  const [possible, setPossible] = useState<boolean>();
  const [myChatMessages, setMyChatMessages] = useState<string>("");
  const [changeIsPrivate, setChangeIsPrivate] = useState<boolean>(); // 대기방 방장 모달 내 바꾸는 여부
  const [isNicknameChecked, setIsNicknameChecked] = useState(false); //닉네임 검사를 했는지 안했는 지 여부
  const [isLoading, setIsLoading] = useState(false); //닉네임 검사중인지

  // 방 정보 관리
  const [enterCode, setEnterCode] = useState<number>();
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>();
  const [isMeCaptain, setIsMeCaptain] = useState(false);
  const [userCount, setUserCount] = useState(0)
  const [isGameEnd, setIsGameEnd] = useState(false)

  const location = useLocation();
  const roomInfo = { ...location.state };
  
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // 채팅 데이터 상태
  const [joinUsers, setJoinUsers] = useState<IUserDto[]>([]); // 입장 유저
  const [gameUserDto, setGameUserDto] = useState<GameUserDto[]>([]);

  //게임 중
  const [countdown, setCountdown] = useState<number | null>(null); //게임 시작전 3초대기
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
  //boolean값으로 한번만 뜨게 새로고침 이후에 안뜨게
  useEffect(() => {
    if ("isCaptin" in roomInfo) {
      if (roomInfo.isCaptin === true) {
        console.log("Captain is in");
        socketConnect();
        roomInfo.isCaptin = false;
      }
    } else {
      if (roomInfo.userCount === 1) {
      } else {
        openModal();
      }
    }
  }, []);

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

  // 닉네임 유효한지 api get
  const getNicknamePossible = async () => {
    try {
      const response = await axios.get<INicknamePossible>(
        "http://wwwag-backend.co.kr/nickname/possible",
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

  const nicknamePossibleClick = async () => {
    setIsNicknameChecked(true);
    setIsLoading(true);
  
    if (nickname === "" || nickname.includes(" ")) {
      setPossible(false);
      setIsLoading(false);
      return;
    }
  
    try {
      const data = await getNicknamePossible();
      setPossible(data.possible);
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
        "http://wwwag-backend.co.kr/room/info",
        {
          params: {
            roomId: Number(params.roomId),
          },
        }
      );
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
    let userDtos = roomInfo.userDtos;
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
    socketConnect();
    closeModal();
  };

  //게임중 채팅메세지 MessageType에 따라 소켓에 객체를 전달하는 함수  -- 매개변수 : 소켓 URL, messageType
  function sendMessageToSocket(socketURL: string, messageType: string) {
    const roomId = localStorage.getItem("roomId");
    const nickName = localStorage.getItem("nickName");
    let contentToSend = myChatMessages; // 기본적으로 myChatMessages 값을 사용합니다. 
    // messageType이 'JOIN', 'START', 'CHANGE' 중 하나라면, contentToSend를 빈 문자열로 보냄
    if (["JOIN", "START", "CHANGE"].includes(messageType)) {
      contentToSend = "1";
    } 
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
      setUserCount(message.roomResponse.userDtos.length)
      console.log("JOIN으로 온 메세지", message);
      console.log(message.sender + " joined!");
    } else if (message.messageType === "LEAVE") {
      //addJoinUser();
      setJoinUsers(message.roomResponse.userDtos);
      setRoomInfo();
      console.log("LEAVE으로 온 메세지", message);
    } else if (message.messageType === "CHAT") {
      console.log("CHAT으로 온 메세지", message);
      setRoomInfo();
    } else if (message.messageType === "CHANGE") {
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
      setGameUserDto(message.gameUserDtos);
      console.log("CORRECT로 온 메세지", message);
    } else if (message.messageType === "START") {
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
      setGameUserDto(message.gameUserDtos);
      console.log("PENALTY로 온 메세지", message);
    } else if(message.messageType === "END"){
      stopTimer();
      Toast({ message: "게임이 끝났습니다!", type: "success" });
      setGameUserDto(message.gameUserDtos);
      setTimeout(() => {
        setIsGameEnd(true)
        const roomId = localStorage.getItem("roomId")
        navigate(`/Ranking/${roomId}`, { state: message }); 
      }, 5000);
      
      console.log("END로 온 메세지", message);
    } 
    else {
      console.log(message);
    }
  }

  // // 유저 입장 시 상단에 프로필 추가
  // const addJoinUser = (message: ChatMessageJoin) => {
  //   setJoinUsers(message.roomResponse.userDtos);
  // };

  const receiveChatMessage = (message: ChatMessage) => {
    setChatMessages([...chatMessages, message]); // 채팅 데이터 상태 업데이트
  };

  // 대기방 방장 모달 공개/비공개 바꾸는 소켓
  const privateModeOnclick = () => {
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
  /*====================== 게임 중 코드 ====================== */
      const exitOnClick = () => {
        navigate("/");
      };
      const {
        time,
        startTimer,
        stopTimer,
        resetTimer,
      }: TimerHookProps = useTimer();

      useEffect(() => {
        if (time < 0) {
          stopTimer();
          resetTimer();
          if(!hasSentAsk) //질문을 30초 안에 하지 않는다면 강제로 턴을 넘긴다
          {
            if(isMyTurn){
              const roomId = localStorage.getItem("roomId");
              const nickName = localStorage.getItem("nickName");
              stompClient.send(
                "/app/chat.sendGameMessage",
                {},
                JSON.stringify({
                  sender: nickName,
                  content: "",
                  messageType: "ASK",
                  roomId: roomId,
                }));
            }    
          }
          setTimeout(() => {  //잠깐 대기후 다음 진행 : 위 강제 ASK를 받고 나서 초기화 진행
            handleTimerEnd();
            setChatMessages([]);
          }, 500);
        }
      }, [stopTimer, resetTimer, time]);
    
      //타이머 30초 종료 후 로직
      const handleTimerEnd = () => {
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
    let currentAnswererIndex = 1; // 현재 정답자 인덱스

    function handleCorrectAnswer(message:any) {
      const sender = message.sender;
      const gameUserDtos = message.gameUserDtos;
      const senderIndex = gameUserDtos.findIndex((user:any) => user.roomNickname === sender);
      
      if (senderIndex !== -1) {
        gameUserDtos[senderIndex].ranking = currentAnswererIndex; // 1부터 시작
        Toast({ message: `${sender}가 정답을 맞추었습니다!`, type: 'success' });
        currentAnswererIndex++;
      }
    }
    
    //게임시작 버튼 클릭 이벤트
  const clickGameStart = () => {
    if(joinUsers.length > 1)
    {
      captainCloseModal(); //모달 닫기
      sendMessageToSocket("/app/chat.sendGameMessage", "START");  //소켓에 START로 보냄
    }
    else Toast({ message: '2명 이상 모여야 게임 시작 가능!', type: 'error' });
  };

  // 정답 입력 모드로 전환하는 함수
  const switchToCORRECT = () => {
    if(currentCycle === 1)
      {
        Toast({ message: '정답 맞추기는 2라운드부터!', type: 'error' });
        return;
      }
      setIsCORRECTMode(true);
    };
    
  // 채팅 모드로 전환하는 함수
  const switchToASK = () => {
    setIsCORRECTMode(false);
  };

  //게임중 작동 함수를 넣는 함수
  const GameLogic = async () => { // async 추가
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
        "http://wwwag-backend.co.kr/answer/list",
        {
          params: {
            roomId: Number(params.roomId),
            nickname
          },
        }
      );
      console.log(response.data);
      const answerList = response.data
      answerListRef.current = answerList;
      return response.data;
    } catch (error) {
      console.error("정답 리스트 get api 오류 발생 : ", error);
      throw error;
    }
  };
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


  return (
    <FullLayout>
      <div className="flex flex-row justify-around items-center mt-10 mx-7">
        {joinUsers.map((info, index) => {
          return (
            <div key={index} className="relative">
              <JoinUser
                Nickname={info.roomNickname}
                userCount={userCount}
                gameStart={gameStart}
                className={""}
                gameUserDto={gameUserDto}
                isMyTurn={isMyTurn}
                children={
                  gameStart ? (
                    <div className={`p-1 shadow-lg rounded-lg absolute top-1/2 left-0`}>
                      <Button size="sm"
                        onClick={() => { socketPenaltyOnClick(info.roomNickname); }}>
                        경고 주기
                      </Button>
                    </div>
                  ) : (
                    <div></div>
                  )}
              />
            </div>
          );
        })}
      </div>


      {gameStart&&(
      <div className="flex justify-center items-center">
        <Timer time={time} />
      </div>)
      }
      <div className="m-auto mt-8 flex justify-center items-center relative">
        {!gameStart &&(
        <div className="mr-5">
          <div className="text-base">입장코드</div>
          <div className="text-xl">{enterCode}</div>
        </div>)}
        {gameStart &&(
        <div className="mr-5">
          <div className="text-base">현재 라운드</div>
          <div className="text-xl">{currentCycle}</div>
        </div>)}
        <div className="w-1/2 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
          {countdown !== null ? ( // 카운트다운 중일 때
            <div className="text-xl font-semibold">{countdown}</div>
          ) : gameStart ? ( // 게임 시작 후
            <div className="text-xl font-semibold">
              현재 질문자 : <span className="text-[#5b33de]"> {currentUserAnswer?.nickname}</span>
              <br />
              정답어 : <span className="text-[#c93290]"> {currentUserAnswer?.answer}</span>
            </div>
          ) : ( // 게임 시작 전
            <div className="text-xl font-semibold">게임 대기 중</div>
          )}
        </div>
        <div className="ml-5 text-base">
          방 인원
          <div className="text-lg">{joinUsers.length}/6</div>
        </div>
      </div>
      <div className="m-auto w-3/4 h-96 mt-10 overflow-y-hidden rounded-3xl shadow-xl flex flex-col tracking-wider bg-[#A072BC]">
        {chatMessages.map((m, index) => (
          <ChatRoom key={index} message={m} />
        ))}
      </div>

      <div className="mt-10 flex flex-row justify-center algin-center">
        {!gameStart && (
          <IconButton size="md" className="mr-10" onClick={captainOpenModal}>
            <FontAwesomeIcon icon={faGear} />
          </IconButton>
        )}
        <div>
        {gameStart && (<GameActionButton isMyTurn={isMyTurn} isAnswerMode={isCORRECTMode} />)}
        </div>

        <div className="w-5/12 flex flex-row justify-center algin-center relative">
          <input
            className="w-full rounded-2xl shadow-md pl-5 text-[#000000]"
            type="text"
            placeholder={
              gameStart // gameStart가 true인 경우에만 조건부 렌더링
                ? isMyTurn
                  ? isCORRECTMode
                    ? "정답을 입력하세요"
                    : "질문을 시작하세요" // isMyTurn이 true일 때
                  : "답변을 시작하세요" // isMyTurn이 false일 때
                : "채팅 메세지를 입력해주세요" // gameStart가 false일 때
            }
            value={myChatMessages}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return; 

              if (e.key === "Enter" && myChatMessages.trim() !== "") {
                sendMessage();
              } else if (e.key === "Enter" && myChatMessages.trim() === "") {
                Toast({ message: "채팅 메시지를 입력해주세요!", type: "warn" });
              }
            }}
            onChange={(e) => {
              setMyChatMessages(e.target.value);
            }}
          ></input>

          <IconButton
              className="shadow-none hover:shadow-none dark:shadow-none top-1 right-0 absolute"
              size="sm"
              onClick={() => {  // onClick 핸들러 수정
                if (myChatMessages.trim() !== "") { 
                  sendMessage();
                } else {
                  Toast({ message: "채팅 메시지를 입력해주세요!", type: "warn" });
                }
              }}
            >
            <FontAwesomeIcon className="text-[#000000]" icon={faPaperPlane} />
          </IconButton>
        </div>
      </div>

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
                <div className="text-[#FF0000]">이미 사용중인 닉네임입니다!</div>
              )
            )
          )}
          {!isNicknameChecked && (
            <div className="text-[#d98e0d]">닉네임을 검사해주세요!</div>
          )}
        </div>

          <Button size="sm" disabled={false} onClick={nicknamePossibleClick}>
            닉네임 확인
          </Button>

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
              <div><Button className="mt-2" size="md" disabled={false} onClick={clickGameStart}>GAME START</Button></div>
              <div><Button className="mt-2" size="sm" disabled={false} onClick={exitOnClick} > 게임 나가기 </Button></div>
            </div>
          </div>
        ) : (
          <div className="m-auto flex flex-col justify-center items-center">
            <div className="text-md mt-5">나는 방장이 아니니깐 할 수 있는게 없어</div>
            <div><Button className="mt-5" size="sm" disabled={false} onClick={exitOnClick} > 게임 나가기 </Button></div>
          </div>
        )}
        </div>
      </CaptainReatyToModal>
    </FullLayout>
  );
};

export default ReadyToGame;
