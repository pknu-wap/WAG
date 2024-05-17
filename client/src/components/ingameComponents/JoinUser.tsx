import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../button/IconButton";
import { faUser } from "@fortawesome/free-regular-svg-icons";

const JoinUser: React.FC<{ Nickname: string }> = ({ Nickname }) => {
  return (
    <div className="flex flex-col items-center relative">
      <IconButton
        size="lg"
        className="items-center bg-light-btn dark:bg-dark-btn relative"
      >
        <FontAwesomeIcon icon={faUser} size="xl" />
      </IconButton>
      <div className="mt-2">{Nickname}</div>
      <div className="w-0 h-6 mt-1 rounded-md bg-[#9FDDFF]"></div>
    </div>
  );
};

export default JoinUser;
