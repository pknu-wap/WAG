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
