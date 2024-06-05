import React from 'react';
import Button from '../components/button/Button';
import { ReadyStartButtonProps } from "../types/common";
  

  function ReadyStartButton({ myState, handleStart, handleReady, allReady}: ReadyStartButtonProps) {
  return (
    <div className=''>
      {myState?.isHost ? (
        <Button
            size='md'
            onClick={() => handleStart()}
            disabled={!allReady}
        >
          게임 시작
        </Button>
      ) : (
        <Button
            size='md'
            onClick={() => handleReady()}
        >
            {myState?.isReady ? '취소' : '준비 완료'}
        </Button>
      )}
    </div>
  );
}

export default ReadyStartButton;
