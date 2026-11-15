import { Button } from '../../../shared';

interface AnswerButtonProps {
  currentCycle: number;
  /** 이번 턴에 이미 정답을 외쳤는지 */
  used: boolean;
  onOpen: () => void;
}

/** 질문자에게만 보이는 "정답 맞추기" 버튼. 1라운드에는 잠겨 있다 */
const AnswerButton = ({ currentCycle, used, onOpen }: AnswerButtonProps) => {
  const locked = currentCycle <= 1;
  return (
    <div className="mt-6 flex flex-col items-center gap-1 sm:mt-4">
      <Button size="room" disabled={locked || used} onClick={onOpen}>
        정답 맞추기
      </Button>
      {locked && <span className="text-xs text-wag-placeholder dark:text-white/70">2라운드부터 입력 가능!</span>}
    </div>
  );
};

export default AnswerButton;
