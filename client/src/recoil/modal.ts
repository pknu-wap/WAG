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

export const celebrateCount = atom<number>({
  key: 'celebrate',
  default: 0
})