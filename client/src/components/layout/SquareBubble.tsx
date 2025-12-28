import { FullLayoutProps } from "../../types/common";

function SquareBubble({className,children }: FullLayoutProps) {
  return <div className={`area`}>
                <ul className="circles">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
            </ul>
            {children}
        </div>;
}

export default SquareBubble;
