import AFRAME from "aframe";
const THREE = AFRAME.THREE;

AFRAME.registerComponent("gun", {
  init: function () {
    document.querySelector("a-text")?.setAttribute("value", "inited");
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));
  },

  createBullet: function () {
    document.querySelector("a-text")?.setAttribute("value", "jop");
    try {
      const el = this.el;

      const scene = document.querySelector("a-scene")!;
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldQuaternion(quaternion);

      const bullet = document.createElement("a-sphere");
      bullet.setAttribute("bullet", { direction: quaternion });
      bullet.setAttribute("position", position);
      bullet.setAttribute("color", "red");
      bullet.setAttribute("radius", "0.03");

      scene.appendChild(bullet);
    } catch (ex) {
      document.querySelector("a-text")?.setAttribute("value", ex.message);
    }
  },

  tick: function () {
    // const quaternion = new THREE.Quaternion();
    // this.el.object3D.getWorldQuaternion(quaternion);
    // document.querySelector("a-text")?.setAttribute("value", JSON.stringify(quaternion));
  },
});
