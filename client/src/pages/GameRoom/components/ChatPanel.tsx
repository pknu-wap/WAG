import { IconButton, TextField } from '../../../shared';
import ChatRoom from '../../../components/chatRoom/ChatRoom';
import { SocketMessage } from '../../../socket';

interface ChatPanelProps {
  messages: SocketMessage[];
  whoseTurn?: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  /** 방장 설정(톱니) 버튼 표시 */
  showSettings: boolean;
  onOpenSettings: () => void;
}

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-[22px] w-[22px]">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

/** 보라색 채팅 패널: 메시지 목록 + 하단 입력창 (방장은 왼쪽에 설정 톱니) */
const ChatPanel = ({ messages, whoseTurn, draft, onDraftChange, onSend, placeholder, showSettings, onOpenSettings }: ChatPanelProps) => (
  <div className="relative mt-5 h-[373px] rounded-[13px] bg-wag-panel shadow-wag sm:mt-8 sm:h-[359px]">
    <div className="absolute inset-x-0 top-0 bottom-[54px] overflow-y-auto scrollbar-thin px-3 pt-5 sm:px-4">
      <ChatRoom messages={messages} whoseTurn={whoseTurn} />
    </div>

    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 px-[6px] pb-[6px] sm:px-[2px] sm:pb-[2px]">
      {showSettings && (
        <IconButton look="plain" label="방 설정" onClick={onOpenSettings} className="text-black">
          <GearIcon />
        </IconButton>
      )}
      <div className="relative flex-1">
        <TextField
          rounded="lg"
          outlined
          className="h-10 pr-10 shadow-none"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button type="button" aria-label="보내기" onClick={onSend} className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-light-btn">
          <SendIcon />
        </button>
      </div>
    </div>
  </div>
);

export default ChatPanel;
