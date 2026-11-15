import { useEffect, useState } from 'react';
import { userApi, session, useSound } from '../../../shared';

export type NicknameStatus = 'idle' | 'checking' | 'ok' | 'bad';

const MAX_NICKNAME_LENGTH = 9;

/** 입장 모달의 닉네임 입력 + 중복 검사 (GET /nickname/possible) */
export function useNicknameCheck(roomId: number) {
  const play = useSound();
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState<NicknameStatus>('idle');

  // 닉네임을 고치면 다시 검사해야 한다
  useEffect(() => {
    setStatus('idle');
  }, [nickname]);

  const check = async () => {
    play('click');
    if (nickname === '' || nickname.includes(' ') || nickname.length > MAX_NICKNAME_LENGTH) {
      setStatus('bad');
      return;
    }
    setStatus('checking');
    try {
      const result = await userApi.checkNickname(roomId, nickname);
      if (result.possible) session.setNickname(result.nickName);
      setStatus(result.possible ? 'ok' : 'bad');
    } catch {
      setStatus('idle');
    }
  };

  return { nickname, setNickname, status, check };
}
