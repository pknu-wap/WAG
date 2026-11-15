import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Modal, Wrapper, useSound } from '../../shared';
import FullLayout from '../../components/layout/FullLayout';
import { captainReadyToGameModalState, loadingModalState, readyToGameModalState } from '../../recoil/recoil';
import { useGameRoom } from './hooks/useGameRoom';
import { useNicknameCheck } from './hooks/useNicknameCheck';
import { useRoomSettings } from './hooks/useRoomSettings';
import { useLeaveGuard } from './hooks/useLeaveGuard';
import LoadingSpinner from './components/LoadingSpinner';
import PlayerList from './components/PlayerList';
import TimerBar from './components/TimerBar';
import RoomStatusBar from './components/RoomStatusBar';
import ChatPanel from './components/ChatPanel';
import LobbyActions from './components/LobbyActions';
import AnswerButton from './components/AnswerButton';
import AnswerModal from './components/AnswerModal';
import NamingModal from './components/NamingModal';
import ResultScreen from './components/ResultScreen';
import JoinNicknameModal from './components/JoinNicknameModal';
import CaptainSettingsModal from './components/CaptainSettingsModal';

/**
 * 게임방: 대기방 → (서로 이름 지어주기) → 게임 → 결과.
 * 상태/소켓 로직은 hooks/useGameRoom, 화면 조각은 components/ 에 있습니다.
 */
const GameRoom = () => {
  const { room, players, chat, game, result, actions } = useGameRoom();
  const nicknameCheck = useNicknameCheck(room.roomId);
  const settings = useRoomSettings({
    category: room.category,
    customMode: room.customMode,
    isPrivateRoom: room.isPrivateRoom,
    ingameTimer: room.ingameTimer,
    setIsPrivateRoom: room.setIsPrivateRoom,
    closeModal: actions.closeCaptainModal,
  });
  useLeaveGuard(room.enterCode !== undefined);

  const joinModalOpen = useRecoilValue(readyToGameModalState);
  const captainModalOpen = useRecoilValue(captainReadyToGameModalState);
  const loadingModalOpen = useRecoilValue(loadingModalState);
  const navigate = useNavigate();
  const location = useLocation();
  const play = useSound();

  const handleJoin = () => {
    play('click');
    actions.connect();
    actions.closeJoinModal();
  };

  const chatPlaceholder = !game.gameStart ? '채팅 메시지를 입력해주세요' : game.isMyTurn ? '질문을 시작하세요' : '답변을 시작하세요';

  return (
    <Wrapper>
      <FullLayout>
        {result.isGameEnd ? (
          <ResultScreen
            myRank={result.myRank}
            myName={result.myName}
            showConfetti={result.showConfetti}
            users={game.gameUserDtos}
            onRestart={actions.restart}
            onExit={actions.exit}
          />
        ) : (
          <>
            <PlayerList
              users={players.joinUsers}
              readyUsers={players.readyUsers}
              gameStart={game.gameStart}
              gameUserDtos={game.gameUserDtos}
              answers={game.answers}
              whoseTurn={game.currentUserAnswer?.nickname}
              myName={result.myName}
              onPenalty={actions.sendPenalty}
            />

            {game.gameStart && <TimerBar time={game.time} total={room.ingameTimer} />}

            <RoomStatusBar
              gameStart={game.gameStart}
              enterCode={room.enterCode}
              currentCycle={game.currentCycle}
              countdown={game.countdown}
              currentUserAnswer={game.currentUserAnswer}
              category={room.category}
              customMode={room.customMode}
              userCount={players.joinUsers.length}
            />

            <ChatPanel
              messages={chat.messages}
              whoseTurn={game.currentUserAnswer?.nickname}
              draft={chat.draft}
              onDraftChange={chat.setDraft}
              onSend={chat.send}
              placeholder={chatPlaceholder}
              showSettings={!game.gameStart && room.isMeCaptain}
              onOpenSettings={actions.openCaptainModal}
            />

            {game.countdown === null && !game.gameStart && (
              <LobbyActions
                isHost={room.isMeCaptain}
                isReady={players.isReady}
                allReady={players.allReady}
                namingActive={game.naming.active}
                onStart={actions.startGame}
                onReady={actions.toggleReady}
                onCancelNaming={actions.cancelNaming}
                onExit={actions.exit}
              />
            )}

            {game.gameStart && game.isMyTurn && <AnswerButton currentCycle={game.currentCycle} used={game.hasSentCorrect} onOpen={actions.openAnswerModal} />}
          </>
        )}

        <JoinNicknameModal
          open={joinModalOpen}
          nickname={nicknameCheck.nickname}
          status={nicknameCheck.status}
          onNicknameChange={nicknameCheck.setNickname}
          onCheck={nicknameCheck.check}
          onJoin={handleJoin}
          onClose={() => navigate((location.state as { from?: string } | null)?.from || '/')}
        />

        <CaptainSettingsModal open={captainModalOpen} isMeCaptain={room.isMeCaptain} isPrivateRoom={room.isPrivateRoom} settings={settings} onClose={actions.closeCaptainModal} />

        <NamingModal state={game.naming} onSubmit={actions.submitName} />

        <AnswerModal state={game.answerModal} time={game.time} onSubmit={actions.submitAnswer} onClose={actions.closeAnswerModal} />

        <Modal open={loadingModalOpen} size="sm" label="재시작 중">
          <LoadingSpinner />
        </Modal>
      </FullLayout>
    </Wrapper>
  );
};

export default GameRoom;
