import { useEffect, useState } from "react";
import FullLayout from "../components/layout/FullLayout";

function Ranking() {
    const [size, setSize] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth <= 1024) {
            setSize(window.innerWidth);
        } else {
            setSize(1024)
        }
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
    console.log(size)
    return (
        <FullLayout>
            <div className="relative">
                {/* Bottom section with purple semi-circle */}
                <div className="w-full h-[96px] absolute -top-[96px] bg-[#6E11E2]"></div>
                <div 
                    style={{
                        width: '100%',
                        height: `${size/2}px`,
                        maxHeight: '1024px',
                        clipPath: 'ellipse(50% 50% at 50% 0%)'
                    }} 
                    className="absolute text-white max-w-5xl bg-[#6E11E2] overflow-hidden"
                >
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-[#ffffff] text-3xl font-bold">4등</h1>
                        <p className="text-[#ffffff] text-xl">Player Name</p>
                    </div>
                </div>
            </div>

            {/* List of players */}
            <div style={{height: `${size/3}px`}}>
            </div>
            <div className="m-auto w-3/4">
                <div className="w-full h-24 border-solid border-2 border-sky-500"></div>
            </div>
        </FullLayout>
    )
}

export default Ranking;