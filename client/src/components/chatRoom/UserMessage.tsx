import React from 'react';
import classNames from 'classnames';

interface UserMessageProps {
  sender: string;
  content: string;
  /** 내가 보낸 메시지면 오른쪽 정렬 */
  isMyMessage?: boolean;
  /** 질문자의 메시지면 주황 말풍선 + 스피커 아이콘 */
  askerMessage?: boolean;
}

const SpeakerIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
    />
  </svg>
);

/** 참가자 말풍선 (대기방 채팅, 질문, 답변) */
const UserMessage: React.FC<UserMessageProps> = ({ sender, content, isMyMessage, askerMessage }) => {
  const lines = content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));

  return (
    <>
      <span className="flex items-center gap-1 text-sm text-light-text dark:text-dark-text">
        {askerMessage && isMyMessage && <SpeakerIcon className="h-[17px] w-[17px] -scale-x-100" />}
        {sender}
        {askerMessage && !isMyMessage && <SpeakerIcon className="h-[17px] w-[17px]" />}
      </span>
      <span
        className={classNames(
          'inline-block max-w-[80%] break-words rounded-[8px] px-[10px] py-[1px] text-left text-sm',
          isMyMessage ? 'rounded-tr-none' : 'rounded-tl-none',
          askerMessage ? 'bg-wag-asker text-black' : 'bg-light-chat text-black dark:bg-dark-chat dark:text-white'
        )}
      >
        {lines}
      </span>
    </>
  );
};

export default UserMessage;
