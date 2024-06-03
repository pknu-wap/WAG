import React from 'react';
import ReactSlider from 'react-slider';
interface SliderComponentProps {
  value: number;
  onChange: (value: number) => void;
}

const SliderComponent: React.FC<SliderComponentProps> = ({value, onChange}) => {

  return (
    <div className="flex flex-col items-center">
      <ReactSlider
        className="w-2/3 h-5 bg-light-btn dark:bg-dark-btn rounded-full"
        thumbClassName="w-10 h-5 bg-[#FFA07A] border-[4px] border-[#000000] dark:border-[#ffffff] rounded-full cursor-pointer"
        trackClassName="bg-blue-500 h-5 rounded-full"
        value={value}
        onChange={onChange}
        min={15}
        max={45}
      />
      <div className="mt-2 text-xl">{value}초</div>
    </div>
  );
};

export default SliderComponent;
