import { useQuery } from "react-query";
import { defaultInstance } from ".";
import { IGetRoomInfo } from "../types/dto";

// 방 정보 가져오기
const GetRoomInfoApi = async (params: IGetRoomInfo) => {
    const { data } = await defaultInstance.get('/room/info', { params });

    return data;
}

export const useGetRoomInfoQuery = (params: IGetRoomInfo) => {
    const { isLoading, error, data } = useQuery(['roomInfo', params], () => GetRoomInfoApi(params));

    return { isLoading, error, data };
}