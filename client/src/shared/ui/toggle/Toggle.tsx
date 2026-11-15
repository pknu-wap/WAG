import classNames from 'classnames';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
}

/** ON/OFF 알약 토글 (서로 이름 지어주기) */
const Toggle = ({ checked, onChange, label, className }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={classNames(
      'relative inline-flex items-center w-[136px] h-[39px] rounded-full font-bold text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wag-askerText',
      checked ? 'bg-light-btn dark:bg-dark-btn text-light-bg' : 'bg-wag-toggleOff text-white',
      className
    )}
  >
    <span
      className={classNames(
        'absolute top-[5px] w-[29px] h-[29px] rounded-full transition-all',
        checked ? 'left-[100px] bg-light-bg' : 'left-[6px] bg-white'
      )}
    />
    <span className={classNames('w-full', checked ? 'pr-8' : 'pl-8')}>{checked ? 'ON' : 'OFF'}</span>
  </button>
);

export default Toggle;
