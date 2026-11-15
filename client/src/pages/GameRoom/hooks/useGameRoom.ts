import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  captainReadyToGameModalState,
  ingameTimerCount,
  loadingModalState,
  readyToGameModalState,
} from '../../../recoil/recoil';
import { Toast, GA_EVENT, trackEvent, answerApi, roomApi, session, useSound } from '../../../shared';
import { gameSocket, GameMessage, SocketMessage } from '../../../socket';
import { AnswerUserDto, GameUserDto, IUserDto } from '../../../types/dto';
import useTimer from '../../../Game/timer/useTimer';

/** CreateRoom 에서 navigate state 로 넘기는 값 */
interface GameRoomLocationState {
  isCaptin?: boolean;
  from?: string;
}

/** 서로 이름 지어주기(제시어 입력) 단계 상태 */
export interface NamingState {
  active: boolean;
  /** 내가 제시어를 정해 줄 상대 */
  target: string | null;
  submitted: boolean;
  /** 아직 입력하지 않은 인원 수 */
  pending: number;
}

/** 정답 맞추기 모달 상태 */
export interface AnswerModalState {
  open: boolean;
  /** 정답을 보내고 서버 판정을 기다리는 중 */
  submitting: boolean;
  result: { correct: boolean; ranking: number } | null;
}

const COUNTDOWN_SECONDS = 5;
const RESULT_DELAY_MS = 5000;
const NEXT_TURN_DELAY_MS = 5000;
const RESTART_LOADING_MS = 1000;
const AUTO_ASK_AT_SECONDS = 5;
const IDLE_NAMING: NamingState = { active: false, target: null, submitted: false, pending: 0 };
const IDLE_ANSWER_MODAL: AnswerModalState = { open: false, submitting: false, result: null };

/**
 * 게임방의 상태와 소켓 처리 전부.
 * 화면(index.tsx)은 이 훅이 돌려주는 값과 액션만 사용합니다.
 */
export function useGameRoom() {
  const { roomId: roomIdParam } = useParams();
  const roomId = Number(roomIdParam);
  const location = useLocation();
  const locationState = (location.state ?? {}) as GameRoomLocationState;
  const navigate = useNavigate();
  const play = useSound();
  const myName = session.getNickname();

  const setJoinModalOpen = useSetRecoilState(readyToGameModalState);
  const setCaptainModalOpen = useSetRecoilState(captainReadyToGameModalState);
  const setLoadingModalOpen = useSetRecoilState(loadingModalState);
  const [ingameTimer, setIngameTimer] = useRecoilState(ingameTimerCount);
  const { time, startTimer, stopTimer, resetTimer } = useTimer();

  /* ---------- 방 정보 (GET /room/info) ---------- */
  const [enterCode, setEnterCode] = useState<number>();
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>();
  const [category, setCategory] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isMeCaptain, setIsMeCaptain] = useState(false);

  /* ---------- 참가자 / 준비 ---------- */
  const [joinUsers, setJoinUsers] = useState<IUserDto[]>([]);
  const [readyUsers, setReadyUsers] = useState<IUserDto[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [allReady, setAllReady] = useState(false);

  /* ---------- 채팅 ---------- */
  const [chatMessages, setChatMessages] = useState<SocketMessage[]>([]);
  const [draft, setDraft] = useState('');

  /* ---------- 게임 진행 ---------- */
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStart, setGameStart] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [hasSentCorrect, setHasSentCorrect] = useState(false);
  const [hasSentAsk, setHasSentAsk] = useState(false);
  const [gameUserDtos, setGameUserDtos] = useState<GameUserDto[]>([]);
  const [answers, setAnswers] = useState<AnswerUserDto[]>([]); // 참가자별 정답어 (내 것은 힌트)
  const [currentUserAnswer, setCurrentUserAnswer] = useState<AnswerUserDto>(); // 현재 질문자와 그 정답어
  const [naming, setNaming] = useState<NamingState>(IDLE_NAMING);
  const [answerModal, setAnswerModal] = useState<AnswerModalState>(IDLE_ANSWER_MODAL);
  // 소켓 콜백/타임아웃 안에서 최신 값을 읽기 위한 ref
  const answersRef = useRef<AnswerUserDto[]>([]);
  const nextTurnUserRef = useRef<GameUserDto | null>(null);
  const currentAnswerRef = useRef<AnswerUserDto | undefined>(undefined);
  const gameCycleRef = useRef(0);

  /* ---------- 결과 ---------- */
  const [isGameEnd, setIsGameEnd] = useState(false);
  const [myRank, setMyRank] = useState<number>();
  const [showConfetti, setShowConfetti] = useState(false);

  /* ================= 서버 호출 ================= */

  /** 방 정보·참가자·방장 여부 갱신 */
  const refreshRoomInfo = useCallback(async () => {
    try {
      const info = await roomApi.getInfo(roomId);
      setUserCount(info.userCount);
      setEnterCode(info.roomEnterCode);
      setIsPrivateRoom(info.privateRoom);
      setCategory(info.category);
      setCustomMode(info.customMode);
      setIngameTimer(info.timer);
      setReadyUsers(info.userDtos);
      const me = session.getNickname();
      if (info.userDtos.some((u) => u.captain && u.roomNickname === me)) setIsMeCaptain(true);
    } catch {
      /* 실패 로그는 api 인터셉터가 남김 */
    }
  }, [roomId, setIngameTimer]);

  /** 참가자별 정답어 목록 (내 정답어는 라운드별 힌트) */
  const loadAnswers = useCallback(async () => {
    const nickname = session.getNickname();
    if (!nickname) return;
    try {
      const list = await answerApi.getAnswerList(roomId, nickname);
      answersRef.current = list;
      setAnswers(list);
    } catch {
      /* 실패 로그는 api 인터셉터가 남김 */
    }
  }, [roomId]);

  /* ================= 게임 진행 헬퍼 ================= */

  const updateAllReady = (users: IUserDto[]) => {
    const everyoneReady = users.length > 1 && users.every((u) => u.ready);
    if (everyoneReady) Toast({ message: '모든 사용자 게임 준비 완료', type: 'success' });
    setAllReady(everyoneReady);
  };

  /** START/ASK 메시지에서 라운드와 다음 질문자(+그 사람의 정답어)를 기억 */
  const rememberTurnInfo = (message: GameMessage) => {
    gameCycleRef.current = message.cycle;
    const next = message.gameUserDtos.find((u) => u.nextTurn);
    if (!next) return;
    nextTurnUserRef.current = next;
    currentAnswerRef.current = answersRef.current.find((a) => a.nickname === next.roomNickname);
  };

  /** 턴 시작: 타이머 시작, 질문자/답변자 안내, 채팅 비우기 */
  const beginTurn = useCallback(() => {
    play('gameStart');
    startTimer();
    setHasSentCorrect(false);
    setHasSentAsk(false);
    const myTurn = nextTurnUserRef.current?.roomNickname === session.getNickname();
    setIsMyTurn(myTurn);
    setCurrentUserAnswer(currentAnswerRef.current);
    setCurrentCycle(gameCycleRef.current);
    Toast({ message: myTurn ? '당신은 질문자입니다.' : '당신은 답변자입니다.', type: 'info' });
    setChatMessages([]);
  }, [play, startTimer]);

  /** CORRECT 수신: 정답이면 타이머를 멈추고, 정답자(질문자)가 5초 뒤 RESET 으로 턴을 넘김 */
  const handleCorrectAnswer = (message: GameMessage) => {
    const { sender } = message;
    const senderDto = message.gameUserDtos.find((u) => u.roomNickname === sender);
    if (!senderDto) return;
    const isMine = sender === session.getNickname();
    const correct = senderDto.ranking !== 0;

    if (isMine) setAnswerModal({ open: true, submitting: false, result: { correct, ranking: senderDto.ranking } });

    if (!correct) {
      play('wrong');
      Toast({ message: `${sender}가 정답을 맞추지 못했습니다!`, type: 'info' });
      return;
    }

    play('correct');
    Toast({ message: `${sender}가 정답을 맞추었습니다!`, type: 'success' });
    // 질문 없이 바로 정답을 맞혔으면 질문 차례를 소모시켜 서버가 다음 질문자를 정하게 한다
    if (isMine && !hasSentAsk) gameSocket.sendGameMessage('ASK', '정답이다!!');
    stopTimer();
    if (isMine) {
      window.setTimeout(() => gameSocket.sendGameMessage('RESET'), NEXT_TURN_DELAY_MS);
    }
  };

  /* ================= 소켓 수신 ================= */

  const onMessage = (message: SocketMessage) => {
    setChatMessages((prev) => [...prev, message]);

    switch (message.messageType) {
      case 'JOIN':
        setJoinUsers(message.roomResponse.userDtos);
        setReadyUsers(message.roomResponse.userDtos);
        refreshRoomInfo();
        updateAllReady(message.roomResponse.userDtos);
        break;
      case 'LEAVE':
        setJoinUsers(message.roomResponse.userDtos);
        refreshRoomInfo();
        updateAllReady(message.roomResponse.userDtos);
        break;
      case 'CHAT':
        refreshRoomInfo();
        break;
      case 'CATEGORY':
        setCategory(message.content);
        break;
      case 'TIMER':
        setIngameTimer(parseInt(message.content, 10));
        break;
      case 'CUSTOM':
        setCustomMode(message.content === 'true');
        Toast({ message: message.content === 'true' ? '서로 이름 지어주기가 켜졌습니다.' : '서로 이름 지어주기가 꺼졌습니다.', type: 'info' });
        break;
      case 'CHANGE':
        refreshRoomInfo();
        Toast({ message: message.privateRoom ? '방이 비공개로 설정되었습니다.' : '방이 공개로 설정되었습니다.', type: 'info' });
        break;
      case 'READY':
        refreshRoomInfo();
        setReadyUsers(message.userDtos);
        updateAllReady(message.userDtos);
        break;
      case 'NAMING': {
        // 서로 이름 지어주기: 각자 맡은 상대의 제시어를 입력하는 단계
        play('start');
        setCaptainModalOpen(false);
        const me = message.gameUserDtos.find((u) => u.roomNickname === session.getNickname());
        setNaming({ active: true, target: me?.namingTarget ?? null, submitted: false, pending: message.gameUserDtos.length });
        break;
      }
      case 'NAME':
        setNaming((prev) => ({ ...prev, pending: Number(message.content) || 0 }));
        break;
      case 'CANCEL':
        setNaming(IDLE_NAMING);
        setAllReady(false);
        if (!isMeCaptain) setIsReady(false); // 시작하면서 서버가 방장 외 준비 상태를 풀었으므로 다시 준비해야 한다
        refreshRoomInfo();
        Toast({ message: message.content, type: 'warn' });
        break;
      case 'START':
        play('start');
        setNaming(IDLE_NAMING);
        setCountdown(COUNTDOWN_SECONDS);
        loadAnswers();
        window.setTimeout(() => {
          rememberTurnInfo(message);
          setGameStart(true);
          Toast({ message: '게임을 시작합니다!', type: 'success' });
          beginTurn();
        }, COUNTDOWN_SECONDS * 1000);
        break;
      case 'ASK':
        rememberTurnInfo(message);
        break;
      case 'ANSWER':
        break;
      case 'CORRECT':
        handleCorrectAnswer(message);
        setGameUserDtos(message.gameUserDtos);
        break;
      case 'PENALTY':
        setGameUserDtos(message.gameUserDtos);
        break;
      case 'END': {
        stopTimer();
        play('correct');
        Toast({ message: '게임이 끝났습니다!', type: 'success' });
        trackEvent({ action: GA_EVENT.GAME.GAME_END, category: 'game', label: `roomId: ${session.getRoomId()}` });
        setGameUserDtos(message.gameUserDtos);
        // 내 정답으로 게임이 끝났으면 CORRECT 대신 END 가 오므로 여기서 결과 모달을 띄운다
        const me = message.gameUserDtos.find((u) => u.roomNickname === session.getNickname());
        if (message.sender === session.getNickname() && me) {
          setAnswerModal({ open: true, submitting: false, result: { correct: me.ranking !== 0, ranking: me.ranking } });
        }
        window.setTimeout(() => setIsGameEnd(true), RESULT_DELAY_MS);
        break;
      }
      case 'RESET':
        stopTimer();
        resetTimer();
        setAnswerModal(IDLE_ANSWER_MODAL);
        beginTurn();
        break;
      default:
        // 서버가 messageType 없이 보내는 안내(질문자 탈주 등)는 채팅에만 표시
        break;
    }
  };

  // 소켓 콜백은 입장 시 한 번 등록되므로, 항상 최신 렌더의 핸들러를 타도록 ref 로 감싼다
  const handlerRef = useRef<(message: SocketMessage) => void>(() => {});
  useEffect(() => {
    handlerRef.current = onMessage;
  });

  const connect = useCallback(() => {
    gameSocket.joinRoom(
      (message) => handlerRef.current(message),
      () => Toast({ message: '소켓 연결에 실패했습니다', type: 'error' })
    );
  }, []);

  /* ================= 입장 ================= */

  useEffect(() => {
    const enter = async () => {
      const code = new URLSearchParams(location.search).get('code');
      try {
        if (code) {
          const result = await roomApi.findByEnterCode(parseInt(code, 10));
          if (!result.ok) {
            Toast({
              message: result.reason === 'ALREADY_STARTED' ? '이미 게임이 시작되었습니다!' : '잘못된 접근입니다!',
              type: 'error',
            });
            navigate('/');
            return;
          }
          session.setRoomId(result.roomId);
        } else if (!session.getRoomId()) {
          Toast({ message: '잘못된 접근입니다!', type: 'error' });
          navigate('/');
          return;
        }
      } catch {
        Toast({ message: '잘못된 접근입니다!', type: 'error' });
        navigate('/');
        return;
      }

      if (locationState.isCaptin) {
        // 방장은 닉네임이 이미 있으므로 바로 연결. 새로고침 때 다시 방장으로 취급되지 않도록 state 는 비운다.
        trackEvent({ action: GA_EVENT.ROOM.ROOM_INFO_ON_START, category: 'room', label: `roomId: ${session.getRoomId()}` });
        navigate(location.pathname + location.search, { replace: true, state: {} });
        connect();
        return;
      }
      setJoinModalOpen(true);
    };
    enter();
    // 최초 진입 시 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= 타이머 / 카운트다운 / 라운드 / 결과 ================= */

  // 질문자가 질문을 안 하면 5초 남았을 때 자동 질문, 0초가 되면 RESET 으로 턴을 넘긴다
  useEffect(() => {
    if (time === AUTO_ASK_AT_SECONDS && isMyTurn && !hasSentAsk) {
      play('question');
      gameSocket.sendGameMessage('ASK', '질문 시간이 종료되어 강제로 전송합니다.');
      setHasSentAsk(true);
    }
    if (time < 0) {
      stopTimer();
      resetTimer();
      trackEvent({
        action: GA_EVENT.GAME.TIMEOUT,
        category: 'game',
        label: `nickname: ${session.getNickname()}, reason: timer expired`,
      });
      if (isMyTurn) gameSocket.sendGameMessage('RESET');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      return;
    }
    const id = window.setInterval(() => setCountdown(countdown - 1), 1000);
    return () => window.clearInterval(id);
  }, [countdown]);

  // 라운드가 바뀌면 내 정답어 힌트가 달라지므로 다시 받는다
  useEffect(() => {
    if (gameStart) loadAnswers();
  }, [currentCycle, gameStart, loadAnswers]);

  useEffect(() => {
    if (!isGameEnd) return;
    const me = gameUserDtos.find((u) => u.roomNickname === myName);
    if (!me) return;
    setMyRank(me.ranking);
    if (me.ranking >= 1 && me.ranking <= 3) {
      play('party', 'firework');
      setShowConfetti(true);
    } else {
      play('boo');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameEnd]);

  /* ================= 액션 ================= */

  /** 입력창 전송: 대기방 채팅 / 질문 / 답변 */
  const sendDraft = () => {
    if (draft.trim() === '') {
      Toast({ message: '채팅 메시지를 입력해주세요!', type: 'warn' });
      return;
    }
    if (!gameStart) {
      gameSocket.sendChatMessage(draft);
    } else if (!isMyTurn) {
      gameSocket.sendGameMessage('ANSWER', draft);
    } else if (!hasSentAsk) {
      play('question');
      gameSocket.sendGameMessage('ASK', draft);
      setHasSentAsk(true);
    } else {
      Toast({ message: '질문 기회를 모두 소진했습니다!', type: 'error' });
      return;
    }
    setDraft('');
  };

  const toggleReady = () => {
    setIsReady((v) => !v);
    gameSocket.sendReady();
    play('click');
    if (isReady) Toast({ message: '준비 취소 ❌', type: 'error' });
    else Toast({ message: '준비 완료 ✅', type: 'success' });
  };

  const startGame = () => {
    play('click');
    if (joinUsers.length > 1 && joinUsers.length === userCount) {
      setCaptainModalOpen(false);
      gameSocket.sendGameMessage('START');
    } else {
      Toast({ message: '2명 이상 모여야 게임 시작 가능!', type: 'error' });
    }
  };

  /** 서로 이름 지어주기: 내가 맡은 상대의 제시어 제출. 빈 값이면 서버가 랜덤으로 정한다 */
  const submitName = (word: string) => {
    if (!naming.active || naming.submitted) return;
    gameSocket.sendName(word.trim());
    setNaming((prev) => ({ ...prev, submitted: true }));
  };

  const cancelNaming = () => {
    play('click');
    gameSocket.sendCancelNaming();
  };

  const sendPenalty = (targetNickname: string) => {
    play('warning');
    gameSocket.sendPenalty(targetNickname);
  };

  const openAnswerModal = () => {
    play('click');
    if (currentCycle === 1) {
      Toast({ message: '정답 맞추기는 2라운드부터!', type: 'error' });
      return;
    }
    if (hasSentCorrect) {
      Toast({ message: '이번 턴의 정답 기회를 이미 썼습니다!', type: 'error' });
      return;
    }
    setAnswerModal({ open: true, submitting: false, result: null });
  };

  const closeAnswerModal = () => setAnswerModal(IDLE_ANSWER_MODAL);

  /** 정답 제출 → 서버 판정(CORRECT/END)이 오면 모달에 결과 표시 */
  const submitAnswer = (word: string) => {
    const answer = word.trim();
    if (answer === '') {
      Toast({ message: '정답을 입력해주세요!', type: 'warn' });
      return;
    }
    gameSocket.sendGameMessage('CORRECT', answer);
    setHasSentCorrect(true);
    setAnswerModal((prev) => ({ ...prev, submitting: true }));
  };

  const exit = () => {
    play('click');
    trackEvent({
      action: GA_EVENT.RESULT.CLICK_GO_MAIN,
      category: 'result',
      label: `nickname: ${myName}, roomId: ${session.getRoomId()}`,
    });
    window.location.replace('/');
  };

  /** 결과 화면에서 대기방으로 */
  const restart = () => {
    play('click');
    trackEvent({
      action: GA_EVENT.RESULT.CLICK_RESTART,
      category: 'result',
      label: `nickname: ${myName}, roomId: ${session.getRoomId()}`,
    });
    setLoadingModalOpen(true);
    window.setTimeout(() => {
      setIsGameEnd(false);
      setLoadingModalOpen(false);
    }, RESTART_LOADING_MS);

    setGameStart(false);
    setCountdown(null);
    setIsMyTurn(false);
    setIsReady(false);
    setAllReady(false);
    setHasSentAsk(false);
    setHasSentCorrect(false);
    setCurrentCycle(0);
    setChatMessages([]);
    setGameUserDtos([]);
    setReadyUsers([]);
    setAnswers([]);
    setCurrentUserAnswer({ nickname: '', answer: '' });
    setNaming(IDLE_NAMING);
    setAnswerModal(IDLE_ANSWER_MODAL);
    setMyRank(undefined);
    setShowConfetti(false);
    refreshRoomInfo();
  };

  return {
    room: { roomId, enterCode, isPrivateRoom, category, customMode, userCount, isMeCaptain, ingameTimer, setIsPrivateRoom },
    players: { joinUsers, readyUsers, isReady, allReady },
    chat: { messages: chatMessages, draft, setDraft, send: sendDraft },
    game: { countdown, gameStart, isMyTurn, currentCycle, gameUserDtos, answers, currentUserAnswer, time, hasSentCorrect, naming, answerModal },
    result: { isGameEnd, myRank, showConfetti, myName },
    actions: {
      connect,
      toggleReady,
      startGame,
      submitName,
      cancelNaming,
      sendPenalty,
      openAnswerModal,
      closeAnswerModal,
      submitAnswer,
      exit,
      restart,
      openJoinModal: () => setJoinModalOpen(true),
      closeJoinModal: () => setJoinModalOpen(false),
      openCaptainModal: () => setCaptainModalOpen(true),
      closeCaptainModal: () => setCaptainModalOpen(false),
      closeLoadingModal: () => setLoadingModalOpen(false),
    },
  };
}

export type GameRoomState = ReturnType<typeof useGameRoom>;
