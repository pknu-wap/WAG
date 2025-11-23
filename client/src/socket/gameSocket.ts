import { Stomp, CompatClient, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageType, MessageCallback } from './types';
import { SOCKET_SERVER_URL, SOCKET_ENDPOINTS, SOCKET_TOPICS } from '../shared/config';

/**
 * 게임 소켓 관리 클래스
 * WebSocket 연결, 메시지 송수신, 구독 관리를 담당
 *
 * 타입 설명:
 * - CompatClient: Stomp.over(SockJS)로 생성되는 레거시 호환 클라이언트
 *   (새로운 Client는 WebSocket 네이티브용, 우리는 SockJS 사용)
 * - IMessage: STOMP 메시지 프레임 (body: string, headers 포함)
 * - StompSubscription: 구독 객체 (unsubscribe() 메서드 제공)
 */

class GameSocket {
  private stompClient: CompatClient | null = null;
  private onMessageCallback: MessageCallback | null = null;
  private subscription: StompSubscription | null = null;

  /**
   * 소켓 연결
   */
  private connect(onConnected: () => void, onError: (error: unknown) => void): void {
    // 이미 연결되어 있으면 재연결하지 않음
    if (this.isConnected()) {
      onConnected();
      return;
    }

    const socket = new SockJS(SOCKET_SERVER_URL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      () => {
        onConnected();
      },
      (error: string | unknown) => {
        console.error('소켓 연결 실패:', error);
        this.stompClient = null;
        onError(error);
      }
    );
  }

  /**
   * 방 구독
   */
  private subscribe(onMessageReceived: MessageCallback): void {
    const roomId = localStorage.getItem('roomId');

    if (!roomId) {
      throw new Error('roomId가 없습니다.');
    }

    if (!this.stompClient) {
      throw new Error('소켓이 연결되지 않았습니다.');
    }

    // 이전 구독 해제
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.onMessageCallback = onMessageReceived;

    this.subscription = this.stompClient.subscribe(SOCKET_TOPICS.PUBLIC(roomId), (message: IMessage) => {
      const parsedMessage = JSON.parse(message.body);
      if (this.onMessageCallback) {
        this.onMessageCallback(parsedMessage);
      }
    });
  }

  /**
   * 방 입장 (연결 + 구독 + JOIN)
   *
   * @example
   * gameSocket.joinRoom(
   *   (message) => console.log('메시지:', message),
   *   (error) => console.error('에러:', error)
   * );
   */
  joinRoom(onMessageReceived: MessageCallback, onError?: (error: unknown) => void): void {
    this.connect(
      () => {
        try {
          this.subscribe(onMessageReceived);
          this.sendMessageInternal(SOCKET_ENDPOINTS.ADD_USER, 'JOIN');
        } catch (error) {
          console.error('방 입장 실패:', error);
          if (onError) {
            onError(error);
          }
        }
      },
      (error) => {
        console.error('방 입장 실패:', error);
        if (onError) {
          onError(error);
        }
      }
    );
  }
  /**
   * 메시지 전송 (내부 헬퍼)
   */
  private sendMessageInternal(socketURL: string, messageType: MessageType, content: string = ''): void {
    const roomId = localStorage.getItem('roomId');
    const nickName = localStorage.getItem('nickName');

    if (!this.stompClient) {
      throw new Error('소켓이 연결되지 않았습니다.');
    }

    if (!roomId || !nickName) {
      throw new Error('roomId 또는 nickName이 없습니다.');
    }

    this.stompClient.send(
      socketURL,
      {},
      JSON.stringify({
        sender: nickName,
        content,
        messageType,
        roomId,
      })
    );
  }

  /**
   * 범용 메시지 전송 (외부에서 사용 가능)
   */
  sendMessage(socketURL: string, messageType: MessageType, content: string = ''): void {
    this.sendMessageInternal(socketURL, messageType, content);
  }

  /**
   * 채팅 메시지 전송
   */
  sendChatMessage(message: string): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.SEND_MESSAGE, 'CHAT', message);
  }

  /**
   * 게임 메시지 전송
   */
  sendGameMessage(messageType: MessageType, content: string = ''): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.SEND_GAME_MESSAGE, messageType, content);
  }

  /**
   * 준비 상태 토글
   */
  sendReady(): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.READY, 'READY');
  }

  /**
   * 카테고리 변경
   */
  sendCategory(category: string): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.SET_CATEGORY, 'CATEGORY', category);
  }

  /**
   * 타이머 설정
   */
  sendTimer(seconds: string): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.SET_TIMER, 'TIMER', seconds);
  }

  /**
   * 방 공개/비공개 변경
   */
  sendChangeMode(): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.CHANGE_MODE, 'CHANGE');
  }

  /**
   * 페널티 전송
   */
  sendPenalty(recipient: string): void {
    this.sendMessageInternal(SOCKET_ENDPOINTS.SEND_GAME_MESSAGE, 'PENALTY', recipient);
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    // 구독 해제
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    // 소켓 해제
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.stompClient = null;
      this.onMessageCallback = null;
    }
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.stompClient !== null && this.stompClient.connected;
  }
}

// 싱글톤 인스턴스 생성
export const gameSocket = new GameSocket();
