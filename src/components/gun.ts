import AFRAME from "aframe";
const THREE = AFRAME.THREE;

AFRAME.registerComponent("gun", {
  init: function () {
    this.el.addEventListener("triggerdown", this.createBullet.bind(this));
    document.body.addEventListener("click", this.createBullet.bind(this));
  },

  createBullet: function () {
    try {
      const el = this.el;

      const scene = document.querySelector("a-scene")!;
      const position = new THREE.Vector3();
      const direction = new THREE.Quaternion();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldQuaternion(direction);

      const gunRotation = new THREE.Quaternion();
      gunRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
      direction.multiply(gunRotation);

      const bulletFix = new THREE.Quaternion();
      bulletFix.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (4.3 / 180.0) * Math.PI);
      direction.multiply(bulletFix);

      const bullet = document.createElement("a-sphere");
      bullet.setAttribute("bullet", { direction });
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
