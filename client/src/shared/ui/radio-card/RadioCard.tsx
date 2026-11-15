import classNames from 'classnames';

interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  className?: string;
}

/** 왼쪽에 라디오, 가운데에 라벨이 있는 선택 카드 (공개 / 비공개) */
const RadioCard = ({ name, value, label, checked, onChange, className }: RadioCardProps) => (
  <label
    className={classNames(
      'relative flex items-center justify-center h-[62px] sm:h-[51px] rounded-[3px] border border-black/50 dark:border-white/60 cursor-pointer select-none text-xl sm:text-base font-medium',
      className
    )}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="absolute left-4 w-[13px] h-[13px] border-black text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
    />
    <span>{label}</span>
  </label>
);

export default RadioCard;
