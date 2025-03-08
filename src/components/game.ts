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
  stopRound(): void;
  getTimeString(): string;
  targetHit(): void;
  playerHit(): void;
  updateMessage(): void;
  lifes: number;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.round = {
      isRunning: false,
      impactCount: 0,
      startTime: 0,
    };
    this.lifes = 3;

    this.updateMessage();
  },

  startRound(this: GameComponent) {
    this.round = {
      isRunning: true,
      impactCount: 0,
      startTime: new Date().getTime(),
    };
    this.lifes = 3;

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-sphere");
    target.setAttribute("target", {});
    scene.appendChild(target);
    this.updateMessage();
    document.getElementById("text-life")?.setAttribute("value", ``);
  },

  targetHit(this: GameComponent) {
    const round = this.round;
    round.impactCount++;
    if (round.impactCount === targetsPerRound) {
      this.stopRound();
    }
    this.updateMessage();
  },

  playerHit(this: GameComponent) {
    if (!this.round.isRunning) {
      return;
    }
    this.lifes -= 1;
    if (this.lifes > 1) {
      document.getElementById("text-life")?.setAttribute("value", `Mas jeste ${this.lifes} zivoty.`);
    } else if (this.lifes === 1) {
      document.getElementById("text-life")?.setAttribute("value", `Mas posledni zivot.`);
    } else {
      document.getElementById("text-life")?.setAttribute("value", `Konec hry.`);
      this.stopRound();
    }
  },

  stopRound(this: GameComponent) {
    const round = this.round;
    round.isRunning = false;
    const target = document.getElementById("target");
    target?.parentNode?.removeChild(document.getElementById("target")!);
  },

  updateMessage(this: GameComponent) {
    let text = "";
    const round = this.round;
    if (!round.isRunning) {
      if (round.impactCount === 0) {
        text = `Musis sestrelit ${targetsPerRound} cilu.`;
      } else {
        text = `Konec hry, tvuj cas je ${this.getTimeString()} sekund.`;
      }
      text += `\nZmáčkni (A) pro zacatek hry.`;
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
