import classNames from 'classnames';

interface TimerBarProps {
  time: number;
  total: number;
}

/** 턴 타이머. 5초 이하면 흔들린다 */
const TimerBar = ({ time, total }: TimerBarProps) => {
  const pct = total > 0 ? Math.max(0, Math.min(100, (time / total) * 100)) : 0;
  return (
    <div
      role="timer"
      aria-label={`남은 시간 ${time}초`}
      className={classNames('relative mt-4 h-[31px] w-full overflow-hidden bg-wag-timerTrack shadow-wag sm:mt-6 sm:h-[27px]', time <= 5 && time >= 0 && 'animate-shake')}
    >
      <div className="absolute inset-y-0 left-0 bg-wag-timerFill transition-[width] duration-300 ease-linear" style={{ width: `${pct}%` }} />
      <span className="relative z-10 flex h-full items-center justify-center text-[15px] font-bold tabular-nums text-white">{Math.max(time, 0)}</span>
    </div>
  );
};

export default TimerBar;
