import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { soundEffectStatus } from '../../../recoil/recoil';

/** 효과음 파일 목록. 경로는 public/audio 기준 */
export const SOUNDS = {
  click: '/audio/button_click.mp3',
  correct: '/audio/correct_answer2.mp3',
  wrong: '/audio/blip03.mp3',
  question: '/audio/question.mp3',
  party: '/audio/yay.mp3',
  firework: '/audio/fireworkblast.mp3',
  boo: '/audio/fail.mp3',
  start: '/audio/start.mp3',
  gameStart: '/audio/startGame.mp3',
  warning: '/audio/warning.mp3',
  logoLight: '/audio/lightmode_wag.mp3',
  logoDark: '/audio/darkmode_wag.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

/**
 * 효과음 재생 함수를 돌려줍니다. 헤더의 효과음 on/off 상태를 따릅니다.
 *
 * @example
 * const play = useSound();
 * play('click');
 * play('party', 'firework'); // 동시에 여러 개
 */
export function useSound(): (...names: SoundName[]) => void {
  const enabled = useRecoilValue(soundEffectStatus);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return useCallback((...names: SoundName[]) => {
    if (!enabledRef.current) return;
    names.forEach((name) => {
      new Audio(SOUNDS[name]).play().catch(() => {
        /* 사용자 상호작용 전 자동재생 차단 등은 무시 */
      });
    });
  }, []);
}
