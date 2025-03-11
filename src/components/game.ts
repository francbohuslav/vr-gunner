import AFRAME, { Component } from "aframe";

const targetsPerRound = 5;
const startLives = 3;

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
  updateLives(): void;
  lives: number;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.round = {
      isRunning: false,
      impactCount: 0,
      startTime: 0,
    };
    this.lives = startLives;

    this.updateLives();
    this.updateMessage();
  },

  startRound(this: GameComponent) {
    this.round = {
      isRunning: true,
      impactCount: 0,
      startTime: new Date().getTime(),
    };
    this.lives = startLives;

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-entity");
    target.setAttribute("mixin", "mixin-target");
    target.setAttribute("target", {});
    scene.appendChild(target);
    this.updateLives();
    this.updateMessage();
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
    this.lives -= 1;
    if (this.lives === 0) {
      this.stopRound();
    }
    this.updateLives();
    this.updateMessage();
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
      if (this.lives === 0) {
        text = "Zemrel jsi, salate.";
      } else if (round.impactCount === 0) {
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

  updateLives(this: GameComponent) {
    console.log("updateLives", this.lives);
    for (let i = 1; i <= 3; i++) {
      document.getElementById("life-" + i)?.setAttribute("visible", (i <= this.lives).toString());
    }
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
