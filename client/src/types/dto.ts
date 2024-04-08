// 닉네임 중복확인 get response
export interface INicknamePossible {
    isPossible: boolean;
    nickName: string
}

// 닉네임 get
export interface IGetNickname {
    nickName: string;
}

// 방 정보 get
export interface IGetRoomInfo {
    nickname: string;
}

interface IUserDto {
    isCaptain: boolean;
    userNickname: string;
    profileImage: string;
}

// 방 정보 get response
export interface IGetRoomInfoResponse {
    roomId: number;
    isPrivateRoom: boolean;
    roomEnterCode: number;
    gameStatus: boolean;
    useCount: number;
    userList: {
        userDto: IUserDto
    }[]
}