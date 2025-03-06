import AFRAME from "aframe";
const THREE = AFRAME.THREE;

const maxDistance = 100;
const speed = 0.1;

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
  },

  init: function () {
    this.el.setAttribute("color", "#ffbd4a");
    this.el.setAttribute("radius", "0.005");
    this.el.setAttribute("metalness", "0.3");

    const timeToLive = maxDistance / speed / 1000;
    this.timeToDestroy = new Date().getTime() + timeToLive * 1000;
  },

  tick(_time, timeDelta) {
    const bullet = this.el;
    if (new Date().getTime() > this.timeToDestroy) {
      this.removeBullet();
    }

    const vector = new THREE.Vector3(0, 0, -timeDelta * speed);
    vector.applyQuaternion(this.data.direction);
    const positionBefore = bullet.object3D.position.clone();
    bullet.object3D.position.add(vector);

    document.getElementById("target").components["target"].detectImpact(positionBefore, bullet.object3D.position);
  },

  removeBullet() {
    const bullet = this.el;
    bullet.parentNode.removeChild(bullet);
  },
});
