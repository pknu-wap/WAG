import axios from 'axios';
import { IRoomResponseInfo } from '../types/dto';

const API_URL = process.env.REACT_APP_API_URL;

/**
 * 방 생성
 * @param data - 방 생성 정보
 * @returns 생성된 방 정보
 */
export async function createRoom(data: {
  privateRoom: boolean;
  userNickName: string;
  category: string;
  timer: number;
}): Promise<IRoomResponseInfo> {
  try {
    const response = await axios.post<IRoomResponseInfo>(`${API_URL}/room/create`, data);
    return response.data;
  } catch (error) {
    console.error('방 생성 요청 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 입장코드로 방 ID 조회
 * @param enterCode - 입장 코드
 * @returns 방 ID 문자열 (또는 "invalid enterCode", "already started")
 */
export async function getRoomIdByCode(enterCode: number): Promise<string> {
  try {
    const response = await axios.get<string>(`${API_URL}/roomId/code`, {
      params: { enterCode },
    });
    // 서버가 단순 문자열을 반환하므로 response.data를 그대로 반환
    return response.data;
  } catch (error) {
    console.error('입장코드로 방 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 방 정보 조회
 * @param roomId - 방 ID
 * @returns 방 정보
 */
export async function getRoomInfo(roomId: number): Promise<IRoomResponseInfo> {
  try {
    const response = await axios.get<IRoomResponseInfo>(`${API_URL}/room/info`, {
      params: { roomId },
    });
    return response.data;
  } catch (error) {
    console.error('방 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 랜덤 방 ID 조회 (빠른 입장)
 * @returns 방 ID 문자열 (또는 "no available room")
 */
export async function getRandomRoomId(): Promise<string> {
  try {
    const response = await axios.get<string>(`${API_URL}/roomId`);
    return response.data;
  } catch (error) {
    console.error('랜덤 방 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * Room API 객체
 */
export const roomApi = {
  createRoom,
  getRoomIdByCode,
  getRoomInfo,
  getRandomRoomId,
};

export default roomApi;
