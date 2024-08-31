// 규칙!!!!!!
// API type : type 이름 앞에 "I" 붙이기
// 소켓 객체 type : 그냥 이름만

import { UserInfo } from "os";

export const URL = "https://wwwag-backend.co.kr/ws";

// 닉네임 중복확인 get response
export interface INicknamePossible {
  possible: boolean;
  nickName: string;
}

// 닉네임 get
export interface IGetNickname {
  nickname: string;
}

// 코드로 방 입장
export interface IGetRoomIdCode {
  roomId?: string;
}

// 방 생성
export interface IRoomCreate {
  isPrivateRoom: boolean;
  userNickName: string;
}

export interface IUserDto {
  captain: boolean;
  roomNickname: string;
  profileImage: string;
  ready: boolean;
}

// 방 정보 get response
export interface IRoomResponseInfo {
  roomId: number;
  privateRoom: boolean;
  roomEnterCode: number;
  gameStatus: boolean;
  userCount: number;
  category: string;
  timer: number;
  userDtos: IUserDto[];
}

// 방장 외 유저 JOIN 시 받는 값
export interface ChatMessageJoin {
  messageType: string;
  content: string;
  sender: string;
  roomId: number;
  roomResponse: IRoomResponseInfo;
}

// 방장 JOIN 시 받는 값
export interface ChatMessageCaptainJoin {
  content: string | null;
  messageType: string;
  roomId: number;
  sender: string;
}

export interface ReadyUserDto {
  roomNickname: string;
  profileImage: null;
  captain: boolean;
  ready: boolean;
}

// READY 시 받는 값
export interface ChatReadyMessage {
  content: string;
  messageType: string;
  roomId: number;
  sender: string;
  userDtos: ReadyUserDto[]
}

//소켓으로 주고받는 채팅 객체
export interface ChatMessage {
  messageType: string;
  sender: string; // 사용자 이름
  content: string; // 메시지 텍스트
  roomId: number;
  isPrivateRoom: boolean; 
  gameUserDtos?: GameUserDto[];
}

export interface JoinUser {
  userNickName: string;
  userProfile: string;
}

export interface GameUserDto {
  captain: boolean;
  roomNickname: string;
  profileImage: string;
  penalty: number;
  myTurn: boolean;
  answername?: string;
  nextTurn: boolean;
  haveAnswerChance: boolean;
  ranking: number;
  ready: boolean;
}
// 게임 중 채팅 객체
export interface GameMessage {
  messageType: string;
  content: string;
  sender: string;
  roomId: number;
  gameEnd: boolean;
  cycle: number;
  gameUserDtos: GameUserDto[];
}


//김준서 : 이것도 정답어 get 게임중 화면에 띄워주는데 필요
export interface UserAnswerDto {
  answerUserDtos: AnswerUserDto[];
}

export interface AnswerUserDto {
  nickname: string;
  answer: string;
}
// 정답어 get
export interface IGetAnswerList {
  answerUserDtos: AnswerUserDto[];
}
