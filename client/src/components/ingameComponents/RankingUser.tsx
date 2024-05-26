import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface RankingUserProps {
    roomNickname: string;
    answer?: string;
    ranking: number;
}

function RankingUser({roomNickname, answer, ranking}: RankingUserProps) {

    return (
    <div className="w-full h-16 border-b-2 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start">
            {ranking === 1 ? (
                <div className="mr-5">
                    <img className="w-14 h-14" src="/images/1st.png" alt="1st"></img>
                </div>
            ) : ranking === 2 ? (
                <div className="mr-7">
                    <img className="w-12 h-12" src="/images/2nd.png" alt="2nd"></img>
                </div>
            ) : ranking === 3 ? (
                <div className="mr-8">
                    <img className="w-11 h-11" src="/images/3rd.png" alt="3rd"></img>
                </div>
            ) : (
                <div className="mr-9 pl-2">
                    <img className="w-8 h-8" src="/images/others.png" alt="others"></img>
                </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-light-btn dark:bg-dark-btn mr-5 flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} size="xl" />
            </div>
            <div className="mr-5">{roomNickname}</div>
        </div>
        <div>{answer}</div>
    </div>
    )
}

export default RankingUser