import { Button } from '../../../shared';

interface LobbyActionsProps {
  isHost: boolean;
  isReady: boolean;
  allReady: boolean;
  /** 서로 이름 지어주기(제시어 입력) 단계 진행 중 */
  namingActive: boolean;
  onStart: () => void;
  onReady: () => void;
  onCancelNaming: () => void;
  onExit: () => void;
}

/** 대기방 하단: 게임 나가기 + 준비/시작 버튼. 모바일은 준비 버튼이 위, PC 는 나가기가 왼쪽 */
const LobbyActions = ({ isHost, isReady, allReady, namingActive, onStart, onReady, onCancelNaming, onExit }: LobbyActionsProps) => {
  const renderPrimary = () => {
    if (namingActive) {
      return (
        <Button size="room" disabled={!isHost} onClick={onCancelNaming}>
          취소
        </Button>
      );
    }
    if (isHost) {
      return (
        <Button size="room" disabled={!allReady} onClick={onStart}>
          게임 시작
        </Button>
      );
    }
    return (
      <Button size="room" onClick={onReady}>
        {isReady ? '취소' : '준비 완료'}
      </Button>
    );
  };

  return (
    <div className="mt-5 flex flex-col items-center gap-[19px] sm:mt-4 sm:flex-row sm:justify-between sm:px-[90px]">
      <div className="order-2 sm:order-1">
        <Button size="room" onClick={onExit}>
          게임 나가기
        </Button>
      </div>
      <div className="order-1 sm:order-2">{renderPrimary()}</div>
    </div>
  );
};

export default LobbyActions;
