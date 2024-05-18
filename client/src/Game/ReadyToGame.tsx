import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../components/button/IconButton";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import FullLayout from "../components/layout/FullLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import {
  captainReadyToGameModalState,
  readyToGameModalState,
} from "../recoil/modal";
import { useEffect, useState } from "react";
import ReadyToGameModal from "../components/modal/ReadyModal";
import Button from "../components/button/Button";
import axios from "axios";
import {
  ChatMessage,
  INicknamePossible,
  IRoomResponseInfo,
  IUserDto,
  URL,
  UserAnswers,
} from "../types/dto";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ChatRoom from "../components/chatRoom/ChatRoom";
import { useLocation } from "react-router-dom";
import JoinUser from "../components/ingameComponents/JoinUser";
import CaptainReatyToModal from "../components/modal/CaptainReadyModal";
import RadioButton from "../components/radioButton/RadioButton";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import Toast from "../components/toast/Toast";
import { history } from "../util/history";
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
  const [gameStart, setgameStart] = useState(false); //방장이 게임시작 눌렀는지

  // 방 정보 관리
  const [enterCode, setEnterCode] = useState<number>();
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>();
  const [isMeCaptain, setIsMeCaptain] = useState(false);

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
  const [joinUsers, setJoinUsers] = useState<IUserDto[]>([]) // 입장 유저


  //게임중 useState
  const [myTurn, setMyTurn] = useState(false);
  const [isAnswerMode, setIsAnswerMode] = useState(false); //정답 입력 <-> 채팅 입력 버튼 클릭 시의 입력창 변경
  const [answerList, setAnswerList] = useState([]); //정답어 리스트가 도착하면 상태를 바꾸어줌
  
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
    if (nickname === "" || nickname.includes(" ")) {
      console.log("error with blank");
      setPossible(false);
      return;
    }

    const data = await getNicknamePossible();
    setPossible(data.possible);
    localStorage.setItem("nickName", data.nickName);
  };

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
      console.log(response.data);
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
      //console.log(dto.roomNickname);
      const nickName = localStorage.getItem("nickName");
      //console.log(nickName);
      if (dto.captain && dto.roomNickname === nickName) setIsMeCaptain(true);
    });
  };

  // async function captinSocket() {
  //   socketCaptinConnect();
  // }

  // //방장 웹소켓 만들기
  // const socketCaptinConnect = () => {
  //   console.log("방장 구독");
  //   const socket = new SockJS(URL);
  //   stompClient = Stomp.over(socket);
  //   stompClient.connect({}, onCaptinConnected);
  // };

  // async function onCaptinConnected() {
  //   const roomId = roomInfo.roomId;
  //   const nickName = roomInfo.userNickName;
  //   stompClient.subscribe(`/topic/public/${roomId}`, onMessageReceived);
  //   stompClient.send(
  //     "/app/chat.addUser",
  //     {},
  //     JSON.stringify({ sender: nickName, type: "JOIN", roomId: roomId })
  //   );
  // }

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
      contentToSend = "";
    } else {
      if (contentToSend === "") {
        Toast({ message: "채팅 메시지를 입력해주세요!", type: "warn" });
        return;
      }
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
      //게임중
      if (isAnswerMode) {
        stompClient.send(
          sendMessageToSocket("/app/chat.sendGameMessage", "CORRECT")
        );
      } else {
        sendMessageToSocket("/app/chat.sendGameMessage", "ASK");
      }
    } //대기방
    else {
      sendMessageToSocket("/app/chat.sendMessage", "CHAT");
    }
  }
  //구독된 방에서 받아오는 모든 메세지 처리 부분
  function onMessageReceived(payload: any) {
    var message = JSON.parse(payload.body);
    if (message.messageType === "JOIN") {
      receiveChatMessage(message);
      addJoinUser();
      setRoomInfo();
      console.log("JOIN으로 온 메세지", message);
      console.log(message.sender + " joined!");
    } else if (message.messageType === "LEAVE") {
      receiveChatMessage(message);
      addJoinUser();
      setRoomInfo();
      console.log("LEAVE으로 온 메세지", message);
    } else if (message.messageType === "CHAT") {
      receiveChatMessage(message);
      console.log("CHAT으로 온 메세지", message);
      setRoomInfo();
    } else if (message.messageType === "CHANGE") {
      console.log("CHANGE로 온 메세지", message);
      setRoomInfo();
      Toast({ message: message.privateRoom ? '방이 비공개로 설정되었습니다.' : '방이 공개로 설정되었습니다.', type: 'info' });
    } else if (message.messageType === "ASK") {
      console.log("ASK로 온 메세지", message);
      getNextTurnInfo(message); 
    } else if (message.messageType === "ANSWER") {
      console.log("ANSWER로 온 메세지", message);
    } else if (message.messageType === "CORRECT") {
      console.log("CORRECT로 온 메세지", message);
    } else if (message.messageType === "START") {
      console.log("START로 온 메세지", message);
      getNextTurnInfo(message);
      setgameStart(true);
      GameLogic();
    } else {
      console.log(message);
    }
  }

  // 유저 입장 시 상단에 프로필 추가
  const addJoinUser = async () => {
    const roomInfo = await getRoomInfo();
    setJoinUsers(roomInfo.userDtos);
    //console.log("addJoinUser 실행됨");
  };

  // 유저 퇴장 시 상단에 프로필 삭제
  // const deleteLeavtUser = () => {
  //   console.log(userCount)
  //   if (message.messageType === "LEAVE") {
  //     setJoinUsers(message.roomResponse.userDtos)
  //   }
  //   setUserCount(joinUsers.length)
  // }

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

  usePreventRefresh();

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
          handleTimerEnd();
        }
      }, [stopTimer, resetTimer, time]);

      //타이머 종료 후 로직
      const handleTimerEnd = () => {
        startTimer();
      };

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
      const switchToAnswerMode = () => {
        setIsAnswerMode(true);
      };
    
      // 채팅 모드로 전환하는 함수
      const switchToChatMode = () => {
        setIsAnswerMode(false);
      };


      //게임중 작동 함수를 넣는 함수
      const GameLogic = () => {
        Toast({ message: '게임을 시작합니다!', type: 'success' });
        const answerlist = getGameAnswer(); //정답어 받아오기
        console.log(answerlist);
        startTimer();
        
      };

      
      // 다음 턴의 정보를 받아오는 함수입니다.
      const getNextTurnInfo = (socketMessage: any) => {
        // socketMessage에서 다음 턴 정보를 추출합니다.
        const nextTurnUser = socketMessage.gameUserDtos.find((user: any) => user.nextTurn === true);
      
        // 다음 턴 정보가 없거나 유효하지 않다면 null을 반환합니다.
        if (!nextTurnUser) {
          console.log()
          return null;
        }
        // 다음 턴의 사용자 정보를 반환합니다.
        return nextTurnUser;
      };

      // 자기자신만 제외하고 정답어를 받아오는 api
      const getGameAnswer = async () => {
        const nickname = localStorage.getItem("nickName");
        try {
          const response = await axios.get<UserAnswers>(
            "http://wwwag-backend.co.kr/answer/list",
            {
              params: {
                roomId: Number(params.roomId),
                nickname
              },
            }
          );
          console.log(response.data);
          return response.data;
        } catch (error) {
          console.error("정답 리스트 get api 오류 발생 : ", error);
          throw error;
        }
      };


  return (
    <FullLayout>
        <div className="flex flex-row justify-around items-center mt-10 mx-7">
        {joinUsers.map((name, index) => (
          <JoinUser key={index} Nickname={name.roomNickname} />
        ))}
      </div>
      {gameStart&&(
      <div className="flex justify-center items-center">
        <Timer time={time} />
      </div>)
      }
      <div className="m-auto mt-8 flex justify-center items-center relative">
        <div className="mr-5">
          <div className="text-base">입장코드</div>
          <div className="text-xl">{enterCode}</div>
        </div>
        <div className="w-1/2 h-16 shadow-lg text-[#353535] flex justify-center items-center rounded-lg bg-[#FFCCFF] shadow-xl">
          <div className="text-xl font-semibold">Ready To Game</div>
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
          {gameStart &&
            (isAnswerMode ? (
              <Button size="sm" className="mr-10" onClick={switchToChatMode}>
                채팅 치기
              </Button>
            ) : (
              <Button size="sm" className="mr-10" onClick={switchToAnswerMode}>
                정답 입력하기
              </Button>
            ))}
        </div>

        <div className="w-5/12 flex flex-row justify-center algin-center relative">
          <input
            className="w-full rounded-2xl shadow-md pl-5 text-[#000000]"
            type="text"
            placeholder={
              isAnswerMode ? "정답을 입력하세요" : "채팅 메세지를 입력해주세요"
            }
            value={myChatMessages}
            onKeyDown={(e) => {
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
            onClick={sendMessage}
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
            {possible ? (
              <div className="text-[#33B3FF]">사용가능</div>
            ) : (
              <div className="text-[#FF0000]">다른 닉네임을 입력해주세요</div>
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

      <CaptainReatyToModal onRequestClose={captainCloseModal}>
      <div> 
      <div className="text-xl font-bold mb-4">방장 기능</div>
      <div className="text-md">
        <span>현재 방 상태 : </span>
          {isPrivateRoom ? (
            <span className="text-[#FF0000]">
             비공개방
          </span>
        ): (
          <span className="text-[#33B3FF]">
           공개방
        </span>
        )}
      </div>
        {isMeCaptain ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-2">
              <RadioButton
                id="public"
                label="공개"
                value="false"
                name="roomType"
                onChange={() => setChangeIsPrivate(false)}
              />
              <RadioButton
                id="private"
                label="비공개"
                value="true"
                name="roomType"
                onChange={() => setChangeIsPrivate(true)}
              />
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
