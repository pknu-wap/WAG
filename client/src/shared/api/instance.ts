import axios from 'axios';
import { API_URL } from '../config';

/**
 * Axios 인스턴스 생성
 */
export const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiInstance.interceptors.request.use(
  (config) => {
    // 필요시 토큰 추가 등
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리
    return Promise.reject(error);
  }
);

