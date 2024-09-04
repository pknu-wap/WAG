import { atom } from "recoil";

export const modalState = atom<boolean>({
  key: "modalState",
  default: false,
});

export const readyToGameModalState = atom<boolean>({
  key: "gameModalState",
  default: false,
});

export const captainReadyToGameModalState = atom<boolean>({
  key: 'fromCaptain',
  default: false
})

export const rulesModalState = atom<boolean>({
  key: "rulesModalState",
  default: false,
});

export const loadingModalState = atom<boolean>({
  key: "loadingModalState",
  default: false,
});

export const firstCategoryRecoil = atom<string>({
  key: "category",
  default: "전체"
})

export const timerCount = atom<number>({
  key: 'timerCount',
  default: 30
})

export let ingameTimerCount = atom<number>({
  key: 'ingameTimerCount',
  default: 20
})

export const soundEffectStatus = atom<boolean>({
  key: 'soundEffectStatus',
  default: true
})