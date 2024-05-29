import * as Styled from './styled';
import { TimerProps } from "../../types/common";
import { useRecoilState } from 'recoil';
import { ingameTimerCount } from '../../recoil/recoil';
function Timer({ time }: TimerProps): JSX.Element {
  const [ingameTimerRecoil, ] = useRecoilState(ingameTimerCount)
  return (
    <Styled.Container time={time}>
      <Styled.Background>
        <Styled.Time>{time}</Styled.Time>
      </Styled.Background>
      <Styled.Progress time={time} fulltime={ingameTimerRecoil} />
    </Styled.Container>
  );
}

export default Timer;
