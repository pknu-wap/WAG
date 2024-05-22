import { useEffect, useState } from "react";
import FullLayout from "../components/layout/FullLayout";
import Button from "../components/button/Button";
import { Realistic } from "../components/party/Realistic";
import RankingUser from "../components/ingameComponents/RankingUser";

function Ranking() {
    const [size, setSize] = useState(window.innerWidth);
    const myName = localStorage.getItem("nickName");
    const [showConfetti, setShowConfetti] = useState(false);
    const [myRank, setMyRank] = useState<number>()

    const gameResultDummyData = {
        messageType: "END",
        content: "",
        sender: myName,
        roomId: 15,
        gameEnd: true,
        cycle: 5,
        userCount: 6,
        resultUserDtos: [
            {
                roomNickname: "종경",
                profileImage: "d",
                answerName: "string",
                ranking: 1
            },
            {
                roomNickname: "gd",
                profileImage: "d",
                answerName: "string",
                ranking: 2
            },
            {
                roomNickname: "김준",
                profileImage: "d",
                answerName: "string",
                ranking: 3
            },
            {
                roomNickname: "홍준",
                profileImage: "d",
                answerName: "string",
                ranking: 4
            },
            {
                roomNickname: "규빈",
                profileImage: "d",
                answerName: "string",
                ranking: 5
            },
            {
                roomNickname: "ㅎㅇ",
                profileImage: "d",
                answerName: "string",
                ranking: 6
            },
        ]
    }

    const haveParty = () => {
        gameResultDummyData.resultUserDtos.forEach((user) => {
            if (user.roomNickname === myName) {
                setMyRank(user.ranking);
                if (user.ranking <= 3) {
                    setShowConfetti(true);
                }
            }
        });
    }

    useEffect(() => {
        haveParty();
    }, []);
    console.log(myName, myRank)
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
                        <h1 className="text-[#ffffff] pt-0 text-3xl font-bold">{myRank}등</h1>
                        <p className="text-[#ffffff] text-xl">{myName}</p>
                    </div>
                </div>
            </div>

            {/* List of players */}
            <div style={{height: `${size/3}px`}}>
            </div>
            <div className="m-auto w-3/4">
                {showConfetti && <div className="flex text-[#FF0000] justify-center"><Realistic /></div>}
                {gameResultDummyData.resultUserDtos.map((user, index) => {
                    return (
                        <RankingUser 
                        key={index}
                        roomNickname={user.roomNickname} 
                        answerName={user.answerName} 
                        ranking={user.ranking}/>
                    )
                })}
            </div>
            <div className="m-auto grid-cols-1 md:grid-cols-2 mt-5 gap-2">
                <Button className="mr-5 mb-5" size="sm">재시작</Button>
                <Button className="mr-5 mb-5" size="sm">게임 종료</Button>
            </div>
        </FullLayout>
    )
}

export default Ranking;
