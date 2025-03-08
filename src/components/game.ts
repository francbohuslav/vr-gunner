import AFRAME, { Component } from "aframe";

const targetsPerRound = 5;

interface GameComponent extends Component {
  round: {
    isRunning: boolean;
    startTime: number;
    /** How many targets have been hit */
    impactCount: number;
  };
  startRound(): string;
  getTimeString(): string;
  targetHit(): void;
  updateMessage(): void;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.round = {
      isRunning: false,
      impactCount: 0,
      startTime: 0,
    };

    this.updateMessage();
  },

  startRound(this: GameComponent) {
    this.round = {
      isRunning: true,
      impactCount: 0,
      startTime: new Date().getTime(),
    };

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-sphere");
    target.setAttribute("target", {});
    scene.appendChild(target);
    this.updateMessage();
  },

  targetHit(this: GameComponent) {
    const round = this.round;
    round.impactCount++;
    if (round.impactCount === targetsPerRound) {
      round.isRunning = false;
      const scene = document.querySelector("a-scene")!;
      scene.removeChild(document.getElementById("target")!);
    }
    this.updateMessage();
  },

  updateMessage(this: GameComponent) {
    let text = "";
    const round = this.round;
    if (!round.isRunning) {
      if (round.impactCount === 0) {
        text = `Musis sestrelit ${targetsPerRound} cilu. Vystrel pro zacatek hry.`;
      } else {
        text = `Konec hry, tvuj cas je ${this.getTimeString()} sekund.\nStrel znova pro start`;
      }
    } else {
      if (round.impactCount === 0) {
        text = "Hrajes, strilej!!!";
      } else {
        text = `${round.impactCount}/${targetsPerRound} - ${this.getTimeString()}`;
      }
    }
    document.getElementById("text-score")?.setAttribute("value", text);
  },

  getTimeString(this: GameComponent) {
    return ((new Date().getTime() - this.round.startTime) / 1000).toFixed(3);
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    game: InstanceType<ComponentConstructor<GameComponent>>;
  }
}
