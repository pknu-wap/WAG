import { useEffect, useState } from "react";
import FullLayout from "../components/layout/FullLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import Realistic from "../components/party/Realistic";

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
    return (
        <FullLayout>
            <div className="relative">
                {/* Bottom section with purple semi-circle */}
                <div className="w-full h-[96px] absolute -top-[96px] bg-light-btn dark:bg-dark-btn"></div>
                <div 
                    style={{
                        width: '100%',
                        height: `${size/2}px`,
                        maxHeight: '1024px',
                        clipPath: 'ellipse(50% 50% at 50% 0%)'
                    }} 
                    className="absolute text-white max-w-5xl bg-light-btn dark:bg-dark-btn overflow-hidden"
                >
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-[#ffffff] pt-0 text-3xl font-bold">4등</h1>
                        <p className="text-[#ffffff] text-xl">Player Name</p>
                    </div>
                </div>
            </div>

            {/* List of players */}
            <div style={{height: `${size/3}px`}}>
            </div>
            <div className="m-auto w-3/4">
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mr-5">
                        <img className="w-14 h-14" src="images/1st.png" alt="1st"></img>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                    <Realistic />
                </div>
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mr-7">
                        <img className="w-12 h-12" src="images/2nd.png" alt="1st"></img>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                    <Realistic />
                </div>
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mr-8">
                        <img className="w-11 h-11" src="images/3rd.png" alt="1st"></img>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                    <Realistic />
                </div>
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mx-4 mr-[50px]"> 4 </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                </div>
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mx-4 mr-[50px]"> 5 </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                </div>
                <div className="w-full h-16 border-b-2 flex flex-row items-center justify-start">
                    <div className="mx-4 mr-[50px]"> 6 </div>
                    <div className="w-10 h-10 rounded-lg bg-[#B9B7C7] mr-5 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} size="xl" />
                    </div>
                    <div>User Name</div>
                </div>
            </div>
            <Realistic />
        </FullLayout>
    )
}

export default Ranking;