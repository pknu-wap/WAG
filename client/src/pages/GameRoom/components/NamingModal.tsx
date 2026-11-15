import { useEffect, useState } from 'react';
import { Button, Modal, TextField } from '../../../shared';
import { NamingState } from '../hooks/useGameRoom';

interface NamingModalProps {
  state: NamingState;
  onSubmit: (word: string) => void;
}

/** 제시어 입력 제한 시간. 끝나면 빈 값을 보내고 서버가 랜덤 제시어로 채운다 */
export const NAMING_SECONDS = 10;

/** 서로 이름 지어주기: 내가 맡은 상대의 제시어를 정하는 모달 (게임 시작 전) */
const NamingModal = ({ state, onSubmit }: NamingModalProps) => {
  const [word, setWord] = useState('');
  const [left, setLeft] = useState(NAMING_SECONDS);

  useEffect(() => {
    if (!state.active) return;
    setWord('');
    setLeft(NAMING_SECONDS);
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [state.active]);

  // 시간이 다 되면 입력 여부와 상관없이 제출 (안 적었으면 서버가 랜덤으로 정함)
  useEffect(() => {
    if (state.active && !state.submitted && left === 0) onSubmit(word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  return (
    <Modal open={state.active} size="lg" label="서로 이름 지어주기" className="bg-light-modal">
      <div className="flex items-center justify-between">
        <h2 className="text-[25px] font-bold sm:text-[30px]">서로 이름 지어주기</h2>
        <span className="text-[23px] font-bold tabular-nums sm:text-[30px]">{left}초</span>
      </div>

      {state.submitted ? (
        <div className="flex flex-col items-center py-6 sm:py-8">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-light-btn dark:bg-dark-btn shadow-wag">
            <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={3} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-5 text-[23px] font-bold leading-snug">
            제시어 입력 완료!
            <br />
            게임시작을 기다려주세요
          </p>
          <p className="mt-4 text-lg text-wag-notice">남은시간 : {left}초</p>
          {state.pending > 0 && <p className="mt-1 text-sm text-wag-notice">아직 {state.pending}명 입력 중</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mt-5 font-galmuri14 text-xl sm:mt-6 sm:text-[30px]">{state.target ?? '상대'}님의 제시어를 정해주세요!</p>
          <TextField
            rounded="lg"
            autoFocus
            className="mt-5 h-[63px] max-w-[496px] text-base sm:mt-6 sm:h-[66px] sm:text-xl"
            placeholder="제시어를 입력해주세요"
            value={word}
            maxLength={20}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') onSubmit(word);
            }}
          />
          <Button size="modal" className="mt-5 sm:mt-4 sm:h-[52px] sm:w-[209px] sm:text-xl" onClick={() => onSubmit(word)}>
            확인
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default NamingModal;
