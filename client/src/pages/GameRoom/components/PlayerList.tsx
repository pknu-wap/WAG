import { useEffect, useState } from 'react';
import { IconButton } from '../../../shared';
import { AnswerUserDto, GameUserDto, IUserDto } from '../../../types/dto';
import PlayerAvatar from './PlayerAvatar';

interface PlayerListProps {
  users: IUserDto[];
  readyUsers: IUserDto[];
  gameStart: boolean;
  gameUserDtos: GameUserDto[];
  answers: AnswerUserDto[];
  whoseTurn?: string;
  myName: string | null;
  onPenalty: (nickname: string) => void;
}

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

/** 참가자 아바타 목록. PC 는 한 줄로 펼치고, 모바일은 한 명씩 넘겨 본다 */
const PlayerList = ({ users, readyUsers, gameStart, gameUserDtos, answers, whoseTurn, myName, onPenalty }: PlayerListProps) => {
  const [index, setIndex] = useState(0);

  // 입장/퇴장으로 목록이 바뀌면 내 아바타가 보이게
  useEffect(() => {
    const mine = users.findIndex((u) => u.roomNickname === myName);
    setIndex(mine >= 0 ? mine : 0);
  }, [users.length, myName]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderAvatar = (user: IUserDto) => {
    const gameUser = gameUserDtos.find((u) => u.roomNickname === user.roomNickname);
    const ranking = gameUser?.ranking ?? 0;
    return (
      <PlayerAvatar
        key={user.roomNickname}
        nickname={user.roomNickname}
        isCaptain={user.captain}
        ready={readyUsers.find((u) => u.roomNickname === user.roomNickname)?.ready ?? false}
        gameStart={gameStart}
        answer={answers.find((a) => a.nickname === user.roomNickname)?.answer}
        isAsker={gameStart && user.roomNickname === whoseTurn}
        penalty={gameUser?.penalty ?? 0}
        ranking={ranking}
        canPenalize={gameStart && user.roomNickname !== myName && ranking === 0}
        onPenalty={onPenalty}
      />
    );
  };

  const count = users.length;
  const current = count ? users[Math.min(index, count - 1)] : undefined;

  return (
    <>
      {/* PC */}
      <div className="hidden min-h-[97px] items-start justify-around sm:flex">{users.map(renderAvatar)}</div>

      {/* 모바일: 한 명씩 */}
      <div className="flex min-h-[89px] items-center justify-between px-[70px] sm:hidden">
        <IconButton look="arrow" label="이전 참가자" disabled={count <= 1} onClick={() => setIndex((i) => (i - 1 + count) % count)} className="disabled:opacity-40">
          <ChevronLeft />
        </IconButton>
        {current ? renderAvatar(current) : <div className="w-[80px]" />}
        <IconButton look="arrow" label="다음 참가자" disabled={count <= 1} onClick={() => setIndex((i) => (i + 1) % count)} className="disabled:opacity-40">
          <ChevronRight />
        </IconButton>
      </div>
    </>
  );
};

export default PlayerList;
