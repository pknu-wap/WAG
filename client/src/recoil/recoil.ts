import { atom } from 'recoil';

/** 메인 화면 입장코드 모달 */
export const modalState = atom<boolean>({
  key: 'modalState',
  default: false,
});

/** 게임방 입장 시 닉네임 모달 (방장 제외) */
export const readyToGameModalState = atom<boolean>({
  key: 'gameModalState',
  default: false,
});

/** 방장 설정 모달 */
export const captainReadyToGameModalState = atom<boolean>({
  key: 'fromCaptain',
  default: false,
});

/** 헤더 규칙 모달 */
export const rulesModalState = atom<boolean>({
  key: 'rulesModalState',
  default: false,
});

/** 재시작 로딩 모달 */
export const loadingModalState = atom<boolean>({
  key: 'loadingModalState',
  default: false,
});

/** 게임 중 턴 당 시간(초). 방 정보 / TIMER 메시지로 갱신 */
export const ingameTimerCount = atom<number>({
  key: 'ingameTimerCount',
  default: 20,
});

/** 효과음 on/off (헤더 토글) */
export const soundEffectStatus = atom<boolean>({
  key: 'soundEffectStatus',
  default: true,
});
