// 닉네임 중복확인 get
export interface INicknamePossibleParams {
  roomId: number;
  nickname?: string;
}

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
export interface IGetRoomIdCodeParams {
  enterCode?: number;
}
export interface IGetRoomIdCode {
  roomId: number;
}

//소켓으로 주고받는 채팅 객체
export interface ChatMessage {
  messageType : string
  sender: string; // 사용자 이름
  content: string; // 메시지 텍스트
  roomId : number;
  isPrivateRoom : boolean;
}