import { API_URL } from './api';

/**
 * 소켓 서버 URL
 */
export const SOCKET_SERVER_URL = `${API_URL}/ws`;

/**
 * 소켓 API 엔드포인트
 */
export const SOCKET_ENDPOINTS = {
  // 방 관련
  ADD_USER: '/app/chat.addUser',

  // 채팅
  SEND_MESSAGE: '/app/chat.sendMessage',

  // 게임
  SEND_GAME_MESSAGE: '/app/chat.sendGameMessage',

  // 방 설정
  READY: '/app/chat.ready',
  SET_CATEGORY: '/app/chat.setCategory',
  SET_TIMER: '/app/chat.setTimer',
  CHANGE_MODE: '/app/chat.changeMode',
} as const;

/**
 * 구독 토픽
 */
export const SOCKET_TOPICS = {
  PUBLIC: (roomId: string) => `/topic/public/${roomId}`,
} as const;

