// 서버 REST 응답 / 소켓 페이로드에 공통으로 쓰이는 DTO.
// 소켓 메시지 타입(JOIN, START ...)은 src/socket/types.ts 에 있습니다.

/** GET /nickname/possible */
export interface INicknamePossible {
  possible: boolean;
  nickName: string;
}

/** 방 참가자 (대기방) */
export interface IUserDto {
  captain: boolean;
  roomNickname: string;
  profileImage: string | null;
  ready: boolean;
}

/** GET /room/info, POST /room/create 응답 */
export interface IRoomResponseInfo {
  roomId: number;
  privateRoom: boolean;
  roomEnterCode: number;
  gameStatus: boolean;
  userCount: number;
  /** "전체" 또는 "lol,한국위인" 처럼 쉼표로 이어진 카테고리 */
  category: string;
  timer: number;
  /** 서로 이름 지어주기 모드 */
  customMode: boolean;
  userDtos: IUserDto[];
}

/** 게임 중 참가자 상태 (ChatGameMessage.gameUserDtos) */
export interface GameUserDto {
  captain: boolean;
  roomNickname: string;
  profileImage: string | null;
  penalty: number;
  myTurn: boolean;
  nextTurn: boolean;
  haveAnswerChance: boolean;
  ranking: number;
  /** END 메시지에서만 채워짐 */
  answername?: string;
  /** 서로 이름 지어주기 단계에서 내가 제시어를 정해 줄 상대 */
  namingTarget?: string | null;
}

/** GET /answer/list 의 항목 */
export interface AnswerUserDto {
  nickname: string;
  answer: string;
}
