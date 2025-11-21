/**
 * 소켓 메시지 타입
 */
export type MessageType =
  | 'JOIN'
  | 'LEAVE'
  | 'CHAT'
  | 'CATEGORY'
  | 'TIMER'
  | 'CHANGE'
  | 'ASK'
  | 'ANSWER'
  | 'CORRECT'
  | 'READY'
  | 'START'
  | 'PENALTY'
  | 'END'
  | 'RESET';

/**
 * 소켓으로 전송되는 메시지 구조
 */
export interface SocketMessage {
  sender: string;
  content: string;
  messageType: MessageType;
  roomId: string;
}

/**
 * 메시지 수신 콜백 타입
 */
export type MessageCallback = (message: any) => void;

/**
 * 소켓 연결 성공 콜백 타입
 */
export type ConnectedCallback = () => void;
