import { atom } from "recoil";

export const modalState = atom<boolean>({
  key: "modalState",
  default: false,
});

export const readyToGameModalState = atom<boolean>({
  key: "gameModalState",
  default: false,
});
