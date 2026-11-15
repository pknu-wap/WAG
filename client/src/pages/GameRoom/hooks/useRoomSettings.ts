import { useEffect, useState } from 'react';
import { Toast, useSound, parseCategories, joinCategories, FALLBACK_CATEGORIES, roomApi } from '../../../shared';
import { gameSocket } from '../../../socket';

interface Params {
  category: string;
  customMode: boolean;
  isPrivateRoom?: boolean;
  ingameTimer: number;
  setIsPrivateRoom: (next: boolean | undefined) => void;
  closeModal: () => void;
}

/**
 * 방장 설정 모달: 공개/비공개, 서로 이름 지어주기, 카테고리(복수), 턴 당 시간.
 * 화면에서 고른 값(선택)과 방의 현재 값을 비교해 "변경" 버튼 활성 여부를 정합니다.
 */
export function useRoomSettings({ category, customMode, isPrivateRoom, ingameTimer, setIsPrivateRoom, closeModal }: Params) {
  const play = useSound();
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseCategories(category));
  const [wantCustom, setWantCustom] = useState(customMode);
  const [sliderValue, setSliderValue] = useState(ingameTimer);
  const [wantPrivate, setWantPrivate] = useState<boolean | undefined>(isPrivateRoom);

  useEffect(() => {
    roomApi
      .getCategories()
      .then((list) => {
        if (list.length) setCategoryOptions(list);
      })
      .catch(() => {
        /* 실패하면 기본 목록 유지 */
      });
  }, []);

  // 방의 현재 값이 바뀌면 선택값도 거기에 맞춘다
  useEffect(() => setSelectedCategories(parseCategories(category)), [category]);
  useEffect(() => setWantCustom(customMode), [customMode]);
  useEffect(() => setSliderValue(ingameTimer), [ingameTimer]);
  useEffect(() => setWantPrivate(isPrivateRoom), [isPrivateRoom]);

  const canChangeCategory = joinCategories(selectedCategories) !== joinCategories(parseCategories(category));
  const canChangeCustom = wantCustom !== customMode;
  const canChangeTimer = sliderValue !== ingameTimer;
  const canChangePrivacy = wantPrivate !== undefined && wantPrivate !== isPrivateRoom;

  const applyCategory = () => {
    play('click');
    if (!canChangeCategory) Toast({ message: '기존 카테고리 입니다!', type: 'warn' });
    else gameSocket.sendCategory(joinCategories(selectedCategories));
    closeModal();
  };

  const applyCustom = () => {
    play('click');
    gameSocket.sendCustomMode(wantCustom);
    closeModal();
  };

  const applyTimer = () => {
    play('click');
    gameSocket.sendTimer(sliderValue);
    closeModal();
  };

  const applyPrivacy = () => {
    play('click');
    gameSocket.sendChangeMode();
    setIsPrivateRoom(wantPrivate); // CHANGE 메시지가 오면 서버 값으로 다시 맞춰진다
  };

  return {
    categoryOptions,
    selectedCategories,
    setSelectedCategories,
    wantCustom,
    setWantCustom,
    sliderValue,
    setSliderValue,
    wantPrivate,
    setWantPrivate,
    canChangeCategory,
    canChangeCustom,
    canChangeTimer,
    canChangePrivacy,
    applyCategory,
    applyCustom,
    applyTimer,
    applyPrivacy,
  };
}

export type RoomSettings = ReturnType<typeof useRoomSettings>;
