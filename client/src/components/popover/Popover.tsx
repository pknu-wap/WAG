// PopoverComponent.tsx
import React, { ReactNode } from 'react';
import Popover from 'react-popover';

interface PopoverComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  tooltipChildren: ReactNode;
}

const PopoverComponent: React.FC<PopoverComponentProps> = ({ isOpen, onToggle, children, tooltipChildren }) => {

  return (
    <div>
      <Popover
        isOpen={isOpen}
        onOuterAction={onToggle}
        place='below'
        body={ tooltipChildren }
      >
        { children }
      </Popover>
    </div>
  );
};

export default PopoverComponent;
