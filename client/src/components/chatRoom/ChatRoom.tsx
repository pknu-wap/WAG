import React, { useEffect, useRef } from 'react';
import { SocketMessage } from '../../socket';
import { session } from '../../shared/lib/session';
import { formatCategories } from '../../shared/lib/category';
import UserMessage from './UserMessage';
import NotificationMessage from './NotificationMessage';

interface ChatRoomProps {
  messages: SocketMessage[];
  /** 현재 질문자 닉네임. 질문자의 말풍선은 주황색으로 표시 */
  whoseTurn?: string;
}

/** 채팅 메시지 목록. 새 메시지가 오면 맨 아래로 스크롤합니다. */
const ChatRoom: React.FC<ChatRoomProps> = ({ messages, whoseTurn }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const myName = session.getNickname();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const notice = (key: number, ...lines: string[]) => (
    <div key={key} className="flex flex-col items-center gap-[3px]">
      {lines.map((line, i) => (
        <NotificationMessage key={i} content={line} />
      ))}
    </div>
  );

  const renderMessage = (msg: SocketMessage, index: number) => {
    switch (msg.messageType) {
      case 'CHAT':
      case 'ASK':
      case 'ANSWER': {
        if (msg.content === '') return null;
        const isMine = msg.sender === myName;
        return (
          <div key={index} className={isMine ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
            <UserMessage sender={msg.sender} content={msg.content} isMyMessage={isMine} askerMessage={msg.sender === whoseTurn} />
          </div>
        );
      }
      case 'CORRECT': {
        const senderDto = msg.gameUserDtos?.find((u) => u.roomNickname === msg.sender);
        if (!senderDto) return null;
        return senderDto.ranking !== 0
          ? notice(index, `${msg.sender}(이)가 "${msg.content}"(으)로 정답을 외쳤습니다.`, '========== 5초 뒤 다음 턴으로 넘어갑니다 ==========')
          : notice(index, `${msg.sender}(이)가 "${msg.content}"(으)로 오답을 외쳤습니다.`);
      }
      case 'CATEGORY':
        return notice(index, `카테고리가 ${formatCategories(msg.content)}(으)로 변경되었습니다.`);
      case 'TIMER':
        return notice(index, `턴 당 진행시간이 ${msg.content}초로 변경되었습니다.`);
      case 'CUSTOM':
        return notice(index, msg.content === 'true' ? '서로 이름 지어주기가 켜졌습니다.' : '서로 이름 지어주기가 꺼졌습니다.');
      case 'NAMING':
        return notice(index, '--------------------------', '서로 이름 지어주기!', '맡은 사람의 제시어를 10초 안에 정해주세요.');
      case 'NAME':
        return notice(index, `${msg.sender} 님이 제시어를 정했습니다. (남은 인원 ${msg.content}명)`);
      case 'START':
        return notice(index, '--------------------------', '5초 뒤에 게임이 시작됩니다.', '준비하세요!');
      case 'END':
        return notice(index, `${msg.sender}(이)가 "${msg.content}"(으)로 정답을 외쳤습니다.`, '정답자가 모두 나왔습니다', '5초 뒤 결과페이지로 이동합니다!');
      default:
        // JOIN / LEAVE / PENALTY / CANCEL / 서버 안내 등은 content 를 그대로 공지로 표시
        return msg.content ? notice(index, msg.content) : null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {messages.map(renderMessage)}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatRoom;
