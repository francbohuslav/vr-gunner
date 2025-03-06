import AFRAME from "aframe";
const THREE = AFRAME.THREE;

AFRAME.registerComponent("gun", {
  schema: {
    gunPosition: { type: "selector" },
  },

  init: function () {
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));
    document.body.addEventListener("click", this.createBullet.bind(this));
  },

  createBullet: function () {
    try {
      const scene = document.querySelector("a-scene")!;
      const position = new THREE.Vector3();
      const direction = new THREE.Quaternion();
      this.data.gunPosition.object3D.getWorldPosition(position);
      this.data.gunPosition.object3D.getWorldQuaternion(direction);

      const bullet = document.createElement("a-sphere");
      bullet.setAttribute("bullet", { direction });
      bullet.setAttribute("position", position);

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
