import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';

/**
 * 서버 REST 호출용 axios 인스턴스.
 * 실패 로그는 여기서 한 번만 남기므로 호출부에서 try/catch 로 console.error 를 반복하지 않습니다.
 */
export const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const method = error.config?.method?.toUpperCase() ?? '';
    const url = error.config?.url ?? '';
    const status = error.response?.status ?? error.message;
    console.error(`[API] ${method} ${url} 실패:`, status);
    return Promise.reject(error);
  }
);
