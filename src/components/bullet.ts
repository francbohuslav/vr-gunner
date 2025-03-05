import AFRAME from "aframe";
const THREE = AFRAME.THREE;

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
  },

  init: function () {},

  tick(_time, timeDelta) {
    const bullet = this.el;

    const vector = new THREE.Vector3(0, 0, -timeDelta * 0.01);
    vector.applyQuaternion(this.data.direction);

    const position = bullet.getAttribute("position");
    bullet.setAttribute("position", {
      x: position.x + vector.x,
      y: position.y + vector.y,
      z: position.z + vector.z,
    });
  },
});
