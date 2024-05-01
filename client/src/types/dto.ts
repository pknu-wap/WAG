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

// 방 정보 get response
export interface IRoomResponseInfo {
  gameStatus: boolean,
  privateRoom: boolean,
  roomEnterCode: Number,
  roomId: Number,
  userCount: Number,
  userDtos: Array<Object>,
}
