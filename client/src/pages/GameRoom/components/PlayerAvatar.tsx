import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { Button } from '../../../shared';
import PopoverComponent from '../../../components/popover/Popover';

export interface PlayerAvatarProps {
  nickname: string;
  isCaptain: boolean;
  ready: boolean;
  gameStart: boolean;
  /** 게임 중 아바타 위에 보이는 정답어 (내 것은 힌트) */
  answer?: string;
  /** 현재 질문자면 주황색 */
  isAsker: boolean;
  penalty: number;
  ranking: number;
  /** 아바타를 눌러 경고를 줄 수 있는지 (게임 중, 남, 아직 정답 못 맞힘) */
  canPenalize: boolean;
  onPenalty: (nickname: string) => void;
}

const MEDALS: Record<number, string> = { 1: '/images/1st.png', 2: '/images/2nd.png', 3: '/images/3rd.png' };
const card = 'w-[10px] h-[18px] rounded-[3px] border border-black/25';

/** 참가자 한 명: 정답어 라벨 · 아바타 원 · 이름 · 경고 카드 · 순위 메달 */
const PlayerAvatar = ({ nickname, isCaptain, ready, gameStart, answer, isAsker, penalty, ranking, canPenalize, onPenalty }: PlayerAvatarProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 경고가 반영되면 열려 있던 팝오버를 닫는다
  useEffect(() => {
    setPopoverOpen(false);
  }, [penalty]);

  const color = isAsker
    ? 'bg-wag-asker'
    : gameStart || isCaptain || ready
    ? 'bg-light-btn dark:bg-dark-btn'
    : 'bg-wag-idle';
  const medal = ranking >= 1 && ranking <= 3 ? MEDALS[ranking] : null;
  const cards = medal ? 0 : penalty;

  const avatar = (
    <button
      type="button"
      disabled={!canPenalize}
      onClick={() => setPopoverOpen((v) => !v)}
      aria-label={canPenalize ? `${nickname}에게 경고 주기` : nickname}
      className={classNames(
        'relative flex h-[49px] w-[49px] items-center justify-center rounded-full text-black shadow-wag sm:h-[52px] sm:w-[52px]',
        color,
        canPenalize ? 'cursor-pointer active:scale-95' : 'cursor-default'
      )}
    >
      <FontAwesomeIcon icon={faUser} className="text-[26px]" />

      {cards === 1 && <span className={classNames(card, 'absolute -right-2 bottom-0 bg-wag-card')} aria-label="경고 1회" />}
      {cards === 2 && (
        <span className="absolute -right-3 bottom-0 flex" aria-label="경고 2회">
          <span className={classNames(card, 'bg-wag-card -rotate-12')} />
          <span className={classNames(card, 'bg-wag-card rotate-12 -ml-1')} />
        </span>
      )}
      {cards >= 3 && <span className={classNames(card, 'absolute -right-2 bottom-0 bg-wag-bad')} aria-label="경고 3회" />}

      {medal && <img src={medal} alt={`${ranking}등`} className="absolute -bottom-1 -right-3 h-9 w-9" />}
    </button>
  );

  return (
    <div className="flex w-[80px] flex-col items-center">
      <div className="h-[19px] text-sm font-bold text-wag-asker sm:text-[14px]">{gameStart ? answer ?? '' : ''}</div>
      <div className="mt-[2px]">
        {canPenalize ? (
          <PopoverComponent
            isOpen={popoverOpen}
            onToggle={() => setPopoverOpen(false)}
            tooltipChildren={
              <Button size="chip" onClick={() => onPenalty(nickname)}>
                경고 주기
              </Button>
            }
          >
            {avatar}
          </PopoverComponent>
        ) : (
          avatar
        )}
      </div>
      <div className="mt-[5px] max-w-full truncate text-sm sm:text-[14px]">{nickname}</div>
    </div>
  );
};

export default PlayerAvatar;
