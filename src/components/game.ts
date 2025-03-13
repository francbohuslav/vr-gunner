import AFRAME, { Component } from "aframe";
import runSettings from "../run-settings";

const targetsPerRound = 5;
const startLives = 3;

interface GameComponent extends Component {
  gameState: "beforeStart" | "running" | "chooseBonus" | "pauseBetweenLevels" | "killed";
  /** How many targets have been hit */
  enemiesKilled: number;
  lives: number;

  startNextLevel(): string;
  hideTarget(): void;
  targetHit(): Promise<void>;
  playerHit(): void;
  updateMessage(): void;
  updateLives(): void;
  drawSettings(): void;
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
      runSettings.reset();
    } else {
      runSettings.nextLevel();
    }
    this.drawSettings();
    this.gameState = "running";
    this.enemiesKilled = 0;

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-entity");

    target.setAttribute("target", {});
    scene.appendChild(target);
    this.updateLives();
    this.updateMessage();
  },

  async targetHit(this: GameComponent) {
    this.enemiesKilled++;
    if (this.enemiesKilled === targetsPerRound) {
      this.hideTarget();

      this.gameState = "chooseBonus";
      this.updateMessage();
      const bonuser = document.getElementById("bonuser") as AFRAME.Entity;
      const bonus = await bonuser.components.bonuser.chooseBonus();
      bonus.modify();
      this.drawSettings();

      this.gameState = "pauseBetweenLevels";
      this.updateMessage();
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

  drawSettings(this: GameComponent) {
    const settings = runSettings.current;
    const text = [
      `Level: ${settings.level}`,
      `Shot after start delay: ${settings.targetShotAfterStartDelay.toFixed(2)}`,
      `Shot delay: ${settings.targetShotDelay.toFixed(2)}`,
      `Move speed: ${(settings.targetMoveSpeed * 1000).toFixed(2)}`,
      `Bullet speed: ${(settings.targetBulletSpeed * 1000).toFixed(2)}`,
      `IsMobile: ${AFRAME.utils.device.isMobile()}`,
    ];

    document.getElementById("text-console")?.setAttribute("value", text.join("\n"));
  },

  updateMessage(this: GameComponent) {
    let text = "";
    switch (this.gameState) {
      case "killed":
        text = `Zemrel jsi, salate.\nZmackni (A) pro zacatek hry.`;
        break;
      case "chooseBonus":
        text = `Vyber bonus.`;
        break;
      case "pauseBetweenLevels":
        text = `Zmackni (A) pro dalsiho kolo.`;
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
