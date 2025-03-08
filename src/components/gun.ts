import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

interface GunComponent extends Component {
  gunshotSoundPreload: HTMLAudioElement;
  createBullet: () => void;
  triggerPressed: () => void;
}

AFRAME.registerComponent("gun", {
  schema: {
    gunPosition: { type: "selector" },
  },

  init: function (this: GunComponent) {
    this.el.addEventListener("triggerdown", this.triggerPressed.bind(this));
    document.body.addEventListener("keydown", (e) => e.key === " " && this.triggerPressed());
    this.gunshotSoundPreload = document.getElementById("gunshot-sound-preload") as HTMLAudioElement;
  },

  triggerPressed: function (this: GunComponent) {
    const scene = document.querySelector("a-scene")!;
    const game = scene.components.game;
    if (game.round.isRunning) {
      // Do not shoot immediately from left gun after start
      if (game.round.startTime + 10 < new Date().getTime()) {
        this.createBullet();
      }
    } else {
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

      const bullet = document.createElement("a-sphere");
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
