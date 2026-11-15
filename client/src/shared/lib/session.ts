/**
 * 브라우저 세션(localStorage)에 두는 게임 식별 정보.
 * 소켓 메시지의 sender/roomId, API 파라미터는 전부 여기서 읽습니다.
 */
const KEY = {
  roomId: 'roomId',
  nickname: 'nickName',
} as const;

export const session = {
  getRoomId: (): string | null => localStorage.getItem(KEY.roomId),
  setRoomId: (roomId: string | number): void => localStorage.setItem(KEY.roomId, String(roomId)),
  getNickname: (): string | null => localStorage.getItem(KEY.nickname),
  setNickname: (nickname: string): void => localStorage.setItem(KEY.nickname, nickname),
  /** 방·닉네임 정보만 지웁니다 (다크모드 설정 `theme` 은 유지) */
  clearGame: (): void => {
    localStorage.removeItem(KEY.roomId);
    localStorage.removeItem(KEY.nickname);
  },
};
