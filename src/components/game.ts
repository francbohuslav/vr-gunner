import AFRAME, { Component } from "aframe";

const rounds = 5;

interface GameComponent extends Component {
  impactCount: number;
  startTime: number;
  getTimeString(): string;
  targetHit(): void;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.impactCount = -1;
  },

  targetHit(this: GameComponent) {
    this.impactCount++;
    let text;
    if (this.impactCount === 0) {
      this.startTime = new Date().getTime();
      text = "HRA JEDE, sestrel kouli";
    } else if (this.impactCount == rounds) {
      text = `Konec hry, tvuj cas je ${this.getTimeString()} sekund.\nStrel znova pro start`;
      this.impactCount = -1;
      document.getElementById("text-live")?.setAttribute("value", "");
    } else {
      text = `${this.impactCount}/${rounds} - ${this.getTimeString()}`;
    }
    document.getElementById("text-score")?.setAttribute("value", text);
  },

  getTimeString(this: GameComponent) {
    return ((new Date().getTime() - this.startTime) / 1000).toFixed(3);
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    game: InstanceType<ComponentConstructor<GameComponent>>;
  }
}
