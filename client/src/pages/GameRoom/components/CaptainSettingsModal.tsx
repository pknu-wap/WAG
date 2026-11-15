import { Button, Modal, MultiSelect, RadioCard, Slider, Toggle } from '../../../shared';
import { RoomSettings } from '../hooks/useRoomSettings';

interface CaptainSettingsModalProps {
  open: boolean;
  isMeCaptain: boolean;
  isPrivateRoom?: boolean;
  settings: RoomSettings;
  onClose: () => void;
}

const SectionTitle = ({ children, caption }: { children: string; caption?: string }) => (
  <div className="mt-8 sm:mt-6">
    <h3 className="text-xl font-bold sm:text-lg">{children}</h3>
    {caption && <p className="text-xs text-wag-muted">{caption}</p>}
  </div>
);

/** 방장 설정 모달: 공개/비공개 · 서로 이름 지어주기 · 카테고리(복수) · 턴 당 시간 */
const CaptainSettingsModal = ({ open, isMeCaptain, isPrivateRoom, settings, onClose }: CaptainSettingsModalProps) => (
  <Modal open={open} onClose={onClose} size="md" label="방장 기능">
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold sm:text-2xl">방장 기능</h2>
      <p className="mt-4 font-galmuri14 text-xl sm:mt-3 sm:text-base">
        현재 방 상태 : {isPrivateRoom ? <span className="text-wag-bad">비공개방</span> : <span className="text-wag-ok">공개방</span>}
      </p>

      {!isMeCaptain ? (
        <p className="mt-8 text-base">나는 방장이 아니니깐 할 수 있는게 없어</p>
      ) : (
        <>
          <div className="mt-6 flex w-full flex-col gap-3 sm:mt-5">
            <RadioCard name="roomPrivacy" value="public" label="공개" checked={settings.wantPrivate === false} onChange={() => settings.setWantPrivate(false)} />
            <RadioCard name="roomPrivacy" value="private" label="비공개" checked={settings.wantPrivate === true} onChange={() => settings.setWantPrivate(true)} />
          </div>
          <Button size="setting" className="mt-5 sm:mt-4" disabled={!settings.canChangePrivacy} onClick={settings.applyPrivacy}>
            {isPrivateRoom ? '공개방으로 변경' : '비공개방으로 변경'}
          </Button>

          <SectionTitle>서로 이름 지어주기</SectionTitle>
          <Toggle className="mt-3" checked={settings.wantCustom} onChange={settings.setWantCustom} label="서로 이름 지어주기" />
          <Button size="setting" className="mt-4" disabled={!settings.canChangeCustom} onClick={settings.applyCustom}>
            {settings.canChangeCustom ? '변경' : '커스텀으로 변경할래?'}
          </Button>

          {!settings.wantCustom && (
            <>
              <SectionTitle caption="복수선택가능">게임 카테고리 설정</SectionTitle>
              <MultiSelect className="mt-3 w-full" options={settings.categoryOptions} value={settings.selectedCategories} onChange={settings.setSelectedCategories} />
              <Button size="setting" className="mt-4" disabled={!settings.canChangeCategory} onClick={settings.applyCategory}>
                {settings.canChangeCategory ? '변경' : '카테고리 변경할래?'}
              </Button>
            </>
          )}

          <SectionTitle>턴 당 진행시간</SectionTitle>
          <div className="mt-3 w-full">
            <Slider value={settings.sliderValue} onChange={settings.setSliderValue} />
          </div>
          <Button size="setting" className="mt-4" disabled={!settings.canChangeTimer} onClick={settings.applyTimer}>
            {settings.canChangeTimer ? '변경' : '시간 바꿀래?'}
          </Button>
        </>
      )}
    </div>
  </Modal>
);

export default CaptainSettingsModal;
