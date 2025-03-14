import AFRAME, { Component } from "aframe";
import runSettings from "../run-settings";

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

    this.updateUi();
  },

  startNextLevel(this: GameComponent) {
    if (runSettings.current.playerLives === 0) {
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
    this.updateUi();
  },

  async targetHit(this: GameComponent) {
    this.enemiesKilled++;
    if (this.enemiesKilled === targetsPerRound) {
      this.hideTarget();

      this.gameState = "chooseBonus";
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
      `CIL`,
      `Zpozdeni prvni strely: ${settings.targetShotAfterStartDelay.toFixed(2)}`,
      `Cetnost strel: ${settings.targetShotDelay.toFixed(2)}`,
      `Rychlost: ${(settings.targetMoveSpeed * 1000).toFixed(2)}`,
      `Rychlost kulek: ${(settings.targetBulletSpeed * 1000).toFixed(2)}`,
      `Presnost kulek: ${settings.targetDispersion.toFixed(0)}`,
      "",
      "HRAC",
      `Rychlost kulek: ${(settings.playerBulletSpeed * 1000).toFixed(2)}`,
    ];

    document.getElementById("text-console")?.setAttribute("value", text.join("\n"));
  },

  updateUi(this: GameComponent) {
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

    {
      const livesCont = document.getElementById("lives") as AFRAME.Entity;
      if (livesCont.childNodes.length != runSettings.current.playerLives) {
        while (livesCont.firstChild) {
          livesCont.removeChild(livesCont.firstChild);
        }

        for (let i = 1; i <= runSettings.current.playerLives; i++) {
          const life = document.createElement("a-entity");
          life.setAttribute("mixin", "mixin-hearth");
          life.setAttribute("position", `${(i - (runSettings.current.playerLives - 1) / 2) * 0.12} 0 0`);
          livesCont.appendChild(life);
        }
      }
    }
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    game: InstanceType<ComponentConstructor<GameComponent>>;
  }
}
