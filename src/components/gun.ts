import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

interface GunComponent extends Component {
  gunshotSoundPreload: HTMLAudioElement;
  createBullet: () => void;
  startRound: () => void;
}

AFRAME.registerComponent("gun", {
  schema: {
    gunPosition: { type: "selector" },
  },

  init: function (this: GunComponent) {
    //TODO: BF: DEBUG android
    document.body.addEventListener("mousedown", () => {
      const scene = document.querySelector("a-scene")!;
      const game = scene.components.game;
      if (game.round.isRunning) {
        this.createBullet();
      } else {
        this.startRound();
      }
    });
    this.el.addEventListener("abuttondown", this.startRound.bind(this));
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.startRound();
      }
      if (e.key === " ") {
        this.createBullet();
      }
    });
    this.gunshotSoundPreload = document.getElementById("gunshot-sound-preload") as HTMLAudioElement;
  },

  startRound() {
    const scene = document.querySelector("a-scene")!;
    const game = scene.components.game;
    if (!game.round.isRunning) {
      game.startRound();
    }
  },

  createBullet: function (this: GunComponent) {
    try {
      const scene = document.querySelector("a-scene")!;
      if (!scene.is("vr-mode")) {
        // return;
      }

      const position = new THREE.Vector3();
      const direction = new THREE.Quaternion();
      this.data.gunPosition.object3D.getWorldPosition(position);
      this.data.gunPosition.object3D.getWorldQuaternion(direction);

      const bullet = document.createElement("a-entity");
      bullet.setAttribute("bullet", { direction });
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
        document.getElementById("text-score")?.setAttribute("value", ex.message);
      }
    }
  },

  tick: function () {
    // const quaternion = new THREE.Quaternion();
    // this.el.object3D.getWorldQuaternion(quaternion);
    // document.getElementById("text-score")?.setAttribute("value", JSON.stringify(quaternion));
  },
});
