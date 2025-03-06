import AFRAME, { Component, Entity } from "aframe";
const THREE = AFRAME.THREE;

const maxDistance = 100;
const speed = 0.1;

interface BulletComponent extends Component {
  timeToDestroy: number;
}

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
  },

  init: function (this: BulletComponent) {
    this.el.setAttribute("color", "#ffbd4a");
    this.el.setAttribute("radius", "0.005");
    this.el.setAttribute("metalness", "0.3");

    const timeToLive = maxDistance / speed / 1000;
    this.timeToDestroy = new Date().getTime() + timeToLive * 1000;
  },

  tick(this: BulletComponent, _time, timeDelta) {
    const bullet = this.el;
    if (new Date().getTime() > this.timeToDestroy) {
      bullet.parentNode?.removeChild(bullet);
    }

    const vector = new THREE.Vector3(0, 0, -timeDelta * speed);
    vector.applyQuaternion(this.data.direction);
    const positionBefore = bullet.object3D.position.clone();
    bullet.object3D.position.add(vector);

    const target = document.getElementById("target") as Entity;
    target.components["target"].detectImpact(positionBefore, bullet.object3D.position);
  },
});
