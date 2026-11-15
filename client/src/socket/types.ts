import { GameUserDto, IRoomResponseInfo, IUserDto } from '../types/dto';

/** 소켓 메시지 종류 (서버 ChatMessage.MessageType 와 동일) */
export type MessageType =
  | 'JOIN'
  | 'LEAVE'
  | 'CHAT'
  | 'CATEGORY'
  | 'TIMER'
  | 'CHANGE'
  | 'CUSTOM'
  | 'ASK'
  | 'ANSWER'
  | 'CORRECT'
  | 'READY'
  | 'START'
  | 'NAMING'
  | 'NAME'
  | 'CANCEL'
  | 'PENALTY'
  | 'END'
  | 'RESET';

/** 클라이언트 → 서버로 보내는 페이로드 (모든 목적지 공통) */
export interface OutgoingMessage {
  sender: string;
  content: string;
  messageType: MessageType;
  roomId: string;
}

interface BaseMessage {
  sender: string;
  content: string;
  roomId: number;
}

/** JOIN / LEAVE: 방 정보와 참가자 목록이 함께 옴 (ChatRoomInfoMessage) */
export interface RoomInfoMessage extends BaseMessage {
  messageType: 'JOIN' | 'LEAVE';
  roomResponse: IRoomResponseInfo;
}

/** READY: 참가자별 준비 상태 (ChatReadyMessage) */
export interface ReadyMessage extends BaseMessage {
  messageType: 'READY';
  userDtos: IUserDto[];
}

/** CHANGE: 공개/비공개 전환 (ChatRoomModeMessage) */
export interface RoomModeMessage extends BaseMessage {
  messageType: 'CHANGE';
  privateRoom: boolean;
}

/**
 * 게임 진행 메시지 (ChatGameMessage).
 * NAMING: 제시어 입력 단계 시작 · NAME: 누군가 입력함(content = 남은 인원 수) · CANCEL: 입력 단계 취소
 * 서버가 강제 턴 넘김 시 messageType 이 null 로 올 수도 있음
 */
export interface GameMessage extends BaseMessage {
  messageType: 'START' | 'NAMING' | 'NAME' | 'CANCEL' | 'ASK' | 'ANSWER' | 'CORRECT' | 'PENALTY' | 'END' | 'RESET' | null;
  gameEnd: boolean;
  cycle: number;
  gameUserDtos: GameUserDto[];
}

/** 그대로 중계되는 메시지 (ChatMessage). CUSTOM 의 content 는 "true"/"false" */
export interface PlainMessage extends BaseMessage {
  messageType: 'CHAT' | 'CATEGORY' | 'TIMER' | 'CUSTOM';
}

/** 구독 토픽으로 수신하는 모든 메시지 */
export type SocketMessage = RoomInfoMessage | ReadyMessage | RoomModeMessage | GameMessage | PlainMessage;

export type MessageCallback = (message: SocketMessage) => void;
