import axios from 'axios';
import { INicknamePossible } from '../types/dto';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * 닉네임 중복 확인
 * @param roomId - 방 ID
 * @param nickname - 확인할 닉네임
 * @returns 닉네임 사용 가능 여부
 */
export async function checkNicknamePossible(roomId: number, nickname: string): Promise<INicknamePossible> {
  try {
    const response = await axios.get<INicknamePossible>(`${API_URL}/nickname/possible`, {
      params: {
        roomId,
        nickname,
      },
    });
    return response.data;
  } catch (error) {
    console.error('닉네임 중복 확인 중 오류 발생:', error);
    throw error;
  }
}

/**
 * User API 객체
 */
export const userApi = {
  checkNicknamePossible,
};

export default userApi;
