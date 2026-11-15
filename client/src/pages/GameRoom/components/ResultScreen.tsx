import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../../shared';
import { Realistic } from '../../../components/party/Realistic';
import { GameUserDto } from '../../../types/dto';

interface ResultScreenProps {
  myRank?: number;
  myName: string | null;
  showConfetti: boolean;
  users: GameUserDto[];
  onRestart: () => void;
  onExit: () => void;
}

const MEDALS: Record<number, string> = { 1: '/images/1st.png', 2: '/images/2nd.png', 3: '/images/3rd.png' };

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} strokeLinecap="round" className="h-7 w-7 text-wag-cross">
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

/** 게임 종료 후 순위 화면: 상단 보라(다크: 핑크) 배너 + 순위 목록 */
const ResultScreen = ({ myRank, myName, showConfetti, users, onRestart, onExit }: ResultScreenProps) => (
  <div className="relative">
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-[-150px] -z-[1] h-[300px] w-[140vw] -translate-x-1/2 rounded-[50px] bg-light-banner dark:bg-dark-banner sm:top-[-130px] sm:h-[350px] sm:w-[859px]"
    />
    <div className="text-white">
      <h1 className="text-[25px] font-bold text-balance sm:text-[26px]">{myRank ? `${myRank}등` : '순위권에 들지 못했습니다'}</h1>
      <p className="text-lg sm:text-[17px]">{myName}</p>
    </div>

    <div className="mt-[95px] flex h-[38px] items-center justify-center sm:mt-[170px]">{showConfetti && <Realistic />}</div>

    <ul className="mx-auto mt-4 w-full max-w-[644px] sm:mt-2">
      {users.map((user) => (
        <li key={user.roomNickname} className="flex h-[57px] items-center border-b border-black/10 dark:border-white/20 sm:h-[51px]">
          <div className="flex h-[47px] w-[47px] shrink-0 items-center justify-center">
            {MEDALS[user.ranking] ? <img src={MEDALS[user.ranking]} alt={`${user.ranking}등`} className="h-[47px] w-[47px]" /> : <CrossIcon />}
          </div>
          <div className="ml-6 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[7px] bg-light-btn text-black dark:bg-dark-btn sm:ml-4">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <span className="ml-5 truncate text-base sm:ml-4 sm:text-sm">{user.roomNickname}</span>
          <span className="ml-auto truncate text-base sm:text-sm">{user.answername}</span>
        </li>
      ))}
    </ul>

    <div className="mt-6 flex justify-center gap-[22px] sm:mt-4 sm:gap-[18px]">
      <Button size="result" onClick={onRestart}>
        재시작하기
      </Button>
      <Button size="result" onClick={onExit}>
        메인페이지로 가기
      </Button>
    </div>
  </div>
);

export default ResultScreen;
