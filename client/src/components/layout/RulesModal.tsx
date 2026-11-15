import { Modal } from '../../shared';
import { APP_VERSION } from '../../shared/config';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

const RULES = [
  '크롬 브라우저로 접속하시고, 방에 입장하시거나 방을 생성합니다.',
  '방장은 방의 모든 유저가 “준비 완료” 되면 시작이 가능합니다.',
  '게임 시작 시 유저마다 인물/캐릭터가 배당됩니다.',
  '자신의 턴에 질문과 정답이 각각 1번씩 가능합니다.',
  '다만, 1라운드에는 질문만 가능합니다!',
];

/** 헤더 책 아이콘 → 게임 설명 */
const RulesModal = ({ open, onClose }: RulesModalProps) => (
  <Modal open={open} onClose={onClose} size="md" label="게임 설명">
    <div className="flex flex-col items-center gap-5 py-2 sm:gap-4">
      <h2 className="text-2xl sm:text-[19px] font-bold text-balance">🎉 양세찬 게임을 즐기는 방법! 👍</h2>
      <ol className="flex flex-col gap-4 sm:gap-2 text-lg sm:text-[13px] leading-snug">
        {RULES.map((rule, i) => (
          <li key={i}>
            {i + 1}. {rule}
          </li>
        ))}
      </ol>
      <p className="text-sm sm:text-[11px] font-bold text-balance">⚠️ 편안한 게임 환경을 위해 Chrome 브라우저로 접속하시는 것을 권장드립니다</p>
      <p className="text-sm sm:text-[11px] font-bold">
        🙋 더 자세한 설명은{' '}
        <a className="italic underline" href="https://charming-scooter-24d.notion.site/d36c86d7665247e2bcf2a73a02e096b4" target="_blank" rel="noreferrer">
          이 링크
        </a>{' '}
        를 참고해주세요!
      </p>
      <footer className="mt-1 flex w-full justify-between text-base sm:text-sm">
        <span>© WAG!</span>
        <span>{APP_VERSION}</span>
      </footer>
    </div>
  </Modal>
);

export default RulesModal;
