import axios from 'axios';
import { UserAnswerDto, IGetAnswerList } from '../types/dto';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * 게임 답변 목록 조회 (자기 자신 제외)
 * @param roomId - 방 ID
 * @param nickname - 사용자 닉네임
 * @returns 답변 목록
 */
export async function getAnswerList(roomId: number, nickname: string): Promise<UserAnswerDto> {
  try {
    const response = await axios.get<UserAnswerDto>(`${API_URL}/answer/list`, {
      params: {
        roomId,
        nickname,
      },
    });
    return response.data;
  } catch (error) {
    console.error('답변 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 게임 답변 목록 조회 (IGetAnswerList 타입)
 * @param roomId - 방 ID
 * @param nickname - 사용자 닉네임
 * @returns 답변 목록
 */
export async function getGameAnswerList(roomId: string | number, nickname: string): Promise<IGetAnswerList> {
  try {
    const response = await axios.get<IGetAnswerList>(`${API_URL}/answer/list`, {
      params: {
        roomId,
        nickname,
      },
    });
    return response.data;
  } catch (error) {
    console.error('정답어 가져오기 중 오류 발생:', error);
    throw error;
  }
}

/**
 * Answer API 객체
 */
export const answerApi = {
  getAnswerList,
  getGameAnswerList,
};

export default answerApi;
