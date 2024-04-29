import { useQuery } from "react-query";
import { unAxiosDefaultInstance } from ".";
import { IGetRoomIdCodeParams } from "../types/dto";

// 방 정보 가져오기
const GetRoomIdCodeApi = async (params: IGetRoomIdCodeParams) => {
  const { data } = await unAxiosDefaultInstance.get("/room/info", { params });

  return data;
};

export const useGetRoomIdCodeQuery = (params: IGetRoomIdCodeParams) => {
  const { isLoading, error, data } = useQuery(["roomInfo", params], () =>
    GetRoomIdCodeApi(params)
  );

  return { isLoading, error, data };
};

// 참여코드로 입장
