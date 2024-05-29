import styled from 'styled-components';
import { ProgressTimerProps, TimerProps } from "../../types/common";

export const Container = styled.div<TimerProps>`
  animation: ${(props) =>
    props.time <= 5 && `shake 0.3s infinite linear`};
  position: relative;
  width: 75%;
  height: 2rem;

  @keyframes shake {
    0% {
      transform: translate(1px, 1px) rotate(0deg);
    }
    10% {
      transform: translate(-1px, -2px) rotate(-1deg);
    }
    20% {
      transform: translate(-3px, 0px) rotate(1deg);
    }
    30% {
      transform: translate(3px, 2px) rotate(0deg);
    }
    40% {
      transform: translate(1px, -1px) rotate(1deg);
    }
    50% {
      transform: translate(-1px, 2px) rotate(-1deg);
    }
    60% {
      transform: translate(-3px, 1px) rotate(0deg);
    }
    70% {
      transform: translate(3px, 1px) rotate(-1deg);
    }
    80% {
      transform: translate(-1px, -1px) rotate(1deg);
    }
    90% {
      transform: translate(1px, 2px) rotate(0deg);
    }
    100% {
      transform: translate(1px, -2px) rotate(-1deg);
    }
  }
`;

export const Time = styled.p`
  color: white;
  z-index: 10;
  font-weight : bold;
`;

export const Background = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #dcd6ff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
`;

export const Progress = styled.div<ProgressTimerProps>`
  transition: 0.3s width ease;
  width: ${(props) => (props.time / props.fulltime) * 100}%;
  height: 100%;
  position: absolute;
  background-color: #8377c9;
`;
