import AFRAME from "aframe";
const THREE = AFRAME.THREE;

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
  },

  init: function () {},

  tick(_time, timeDelta) {
    const bullet = this.el;
    
    const vector = new THREE.Vector3(0,0, -timeDelta * 0.001, );
    vector.applyQuaternion(this.data.direction);

    const position = bullet.getAttribute("position");
    bullet.setAttribute("position", {
      x: position.x + vector.x,
      y: position.y + vector.y,
      z: position.z + vector.z,
    });
  },
});

document.body.addEventListener("click", function () {
  const scene = document.querySelector("a-scene")!;
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();

  scene.camera.getWorldPosition(position);
  scene.camera.getWorldQuaternion(quaternion);

  const bullet = document.createElement("a-sphere");
  bullet.setAttribute("bullet", { direction: quaternion });
  bullet.setAttribute("position", position);
  bullet.setAttribute("rotation", quaternion);
  bullet.setAttribute("color", "red");
  bullet.setAttribute("radius", "0.03");

  scene.appendChild(bullet);
});
