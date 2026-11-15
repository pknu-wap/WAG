import { apiInstance } from './instance';
import { INicknamePossible } from '../../types/dto';

export const userApi = {
  /** 방 안에서 닉네임이 겹치는지 확인. GET /nickname/possible */
  checkNickname: (roomId: number, nickname: string) =>
    apiInstance
      .get<INicknamePossible>('/nickname/possible', { params: { roomId, nickname } })
      .then((r) => r.data),
};

export default userApi;
