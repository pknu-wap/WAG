import * as Styled from './styled';
import { TimerProps } from "../../types/common";
function Timer({ time }: TimerProps): JSX.Element {
  return (
    <Styled.Container time={time}>
      <Styled.Background>
        <Styled.Time>{time}</Styled.Time>
      </Styled.Background>
      <Styled.Progress time={time} />
    </Styled.Container>
  );
}

export default Timer;
