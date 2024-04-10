import { useQuery } from "react-query";
import { defaultInstance, unAxiosDefaultInstance } from ".";
import { IGetNickname } from "../types/dto";

// 닉네임 가져오기
const GetNicknameApi = async (params: IGetNickname) => {
    const token: string | null = localStorage.getItem('token');

    const isValidToken = token && token !== '';
    if (isValidToken) {
        // (토큰 있는)랜덤방에서 사용됨
        const { data } = await defaultInstance.get('/guestbook', { params });

        return data;
    } else {
        // (토큰 없는)비공개방에서 사용됨
        const { data } = await unAxiosDefaultInstance.get('/guestbook', { params });

        return data;
    }
}

export const useGetNicknameQuery = (params: IGetNickname) => {
    const { isLoading, error, data } = useQuery(['nickname', params], () => GetNicknameApi(params));

    return { isLoading, error, data }
}

// 닉네임 중복 확인
const GetNicknamePossibleApi = async (params: IGetNickname) => {
    const token: string | null = localStorage.getItem('token');

    const isValidToken = token && token !== '';
    if (isValidToken) {
        // (토큰 있는)랜덤방에서 사용됨
        const { data } = await defaultInstance.get('/nickname', { params });
        return data
    } else {
        // (토큰 없는)비공개방에서 사용됨
        const { data } = await unAxiosDefaultInstance.get('/nickname', { params });
        return data
    }
}
export const useGetNicknamePossibleQuery = (params: IGetNickname) => {
    const { isLoading, error, data } = useQuery(['nicknameCheck', params], () => GetNicknamePossibleApi(params));

    return { isLoading, error, data }
}