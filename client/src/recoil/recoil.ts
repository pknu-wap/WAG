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

export const timerCount = atom<number>({
  key: 'timerCount',
  default: 30
})

export let ingameTimerCount = atom<number>({
  key: 'ingameTimerCount',
  default: 20
})