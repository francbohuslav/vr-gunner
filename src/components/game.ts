import AFRAME, { Component } from "aframe";

const targetsPerRound = 5;
const startLives = 3;

interface GameComponent extends Component {
  gameState: "beforeStart" | "running" | "pauseBetweenLevels" | "killed";
  /** How many targets have been hit */
  enemiesKilled: number;
  lives: number;
  level: number;

  startNextLevel(): string;
  hideTarget(): void;
  targetHit(): void;
  playerHit(): void;
  updateMessage(): void;
  updateLives(): void;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.gameState = "beforeStart";
    this.enemiesKilled = 0;
    this.lives = 0;

    this.updateLives();
    this.updateMessage();
  },

  startNextLevel(this: GameComponent) {
    if (this.lives === 0) {
      this.lives = startLives;
      this.level = 0;
    }
    this.level++;
    this.gameState = "running";
    this.enemiesKilled = 0;

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-entity");

    target.setAttribute("target", { level: this.level });
    scene.appendChild(target);
    this.updateLives();
    this.updateMessage();
  },

  targetHit(this: GameComponent) {
    this.enemiesKilled++;
    if (this.enemiesKilled === targetsPerRound) {
      this.gameState = "pauseBetweenLevels";
      this.hideTarget();
    }
    this.updateMessage();
  },

  playerHit(this: GameComponent) {
    if (this.gameState !== "running") {
      return;
    }
    this.lives -= 1;
    if (this.lives === 0) {
      this.gameState = "killed";
      this.hideTarget();
    }
    this.updateLives();
    this.updateMessage();
  },

  hideTarget(this: GameComponent) {
    const target = document.getElementById("target");
    target?.parentNode?.removeChild(document.getElementById("target")!);
  },

  updateMessage(this: GameComponent) {
    let text = "";
    switch (this.gameState) {
      case "killed":
        text = `Zemrel jsi, salate.\nZmackni (A) pro zacatek hry.`;
        break;
      case "pauseBetweenLevels":
        text = `Konec kola.\nZmackni (A) pro dalsiho kolo.`;
        break;
      case "beforeStart":
        text = `Musis sestrelit ${targetsPerRound} cilu.\nZmackni (A) pro zacatek hry.`;
        break;
      default:
        if (this.enemiesKilled === 0) {
          text = "Hrajes, strilej!!!";
        } else {
          text = `${this.enemiesKilled}/${targetsPerRound}`;
        }
    }
    document.getElementById("text-message")?.setAttribute("value", text);
  },

  updateLives(this: GameComponent) {
    for (let i = 1; i <= 3; i++) {
      document.getElementById("life-" + i)?.setAttribute("visible", (i <= this.lives).toString());
    }
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    game: InstanceType<ComponentConstructor<GameComponent>>;
  }
}
