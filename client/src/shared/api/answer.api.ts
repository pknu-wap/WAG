import { apiInstance } from './instance';
import { AnswerUserDto } from '../../types/dto';

interface AnswerListResponse {
  answerUserDtos: AnswerUserDto[];
}

export const answerApi = {
  /**
   * 참가자별 정답어 목록. GET /answer/list
   * 요청한 본인의 정답어는 서버가 라운드에 따라 힌트(???, 글자 수, 초성)로 가려서 줍니다.
   */
  getAnswerList: (roomId: number, nickname: string) =>
    apiInstance
      .get<AnswerListResponse>('/answer/list', { params: { roomId, nickname } })
      .then((r) => r.data.answerUserDtos),
};

export default answerApi;
