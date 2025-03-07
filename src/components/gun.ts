import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

interface GunComponent extends Component {
  gunshotSoundPreload: HTMLAudioElement;
  createBullet: () => void;
}

AFRAME.registerComponent("gun", {
  schema: {
    gunPosition: { type: "selector" },
  },

  init: function (this: GunComponent) {
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));
    document.body.addEventListener("click", this.createBullet.bind(this));
    this.gunshotSoundPreload = document.getElementById("gunshot-sound-preload") as HTMLAudioElement;
  },

  createBullet: function (this: GunComponent) {
    try {
      const scene = document.querySelector("a-scene")!;
      if (!scene.is("vr-mode")) {
        return;
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
        document.querySelector("a-text")?.setAttribute("value", ex.message);
      }
    }
  },

  tick: function () {
    // const quaternion = new THREE.Quaternion();
    // this.el.object3D.getWorldQuaternion(quaternion);
    // document.querySelector("a-text")?.setAttribute("value", JSON.stringify(quaternion));
  },
});
