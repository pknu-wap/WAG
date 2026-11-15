import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  MultiSelect,
  RadioCard,
  Slider,
  TextField,
  Toast,
  Toggle,
  Wrapper,
  GA_EVENT,
  trackEvent,
  roomApi,
  session,
  useSound,
  joinCategories,
  FALLBACK_CATEGORIES,
} from '../../shared';
import FullLayout from '../../components/layout/FullLayout';

const DEFAULT_TIMER_SECONDS = 30;
const MAX_NICKNAME_LENGTH = 9;

const isValidNickname = (nickname: string) => nickname !== '' && !nickname.includes(' ') && nickname.length <= MAX_NICKNAME_LENGTH;

const Label = ({ children, caption }: { children: string; caption?: string }) => (
  <div className="mb-3 sm:mb-2">
    <div className="text-base font-bold sm:text-[13px]">{children}</div>
    {caption && <div className="text-xs text-wag-muted sm:text-[10px]">{caption}</div>}
  </div>
);

function CreateRoom() {
  const navigate = useNavigate();
  const play = useSound();
  const [isPrivate, setIsPrivate] = useState(false);
  const [customMode, setCustomMode] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORIES);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timer, setTimer] = useState(DEFAULT_TIMER_SECONDS);
  const [nickname, setNickname] = useState('');

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

  const createRoom = async () => {
    play('click');
    if (!isValidNickname(nickname)) {
      Toast({ message: '닉네임은 공백 없이 9자 이내로 입력해주세요!', type: 'warn' });
      return;
    }
    const category = customMode ? joinCategories([]) : joinCategories(selectedCategories);

    trackEvent({
      action: GA_EVENT.CREATE_ROOM.SUBMIT_CREATE,
      category: 'create_room',
      label: `nickname: ${nickname}, category: ${category}, timer: ${timer}, private: ${isPrivate}, custom: ${customMode}`,
    });

    try {
      const room = await roomApi.create({ privateRoom: isPrivate, userNickName: nickname, category, timer, customMode });
      session.setNickname(nickname);
      session.setRoomId(room.roomId);
      // 방장은 닉네임 모달 없이 바로 소켓에 연결한다 (GameRoom 이 state.isCaptin 으로 판단)
      navigate(`/GameRoom/${room.roomId}`, { state: { isCaptin: true, roomId: room.roomId } });
    } catch {
      Toast({ message: '방을 만들지 못했습니다. 잠시 후 다시 시도해주세요.', type: 'error' });
    }
  };

  return (
    <Wrapper>
      <FullLayout className="sm:max-w-[821px]">
        <h1 className="mt-6 text-[44px] font-medium sm:mt-2 sm:text-[50px]">방 만들기</h1>

        <section className="mt-10 sm:mt-12">
          <Label>방 공개 / 비공개 여부 선택</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-[7px]">
            <RadioCard name="roomType" value="public" label="공개" checked={!isPrivate} onChange={() => setIsPrivate(false)} />
            <RadioCard name="roomType" value="private" label="비공개" checked={isPrivate} onChange={() => setIsPrivate(true)} />
          </div>
        </section>

        <section className="mt-8 sm:mt-6">
          <Label>서로 이름 지어주기</Label>
          <Toggle checked={customMode} onChange={setCustomMode} label="서로 이름 지어주기" />
        </section>

        {!customMode && (
          <section className="mt-8 sm:mt-6">
            <Label caption="복수선택가능">게임 카테고리 설정</Label>
            <MultiSelect options={categoryOptions} value={selectedCategories} onChange={setSelectedCategories} />
          </section>
        )}

        <section className="mt-8 sm:mt-6">
          <Label>턴 당 진행시간</Label>
          <Slider value={timer} onChange={setTimer} />
        </section>

        <TextField
          className="mx-auto mt-6 h-12 max-w-[615px] sm:mt-6 sm:h-[39px]"
          placeholder="닉네임을 입력해주세요"
          value={nickname}
          maxLength={MAX_NICKNAME_LENGTH}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') createRoom();
          }}
        />

        <Button size="wide" className="mt-10 sm:mt-14" onClick={createRoom}>
          {isPrivate ? '비공개방 생성' : '공개방 생성'}
        </Button>
      </FullLayout>
    </Wrapper>
  );
}

export default CreateRoom;
