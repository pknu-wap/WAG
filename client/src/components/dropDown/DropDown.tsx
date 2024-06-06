// DropdownSelect.tsx
import React from 'react';
import Dropdown, { Option } from 'react-dropdown';
import 'react-dropdown/style.css';

const options = {
  gameCategories: [
    { value: '전체', label: '전체' },
    { value: 'WAP 임원진', label: "WAP 임원진"},
    { value: 'lol', label: 'lol' },
    { value: '한국위인', label: '한국위인' },
    { value: '유명인', label: '유명인' },
    { value: '애니메이션 캐릭터', label: '애니메이션 캐릭터' }
  ]
};

interface DropdownSelectProps {
  onOptionSelect: (option: Option) => void;
  defaultValue: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ onOptionSelect, defaultValue }) => {
  const handleChange = (option: Option) => {
    onOptionSelect(option);
  };

  return (
    <div>
      <Dropdown
        options={options.gameCategories}
        onChange={handleChange}
        value={defaultValue}
        placeholder="카테고리를 설정해주세요!"
      />
    </div>
  );
};

export default DropdownSelect;
