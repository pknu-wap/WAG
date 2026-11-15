import { apiInstance } from './instance';
import { IRoomResponseInfo } from '../../types/dto';

export interface CreateRoomRequest {
  privateRoom: boolean;
  userNickName: string;
  /** "전체" 또는 "lol,한국위인" 처럼 쉼표로 이어진 카테고리 */
  category: string;
  timer: number;
  /** 서로 이름 지어주기 모드 */
  customMode: boolean;
}

/**
 * 서버가 roomId 대신 상태 문자열("invalid enterCode" 등)을 돌려주는 엔드포인트의 결과.
 * 호출부는 문자열 비교 대신 `ok` 와 `reason` 으로 분기합니다.
 */
export type RoomLookupResult =
  | { ok: true; roomId: string }
  | { ok: false; reason: 'INVALID_CODE' | 'ALREADY_STARTED' | 'NO_AVAILABLE_ROOM' };

const LOOKUP_FAILURES: Record<string, Extract<RoomLookupResult, { ok: false }>['reason']> = {
  'invalid enterCode': 'INVALID_CODE',
  'already started': 'ALREADY_STARTED',
  'no available room': 'NO_AVAILABLE_ROOM',
};

function toLookupResult(raw: string | number): RoomLookupResult {
  const reason = LOOKUP_FAILURES[String(raw)];
  return reason ? { ok: false, reason } : { ok: true, roomId: String(raw) };
}

export const roomApi = {
  /** 방 생성 (방장). POST /room/create */
  create: (body: CreateRoomRequest) =>
    apiInstance.post<IRoomResponseInfo>('/room/create', body).then((r) => r.data),

  /** 방 정보 + 참가자 목록. GET /room/info */
  getInfo: (roomId: number) =>
    apiInstance.get<IRoomResponseInfo>('/room/info', { params: { roomId } }).then((r) => r.data),

  /** 입장코드로 roomId 찾기. GET /roomId/code */
  findByEnterCode: (enterCode: number) =>
    apiInstance.get<string>('/roomId/code', { params: { enterCode } }).then((r) => toLookupResult(r.data)),

  /** 랜덤 입장 가능한 방의 roomId. GET /roomId */
  findRandom: () => apiInstance.get<string>('/roomId').then((r) => toLookupResult(r.data)),

  /** 선택 가능한 제시어 카테고리 목록 ("전체" 제외). GET /categories */
  getCategories: () => apiInstance.get<string[]>('/categories').then((r) => r.data),
};

export default roomApi;
