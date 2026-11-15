import { Stomp, CompatClient, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageType, MessageCallback, OutgoingMessage, SocketMessage } from './types';
import { SOCKET_SERVER_URL, SOCKET_ENDPOINTS, SOCKET_TOPICS } from '../shared/config';
import { session } from '../shared/lib/session';

/**
 * 게임 소켓 싱글톤. 연결 → 방 구독 → 메시지 송수신을 담당합니다.
 *
 * - CompatClient: Stomp.over(SockJS) 로 만드는 호환 클라이언트 (SockJS 를 쓰므로 네이티브 Client 대신 사용)
 * - 모든 송신 페이로드는 { sender, content, messageType, roomId } 한 가지 형태이며
 *   sender/roomId 는 session(localStorage) 에서 읽습니다.
 */
class GameSocket {
  private stompClient: CompatClient | null = null;
  private subscription: StompSubscription | null = null;

  /** 방 입장: 연결 + 구독 + JOIN 전송. 이미 연결돼 있으면 구독만 갱신합니다. */
  joinRoom(onMessage: MessageCallback, onError?: (error: unknown) => void): void {
    const fail = (error: unknown) => {
      console.error('방 입장 실패:', error);
      onError?.(error);
    };

    this.connect(() => {
      try {
        this.subscribe(onMessage);
        this.send(SOCKET_ENDPOINTS.ADD_USER, 'JOIN');
      } catch (error) {
        fail(error);
      }
    }, fail);
  }

  /** 대기방 채팅 */
  sendChatMessage(content: string): void {
    this.send(SOCKET_ENDPOINTS.SEND_MESSAGE, 'CHAT', content);
  }

  /** 게임 진행 메시지: START, ASK, ANSWER, CORRECT, RESET, NAME, CANCEL */
  sendGameMessage(messageType: Extract<MessageType, 'START' | 'ASK' | 'ANSWER' | 'CORRECT' | 'RESET' | 'NAME' | 'CANCEL'>, content = ''): void {
    this.send(SOCKET_ENDPOINTS.SEND_GAME_MESSAGE, messageType, content);
  }

  /** 서로 이름 지어주기: 내가 맡은 상대의 제시어 제출 (빈 문자열이면 서버가 랜덤으로 정함) */
  sendName(word: string): void {
    this.sendGameMessage('NAME', word);
  }

  /** 제시어 입력 단계 취소 (방장) */
  sendCancelNaming(): void {
    this.sendGameMessage('CANCEL');
  }

  /** 경고 주기 (content = 대상 닉네임) */
  sendPenalty(targetNickname: string): void {
    this.send(SOCKET_ENDPOINTS.SEND_GAME_MESSAGE, 'PENALTY', targetNickname);
  }

  /** 준비 상태 토글 */
  sendReady(): void {
    this.send(SOCKET_ENDPOINTS.READY, 'READY');
  }

  /** 카테고리 변경 (방장). "전체" 또는 "lol,한국위인" */
  sendCategory(category: string): void {
    this.send(SOCKET_ENDPOINTS.SET_CATEGORY, 'CATEGORY', category);
  }

  /** 턴 당 시간 변경 (방장) */
  sendTimer(seconds: number): void {
    this.send(SOCKET_ENDPOINTS.SET_TIMER, 'TIMER', String(seconds));
  }

  /** 공개 ↔ 비공개 전환 (방장) */
  sendChangeMode(): void {
    this.send(SOCKET_ENDPOINTS.CHANGE_MODE, 'CHANGE');
  }

  /** 서로 이름 지어주기 on/off (방장) */
  sendCustomMode(on: boolean): void {
    this.send(SOCKET_ENDPOINTS.SET_CUSTOM_MODE, 'CUSTOM', String(on));
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.stompClient?.disconnect();
    this.stompClient = null;
  }

  isConnected(): boolean {
    return this.stompClient !== null && this.stompClient.connected;
  }

  private connect(onConnected: () => void, onError: (error: unknown) => void): void {
    if (this.isConnected()) {
      onConnected();
      return;
    }

    const socket = new SockJS(SOCKET_SERVER_URL);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, onConnected, (error: unknown) => {
      console.error('소켓 연결 실패:', error);
      this.stompClient = null;
      onError(error);
    });
  }

  private subscribe(onMessage: MessageCallback): void {
    const roomId = session.getRoomId();
    if (!roomId) throw new Error('roomId가 없습니다.');
    if (!this.stompClient) throw new Error('소켓이 연결되지 않았습니다.');

    this.subscription?.unsubscribe();
    this.subscription = this.stompClient.subscribe(SOCKET_TOPICS.PUBLIC(roomId), (frame: IMessage) => {
      onMessage(JSON.parse(frame.body) as SocketMessage);
    });
  }

  private send(destination: string, messageType: MessageType, content = ''): void {
    const roomId = session.getRoomId();
    const sender = session.getNickname();
    if (!this.stompClient) throw new Error('소켓이 연결되지 않았습니다.');
    if (!roomId || !sender) throw new Error('roomId 또는 nickName이 없습니다.');

    const payload: OutgoingMessage = { sender, content, messageType, roomId };
    this.stompClient.send(destination, {}, JSON.stringify(payload));
  }
}

export const gameSocket = new GameSocket();
