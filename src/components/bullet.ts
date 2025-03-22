import AFRAME, { Component, Entity } from "aframe";
const THREE = AFRAME.THREE;

const maxDistance = 100;

let bulletCounter = 0;

interface BulletComponent extends Component {
  bulletId: number;
  timeToDestroy: number;
  lifeTime: number;
  trail: AFRAME.Entity;
  collider: AFRAME.Entity;
  removeBullet(): void;
  processCollision(event: Event): void;
}

AFRAME.registerComponent("bullet", {
  schema: {
    direction: { type: "vec4" },
    speed: { type: "number" },
    fromPlayer: { type: "boolean" },
    color: { type: "color", default: "#ffbd4a" },
    size: { type: "number", default: 0.01 },
  },

  init: function (this: BulletComponent) {
    this.bulletId = ++bulletCounter;
    this.el.setAttribute("geometry", `primitive: sphere; radius: ${this.data.size / 2}; segmentsWidth: 8; segmentsHeight: 4`);
    this.el.setAttribute("material", `color: ${this.data.color}; metalness: 0.3`);

    this.el.object3D.setRotationFromQuaternion(this.data.direction);

    this.el.addEventListener("obbcollisionstarted", this.processCollision.bind(this));

    const trail = (this.trail = document.createElement("a-box"));
    trail.setAttribute("width", this.data.size / 2);
    trail.setAttribute("height", this.data.size / 2);
    trail.setAttribute("depth", "0");
    trail.setAttribute("color", this.data.color);
    trail.setAttribute("material", "opacity: 0.3; shader: flat");
    this.el.appendChild(trail);

    const collider = (this.collider = document.createElement("a-box"));
    collider.setAttribute("obb-collider", "");
    collider.setAttribute("width", this.data.size);
    collider.setAttribute("height", this.data.size);
    collider.setAttribute("depth", this.data.size);
    collider.setAttribute("visible", false);
    this.el.appendChild(collider);

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

    const positionBefore = bullet.object3D.position.clone();
    const positionChangeLength = timeDelta * this.data.speed;
    const vector = new THREE.Vector3(0, 0, -positionChangeLength);
    vector.applyQuaternion(this.data.direction);
    bullet.object3D.position.add(vector);

    // Draw trail from origin to bullet is smaller then maxTrailLength
    const trailLength = Math.max(0, Math.min(this.lifeTime, 100) * this.data.speed - 0.3);
    const trailOffset = new THREE.Vector3(0, 0, trailLength / 2);
    this.trail.object3D.position.copy(trailOffset);
    this.trail.setAttribute("depth", trailLength);

    const colliderOffset = new THREE.Vector3(0, 0, positionChangeLength / 2);
    this.collider.object3D.position.copy(colliderOffset);
    // Size of collider must be little bit longer, because ObbCollider updates its data one frame later,
    // so it does not match current bullet position and there are spaces between previous collider position and new one.
    // You can see it in this.collider.components["obb-collider"].boundingBox
    this.collider.setAttribute("depth", positionChangeLength * 1.5);
    // Update collision box, because size of collider is changing in time
    this.collider.components["obb-collider"].updateCollider();
    // console.log(
    //   "xxx",
    //   this.collider.components["obb-collider"].boundingBox.min.toDebug() + " - " + this.collider.components["obb-collider"].boundingBox.max.toDebug()
    // );

    // const target = document.getElementById("target") as Entity | null;
    // target?.components.target.detectImpact(positionBefore, bullet.object3D.position);

    const camera = document.getElementById("camera") as Entity;
    if (!this.data.fromPlayer && camera.components.player.detectImpact(positionBefore, bullet.object3D.position)) {
      this.removeBullet();
      return;
    }
  },

  processCollision(e: CustomEvent<{ withEl: AFRAME.Entity }>) {
    const entity = e.detail.withEl;
    if (entity.id === "target" && this.data.fromPlayer) {
      e.detail.withEl.components.target.targetHit();
    }
  },

  removeBullet() {
    this.el.parentNode?.removeChild(this.el);
  },
});
