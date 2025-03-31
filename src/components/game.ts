import AFRAME, { Component } from "aframe";
import runSettings, { defaultRunSettings } from "../run-settings";
import config from "../config";

const targetsPerRound = 5;

interface GameComponent extends Component {
  gameState: "beforeStart" | "running" | "chooseBonus" | "pauseBetweenLevels" | "killed";
  /** How many targets have been hit */
  enemiesKilled: number;

  startNextLevel(): string;
  hideTarget(): void;
  targetHit(): Promise<void>;
  playerHit(): void;
  updateUi(): void;
  updateLives(): void;
  drawSettings(): void;
}

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.gameState = "beforeStart";
    this.enemiesKilled = 0;

    if (!config.isVR) {
      const scene = document.querySelector("a-scene") as AFRAME.Scene;
      scene.setAttribute("xr-mode-ui", "enabled: false");
    }

    this.updateUi();
    this.drawSettings();

    // To test bonuses
    // this.enemiesKilled = targetsPerRound - 1;
    // this.targetHit();
  },

  startNextLevel(this: GameComponent) {
    if (["beforeStart", "killed"].includes(this.gameState)) {
      runSettings.reset();
    }
    document.getElementById("text-console")!.setAttribute("visible", "false");

    this.gameState = "running";
    this.enemiesKilled = 0;

    const scene = document.querySelector("a-scene")!;
    const target = document.createElement("a-entity");

    target.setAttribute("target", {});
    scene.appendChild(target);
    this.updateUi();
  },

  async targetHit(this: GameComponent) {
    this.enemiesKilled++;
    if (this.enemiesKilled === targetsPerRound) {
      this.hideTarget();
      runSettings.nextLevel();

      this.gameState = "chooseBonus";
      this.drawSettings();
      this.updateUi();

      const bonuser = document.getElementById("bonuser") as AFRAME.Entity;
      const bonus = await bonuser.components.bonuser.chooseBonus();
      bonus.modify();
      this.drawSettings();

      this.gameState = "pauseBetweenLevels";
    }
    this.updateUi();
  },

  playerHit(this: GameComponent) {
    if (this.gameState !== "running") {
      return;
    }
    runSettings.current.playerLives -= 1;
    if (runSettings.current.playerLives === 0) {
      this.gameState = "killed";
      this.hideTarget();
      this.drawSettings();
    }
    this.updateUi();
  },

  hideTarget(this: GameComponent) {
    const target = document.getElementById("target");
    target?.parentNode?.removeChild(document.getElementById("target")!);
  },

  drawSettings(this: GameComponent) {
    const settings = runSettings.current;
    const text = [
      `Level: ${settings.level}`,
      "",
      `CÍL`,
      `Četnost střel: ${settings.targetShotDelay.toFixed(1)} s`,
      `Rychlost: ${(settings.targetMoveSpeed / defaultRunSettings.targetMoveSpeed).toFixed(1)}`,
      // To be start value 1
      `Rychlost kulek: ${(settings.targetBulletSpeed / defaultRunSettings.targetBulletSpeed).toFixed(1)}`,
      `Přesnost kulek: ${(settings.targetDispersion / defaultRunSettings.targetDispersion).toFixed(1)}`,
      `Vzdálenost: ${settings.targetDistance.toFixed(1)}`,
      "",
      "HRÁČ",
      `Rychlost kulek: ${(settings.playerBulletSpeed / defaultRunSettings.playerBulletSpeed).toFixed(1)}`,
    ];

    document.getElementById("text-console")!.setAttribute("visible", "true");
    document.getElementById("text-console")?.setAttribute("value", text.join("\n"));
  },

  updateUi(this: GameComponent) {
    let text = "";
    switch (this.gameState) {
      case "killed":
        text = `Zemřel jsi, saláte.\n${config.nextLevelSentence()} pro začátek hry.`;
        break;
      case "chooseBonus":
        text = `${config.nextLevelSentence()} pro volbu bonusu.`;
        break;
      case "pauseBetweenLevels":
        text = `${config.nextLevelSentence()} pro další kolo.`;
        break;
      case "beforeStart":
        text = `Musíš sestřelit ${targetsPerRound} cílů.\n${config.nextLevelSentence()} pro začátek hry.`;
        break;
      default:
        if (this.enemiesKilled === 0) {
          text = `Hraješ, střílej ${config.shotSentence()}!!!`;
        } else {
          text = `${this.enemiesKilled}/${targetsPerRound}`;
        }
    }
    document.getElementById("text-message")?.setAttribute("value", text);

    const livesComponents = document.querySelectorAll<AFRAME.Entity>("[lives]");
    livesComponents.forEach((liveElement) => liveElement.components.lives.updateLives());
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    game: InstanceType<ComponentConstructor<GameComponent>>;
  }
}
