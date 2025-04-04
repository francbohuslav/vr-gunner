import AFRAME, { Component } from "aframe";
import runSettings from "../run-settings";
import config from "../config";
const THREE = AFRAME.THREE;

interface GunComponent extends Component {
  gunshotSoundPreload: HTMLAudioElement;
  createBullet: () => void;
  startNextLevel: () => void;
}

AFRAME.registerComponent("gun", {
  schema: {
    gunPosition: { type: "selector" },
  },

  init: function (this: GunComponent) {
    const scene = document.querySelector("a-scene")!;

    this.el.addEventListener("abuttondown", this.startNextLevel.bind(this));
    this.el.addEventListener("bbuttondown", () => {
      if (scene.is("vr-mode")) {
        scene.exitVR();
      }
    });
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));

    if (config.isMobile) {
      document.body.addEventListener("mousedown", () => {
        const game = scene.components.game;
        if (game.gameState !== "running") {
          this.startNextLevel();
        } else {
          this.createBullet();
        }
      });
    }

    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.startNextLevel();
      }
      if (e.key === " ") {
        this.createBullet();
      }
    });
    this.gunshotSoundPreload = document.getElementById("gunshot-sound-preload") as HTMLAudioElement;

    // setTimeout(() => {
    //   this.createBullet();
    // }, 1000);
  },

  startNextLevel() {
    const scene = document.querySelector("a-scene")!;
    const game = scene.components.game;
    const bonuser = (document.getElementById("bonuser") as AFRAME.Entity).components.bonuser;

    if (game.gameState === "chooseBonus" && bonuser.selectedBonus && bonuser.resolveSelectionPromise) {
      bonuser.resolveSelectionPromise();
    } else if (["killed", "beforeStart", "pauseBetweenLevels"].includes(game.gameState)) {
      game.startNextLevel();
    }
  },

  createBullet: function (this: GunComponent) {
    try {
      const scene = document.querySelector("a-scene")!;

      const position = new THREE.Vector3();
      const direction = new THREE.Quaternion();
      this.data.gunPosition.object3D.getWorldPosition(position);
      this.data.gunPosition.object3D.getWorldQuaternion(direction);

      const bullet = document.createElement("a-entity");
      bullet.setAttribute("bullet", {
        direction,
        speed: runSettings.current.playerBulletSpeed,
        fromPlayer: true,
      });
      bullet.setAttribute("position", position);

      const shotSound = document.createElement("audio");
      shotSound.src = this.gunshotSoundPreload.src;
      shotSound.volume = 0.2;
      shotSound.load();

      shotSound.addEventListener("ended", function () {
        shotSound.remove();
      });
      shotSound.play();

      scene.appendChild(bullet);
    } catch (ex) {
      if (ex instanceof Error) {
        document.getElementById("text-message")?.setAttribute("value", ex.message);
      }
    }
  },
});
