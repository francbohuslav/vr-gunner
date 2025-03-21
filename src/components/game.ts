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

//TODO: BF: bonusy vybirat ACkem na VR

AFRAME.registerComponent("game", {
  schema: {},

  init: function (this: GameComponent) {
    this.gameState = "beforeStart";
    this.enemiesKilled = 0;

    if (!config.isVR) {
      const scene = document.querySelector("a-scene") as AFRAME.Scene;
      scene.setAttribute("xr-mode-ui", "enabled: false");
    }

    document.getElementById("lives")?.setAttribute("position", `0 -${config.isVR ? 0.9 : 0.6} -2`);

    this.updateUi();

    // const bonuser = document.getElementById("bonuser") as AFRAME.Entity;
    // bonuser.components.bonuser.chooseBonus();
    this.drawSettings();
  },

  startNextLevel(this: GameComponent) {
    if (runSettings.current.playerLives === 0) {
      runSettings.reset();
    } else {
      runSettings.nextLevel();
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
      `Cetnost strel: ${settings.targetShotDelay.toFixed(1)} s`,
      `Rychlost: ${(settings.targetMoveSpeed / defaultRunSettings.targetMoveSpeed).toFixed(1)}`,
      // To be start value 1
      `Rychlost kulek: ${(settings.targetBulletSpeed / defaultRunSettings.targetBulletSpeed).toFixed(1)}`,
      `Presnost kulek: ${(settings.targetDispersion / defaultRunSettings.targetDispersion).toFixed(1)}`,
      "",
      "HRAC",
      `Rychlost kulek: ${(settings.playerBulletSpeed / defaultRunSettings.playerBulletSpeed).toFixed(1)}`,
    ];

    document.getElementById("text-console")!.setAttribute("visible", "true");
    document.getElementById("text-console")?.setAttribute("value", text.join("\n"));
  },

  updateUi(this: GameComponent) {
    let text = "";
    switch (this.gameState) {
      case "killed":
        text = `Zemrel jsi, salate.\n${config.nextLevelSentence()} pro zacatek hry.`;
        break;
      case "chooseBonus":
        text = `Vyber bonus.`;
        break;
      case "pauseBetweenLevels":
        text = `${config.nextLevelSentence()} pro dalsiho kolo.`;
        break;
      case "beforeStart":
        text = `Musis sestrelit ${targetsPerRound} cilu.\n${config.nextLevelSentence()} pro zacatek hry.`;
        break;
      default:
        if (this.enemiesKilled === 0) {
          text = `Hrajes, strilej ${config.shotSentence()}!!!`;
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
          life.setAttribute("position", `${(i - (runSettings.current.playerLives + 1) / 2) * 0.12} 0 0`);
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
