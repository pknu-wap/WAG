import { formatCategories } from '../../../shared';
import { AnswerUserDto } from '../../../types/dto';

interface RoomStatusBarProps {
  gameStart: boolean;
  enterCode?: number;
  currentCycle: number;
  countdown: number | null;
  currentUserAnswer?: AnswerUserDto;
  category: string;
  customMode: boolean;
  userCount: number;
}

const MAX_USERS = 6;

/** 입장코드(또는 라운드) · 가운데 상태 박스 · 방 인원 */
const RoomStatusBar = ({ gameStart, enterCode, currentCycle, countdown, currentUserAnswer, category, customMode, userCount }: RoomStatusBarProps) => {
  const renderCenter = () => {
    if (countdown !== null) return <div className="text-xl font-bold tabular-nums">{countdown}</div>;
    if (gameStart) {
      return (
        <>
          <div>
            현재 질문자 : <span className="text-[17px] text-wag-askerText">{currentUserAnswer?.nickname}</span>
          </div>
          <div>
            정답어 : <span className="text-[17px] text-wag-answerText">{currentUserAnswer?.answer}</span>
          </div>
        </>
      );
    }
    return (
      <>
        <div>게임 대기 중</div>
        <div>{customMode ? '서로 이름 지어주기' : `카테고리 : ${formatCategories(category)}`}</div>
      </>
    );
  };

  return (
    <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:mt-7 sm:gap-4">
      <div className="text-left text-base leading-tight sm:text-sm">
        {gameStart ? (
          <>
            <div>현재</div>
            <div>라운드</div>
            <div className="text-lg tabular-nums sm:text-[17px]">{currentCycle}</div>
          </>
        ) : (
          <>
            <div>입장코드</div>
            <div className="text-[26px] tabular-nums sm:text-[17px]">{enterCode ?? ''}</div>
          </>
        )}
      </div>

      <div className="flex h-[66px] flex-col items-center justify-center rounded-[13px] bg-wag-status px-3 text-base font-bold leading-snug text-black shadow-wag sm:h-[53px] sm:rounded-[9px] sm:text-[14px]">
        {renderCenter()}
      </div>

      <div className="text-left text-base leading-tight sm:text-sm">
        <div>방 인원</div>
        <div className="text-lg tabular-nums sm:text-[17px]">
          {userCount}/{MAX_USERS}
        </div>
      </div>
    </div>
  );
};

export default RoomStatusBar;
