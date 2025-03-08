import AFRAME, { Component, Entity } from "aframe";
const THREE = AFRAME.THREE;

const maxDistance = 100;
// const defaultSpeed = 0.1; // Max speed
const defaultSpeed = 0.01;
const maxTrailLength = 10;

let bulletCounter = 0;

interface BulletComponent extends Component {
  bulletId: number;
  timeToDestroy: number;
  lifeTime: number;
  trail: AFRAME.Entity;
  removeBullet(): void;
}

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
    speed: { type: "number", default: defaultSpeed },
  },

  init: function (this: BulletComponent) {
    this.bulletId = ++bulletCounter;
    this.el.setAttribute("color", "#ffbd4a");
    this.el.setAttribute("radius", "0.005");
    this.el.setAttribute("metalness", "0.3");

    this.trail = document.createElement("a-box");
    const trail = this.trail;

    trail.object3D.setRotationFromQuaternion(this.data.direction);
    trail.setAttribute("width", "0.003");
    trail.setAttribute("height", "0.003");
    trail.setAttribute("depth", "0");
    trail.setAttribute("color", "#FFFF99");
    trail.setAttribute("material", "opacity: 0.5; shader: flat");
    this.el.appendChild(trail);

    const timeToLive = maxDistance / this.data.speed / 1000;
    this.timeToDestroy = new Date().getTime() + timeToLive * 1000;
    this.lifeTime = 0;
  },

  tick(this: BulletComponent, _time, timeDelta) {
    const bullet = this.el;
    if (new Date().getTime() > this.timeToDestroy) {
      this.removeBullet();
      return;
    }

    this.lifeTime += timeDelta;

    // Draw trail from origin to bullet is smaller then maxTrailLength
    const trailLength = Math.max(0, Math.min(this.lifeTime * this.data.speed - 0.16, maxTrailLength));
    const trailOffset = new THREE.Vector3(0, 0, trailLength / 2);
    trailOffset.applyQuaternion(this.data.direction);
    this.trail.object3D.position.copy(trailOffset);
    this.trail.setAttribute("depth", trailLength);

    const vector = new THREE.Vector3(0, 0, -timeDelta * this.data.speed);
    vector.applyQuaternion(this.data.direction);
    const positionBefore = bullet.object3D.position.clone();
    bullet.object3D.position.add(vector);

    const target = document.getElementById("target") as Entity | null;
    target?.components.target.detectImpact(positionBefore, bullet.object3D.position);

    const camera = document.getElementById("camera") as Entity;
    if (camera.components.player.detectImpact(positionBefore, bullet.object3D.position)) {
      this.removeBullet();
      return
    }
  },

  removeBullet() {
    this.el.parentNode?.removeChild(this.el);
  },
});
