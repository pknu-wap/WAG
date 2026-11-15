import ReactSlider from 'react-slider';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** 턴 당 진행시간 슬라이더 (15~45초). 보라 트랙에 주황 손잡이 */
const Slider = ({ value, onChange, min = 15, max = 45 }: SliderProps) => (
  <div className="flex flex-col items-center gap-2">
    <ReactSlider
      className="w-full max-w-[546px] h-[17px] rounded-full bg-light-btn dark:bg-dark-btn"
      thumbClassName="w-[33px] h-[17px] rounded-full bg-wag-thumb border-[3px] border-black cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-wag-askerText"
      trackClassName="h-[17px] rounded-full"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      ariaLabel="턴 당 진행시간"
    />
    <div className="text-xl sm:text-lg tabular-nums">{value}초</div>
  </div>
);

export default Slider;
