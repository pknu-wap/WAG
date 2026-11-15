import { Button, Modal, TextField } from '../../../shared';
import { NicknameStatus } from '../hooks/useNicknameCheck';

interface JoinNicknameModalProps {
  open: boolean;
  nickname: string;
  status: NicknameStatus;
  onNicknameChange: (value: string) => void;
  onCheck: () => void;
  onJoin: () => void;
  onClose: () => void;
}

const STATUS_TEXT: Record<NicknameStatus, { text: string; className: string }> = {
  idle: { text: '닉네임을 검사해주세요!', className: 'text-wag-hint' },
  checking: { text: '확인 중...', className: 'text-wag-hint' },
  ok: { text: '사용 가능!', className: 'text-wag-ok' },
  bad: { text: '사용 불가한 닉네임입니다!', className: 'text-wag-bad' },
};

/** 방장이 아닌 참가자가 입장할 때 닉네임을 정하는 모달 */
const JoinNicknameModal = ({ open, nickname, status, onNicknameChange, onCheck, onJoin, onClose }: JoinNicknameModalProps) => {
  const statusText = STATUS_TEXT[status];
  return (
    <Modal open={open} size="md" label="닉네임 입력">
      <div className="flex flex-col items-center">
        <h2 className="self-start text-5xl font-normal sm:text-4xl">JOIN</h2>
        <TextField
          className="mt-5 h-[63px] sm:mt-4 sm:h-[39px]"
          autoFocus
          placeholder="닉네임을 입력해주세요"
          value={nickname}
          maxLength={9}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              if (status === 'ok') onJoin();
              else onCheck();
            }
          }}
          onChange={(e) => onNicknameChange(e.target.value)}
        />
        <p className={`mt-3 text-xl sm:mt-2 sm:text-sm ${statusText.className}`} role="status">
          {statusText.text}
        </p>

        <Button size="modal" className="mt-4 sm:mt-3" onClick={onCheck} disabled={status === 'checking'}>
          닉네임 확인
        </Button>
        <Button size="modal" className="mt-4 sm:mt-3" disabled={status !== 'ok'} onClick={onJoin}>
          {status === 'ok' ? '드가자' : '아직 멀었다'}
        </Button>
        <Button variant="ghost" className="mt-4 text-xl sm:mt-3 sm:text-base" onClick={onClose}>
          닫자
        </Button>
      </div>
    </Modal>
  );
};

export default JoinNicknameModal;
