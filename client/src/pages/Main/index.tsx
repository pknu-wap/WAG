import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Button, Modal, TextField, Toast, Wrapper, GA_EVENT, trackEvent, roomApi, session, useSound } from '../../shared';
import FullLayout from '../../components/layout/FullLayout';
import { modalState } from '../../recoil/recoil';

const SOLO_GAME_URL = 'https://splendorous-conkies-8e58b1.netlify.app/';

function MainPage() {
  const navigate = useNavigate();
  const play = useSound();
  const [codeModalOpen, setCodeModalOpen] = useRecoilState(modalState);
  const [enterCode, setEnterCode] = useState('');
  const canSubmitCode = /^\d{4}$/.test(enterCode);

  // 메인으로 돌아오면 이전 방 정보는 버린다
  useEffect(() => {
    session.clearGame();
  }, []);

  const enterRoom = (roomId: string, code?: string) => {
    session.setRoomId(roomId);
    navigate(code ? `/GameRoom/${roomId}?code=${code}` : `/GameRoom/${roomId}`);
  };

  const handleRandomEnter = async () => {
    play('click');
    try {
      const result = await roomApi.findRandom();
      if (!result.ok) {
        Toast({ message: '입장 가능한 방이 없습니다. 방을 만들어 주세요!', type: 'error' });
        return;
      }
      trackEvent({ action: GA_EVENT.MAIN.QUICK_JOIN, category: 'main', label: result.roomId });
      enterRoom(result.roomId);
    } catch {
      Toast({ message: '서버와 연결하지 못했습니다. 잠시 후 다시 시도해주세요.', type: 'error' });
    }
  };

  const handleCodeEnter = async () => {
    play('click');
    if (!canSubmitCode) return;
    try {
      const result = await roomApi.findByEnterCode(Number(enterCode));
      if (!result.ok) {
        Toast({
          message: result.reason === 'ALREADY_STARTED' ? '이미 게임이 시작되었습니다!' : '존재하지 않는 입장코드 입니다!',
          type: 'error',
        });
        return;
      }
      trackEvent({ action: GA_EVENT.MAIN.INPUT_JOIN_ROOM, category: 'main', label: result.roomId });
      enterRoom(result.roomId, enterCode);
    } catch {
      Toast({ message: '서버와 연결하지 못했습니다. 잠시 후 다시 시도해주세요.', type: 'error' });
    }
  };

  const handleCreateRoom = () => {
    play('click');
    trackEvent({ action: GA_EVENT.MAIN.OPEN_CREATE_ROOM, category: 'main' });
    navigate('/CreateRoom');
  };

  const handleOpenCodeModal = () => {
    play('click');
    setEnterCode('');
    setCodeModalOpen(true);
  };

  const handleSoloGame = () => {
    trackEvent({ action: GA_EVENT.MAIN.SOLO_MODE, category: 'main' });
    window.open(SOLO_GAME_URL, '_self');
  };

  return (
    <Wrapper>
      <FullLayout>
        <img className="mx-auto mt-3 w-[260px] sm:mt-1 sm:w-[423px]" src="/images/yangSaeChanGame.png" alt="양세찬 게임" />

        <div className="mt-5 flex flex-col items-center gap-5 sm:mt-4 sm:gap-[17px]">
          <Button size="menu" onClick={handleRandomEnter}>
            랜덤 입장
          </Button>
          <Button size="menu" onClick={handleCreateRoom}>
            방 생성
          </Button>
          <Button size="menu" onClick={handleOpenCodeModal}>
            입장코드 입력
          </Button>
          <Button size="menu" onClick={handleSoloGame}>
            1인 미니게임
          </Button>
        </div>

        <Modal open={codeModalOpen} onClose={() => setCodeModalOpen(false)} size="sm" label="입장코드 입력">
          <div className="flex flex-col items-center">
            <h2 className="self-start text-5xl font-normal sm:text-4xl">JOIN</h2>
            <p className="mt-3 text-xl sm:mt-2 sm:text-base">입장코드 형식 : 랜덤 숫자 4자리</p>
            <TextField
              className="mt-4 h-[63px] sm:h-[39px]"
              inputMode="numeric"
              autoFocus
              value={enterCode}
              placeholder="입장코드를 숫자로 입력해주세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCodeEnter();
              }}
              onChange={(e) => {
                if (/^\d{0,4}$/.test(e.target.value)) setEnterCode(e.target.value);
              }}
            />
            <Button size="modal" className="mt-6 sm:mt-4" disabled={!canSubmitCode} onClick={handleCodeEnter}>
              {canSubmitCode ? '드가자' : '아직 멀었다'}
            </Button>
          </div>
        </Modal>
      </FullLayout>
    </Wrapper>
  );
}

export default MainPage;
