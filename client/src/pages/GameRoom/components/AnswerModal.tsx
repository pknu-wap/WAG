import { useEffect, useState } from 'react';
import { Button, Modal, TextField } from '../../../shared';
import { AnswerModalState } from '../hooks/useGameRoom';

interface AnswerModalProps {
  state: AnswerModalState;
  /** 턴 남은 시간(초) */
  time: number;
  onSubmit: (word: string) => void;
  onClose: () => void;
}

const RESULT_AUTO_CLOSE_MS = 3500;

const RANK_MESSAGE: Record<number, string> = {
  1: '압도적 실력! 당신이 1등입니다!',
  2: '아쉬운 2등! 종이 한 장 차이였어요! 다음엔 1등 도전?',
  3: '휴, 3등으로 통과했어요!',
};

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7 sm:h-[26px] sm:w-[26px]">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M12 7v5l3 2" />
  </svg>
);

const ResultIcon = ({ correct }: { correct: boolean }) => (
  <div className={`flex h-[100px] w-[100px] items-center justify-center rounded-full sm:h-[72px] sm:w-[72px] ${correct ? 'bg-wag-success' : 'bg-wag-cross'}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="h-14 w-14 sm:h-10 sm:w-10">
      {correct ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />}
    </svg>
  </div>
);

/** 정답 입력 모달. 서버 판정이 오면 같은 모달에 결과를 보여주고 잠시 후 닫힌다 */
const AnswerModal = ({ state, time, onSubmit, onClose }: AnswerModalProps) => {
  const [word, setWord] = useState('');

  useEffect(() => {
    if (state.open) setWord('');
  }, [state.open]);

  useEffect(() => {
    if (!state.result) return;
    const id = window.setTimeout(onClose, RESULT_AUTO_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [state.result, onClose]);

  const renderInput = () => (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 font-bold text-light-btn dark:text-dark-btn">
        <ClockIcon />
        <span className="text-3xl tabular-nums sm:text-[23px]">{Math.max(time, 0)}초</span>
        <span className="text-xl font-medium sm:text-[15px]">남음</span>
      </div>
      <h2 className="mt-4 text-[32px] font-medium sm:mt-3 sm:text-[25px]">정답을 입력해주세요</h2>
      <p className="mt-1 text-xl sm:text-[15px]">시간 안에 입력해주세요!</p>
      <TextField
        rounded="md"
        autoFocus
        className="mt-5 h-[63px] sm:mt-4 sm:h-10"
        placeholder="정답을 입력하세요"
        value={word}
        disabled={state.submitting}
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') onSubmit(word);
        }}
      />
      <Button size="modal" className="mt-6 sm:mt-4" disabled={state.submitting} onClick={() => onSubmit(word)}>
        {state.submitting ? '확인 중…' : '정답 확인하기'}
      </Button>
      <Button size="modal" className="mt-4 sm:mt-3" disabled={state.submitting} onClick={onClose}>
        아직 모르겠다
      </Button>
    </div>
  );

  const renderResult = () => {
    const { correct, ranking } = state.result!;
    return (
      <div className="flex flex-col items-center py-6 sm:py-4">
        <ResultIcon correct={correct} />
        <h2 className="mt-8 text-[32px] font-medium sm:mt-6 sm:text-[25px]">{correct ? '정답을 외쳤습니다!' : '오답을 외쳤습니다!'}</h2>
        <p className="mt-3 max-w-[280px] text-xl text-balance sm:mt-2 sm:text-[15px]">
          {correct ? RANK_MESSAGE[ranking] ?? `${ranking}등으로 통과했어요!` : '다음 라운드에서 다시 도전해보세요!'}
        </p>
      </div>
    );
  };

  return (
    <Modal open={state.open} onClose={state.submitting ? undefined : onClose} size="sm" label="정답 맞추기">
      {state.result ? renderResult() : renderInput()}
    </Modal>
  );
};

export default AnswerModal;
