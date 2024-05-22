import { faFire } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CreateTypes } from "canvas-confetti";
import { Component } from "react";
import ReactCanvasConfetti from "./Party";
import IconButton from "../button/IconButton";

export class Realistic extends Component {
  private isAnimationEnabled: boolean;
  private animationInstance: CreateTypes | null = null;

  constructor(props: {}) {
    super(props);
    this.isAnimationEnabled = false;
    this.fire = this.fire.bind(this);
  }

  componentDidMount(): void {
    this.handlerFire();
  }

  makeShot(particleRatio: number, opts: object) {
    this.animationInstance &&
      this.animationInstance({
        ...opts,
        origin: { y: 0.8 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }

  // 이 부분에서 사용하고 싶은 설정을 하면 된다.
  fire() {
    this.makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    this.makeShot(0.2, {
      spread: 20,
    });

    this.makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }
  handlerFire = () => {
    if (!this.isAnimationEnabled) {
      this.isAnimationEnabled = true;
    }
    requestAnimationFrame(this.fire);
    this.fire();
  };

  getInstance = (instance: CreateTypes | null) => {
    this.animationInstance = instance;
  };
  
  render() {
    return (
      <>
        <IconButton className="text-[red]" size="sm" onClick={this.handlerFire}>
          <FontAwesomeIcon className="text-[red]" icon={faFire} />
        </IconButton>
        <ReactCanvasConfetti
          refConfetti={this.getInstance}
          className="canvas"
        />
      </>
    );
  }
}
