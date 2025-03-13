import AFRAME, { Component, Entity } from "aframe";
const THREE = AFRAME.THREE;

const maxDistance = 100;
// const defaultSpeed = 0.1; // Max speed
//TODO: BF: pri vysich rychlostech nebude fugovat kolize
const defaultSpeed = 0.01;
const maxTrailLength = 10;

let bulletCounter = 0;

interface BulletComponent extends Component {
  bulletId: number;
  timeToDestroy: number;
  lifeTime: number;
  trail: AFRAME.Entity;
  removeBullet(): void;
  processCollision(event: Event): void;
}

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
    speed: { type: "number", default: defaultSpeed },
    color: { type: "color", default: "#ffbd4a" },
    size: { type: "number", default: 0.005 },
  },

  init: function (this: BulletComponent) {
    this.bulletId = ++bulletCounter;
    this.el.setAttribute("geometry", `primitive: sphere; radius: ${this.data.size}; segmentsWidth: 8; segmentsHeight: 4`);
    this.el.setAttribute("material", `color: ${this.data.color}; metalness: 0.3`);
    this.el.setAttribute("obb-collider", "");

    this.el.object3D.setRotationFromQuaternion(this.data.direction);

    this.el.addEventListener("obbcollisionstarted", this.processCollision.bind(this));

    this.trail = document.createElement("a-box");
    const trail = this.trail;

    trail.setAttribute("width", this.data.size);
    trail.setAttribute("height", this.data.size);
    trail.setAttribute("depth", "0");
    trail.setAttribute("color", this.data.color);
    trail.setAttribute("material", "opacity: 0.3; shader: flat");
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
    this.trail.object3D.position.copy(trailOffset);
    this.trail.setAttribute("depth", trailLength);

    const vector = new THREE.Vector3(0, 0, -timeDelta * this.data.speed);
    vector.applyQuaternion(this.data.direction);
    const positionBefore = bullet.object3D.position.clone();
    bullet.object3D.position.add(vector);

    // const target = document.getElementById("target") as Entity | null;
    // target?.components.target.detectImpact(positionBefore, bullet.object3D.position);

    const camera = document.getElementById("camera") as Entity;
    if (camera.components.player.detectImpact(positionBefore, bullet.object3D.position)) {
      this.removeBullet();
      return;
    }
  },

  processCollision(e: CustomEvent<{ withEl: AFRAME.Entity }>) {
    const entity = e.detail.withEl;
    if (entity.id !== "target") {
      return;
    }
    e.detail.withEl.components.target.targetHit();
  },

  removeBullet() {
    this.el.parentNode?.removeChild(this.el);
  },
});
