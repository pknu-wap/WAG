import type { PopoverContentProps } from "@material-tailwind/react";

const CustomPopoverContent: React.FC<PopoverContentProps> = (props) => {
  return <div className={props.className}>{props.children}</div>;
};

export default CustomPopoverContent;
