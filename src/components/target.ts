import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

const width = 1;

interface TargetComponent extends Component {
  setRandomPosition(): void;
  createNextShotTime(): number;
  createBullet(): void;
  detectImpact(this: TargetComponent, bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3): void;
  getBulletPosAndRotToPlayer(this: TargetComponent): [AFRAME.THREE.Vector3, AFRAME.THREE.Quaternion];

  moveLeft: boolean;
  moveSpeed: number;
  nextShotTime: number;
  gunshotSoundPreload: HTMLAudioElement;
}

AFRAME.registerComponent("target", {
  schema: {},

  init: function (this: TargetComponent) {
    this.el.setAttribute("id", "target");
    // this.el.setAttribute("obb-collider", "centerModel: true"); 
    this.el.setAttribute("mixin", "mixin-target");

    const sphere = document.createElement("a-sphere");
    sphere.setAttribute("color", "red");
    sphere.setAttribute("radius", width / 2);
    sphere.setAttribute("metalness", "0.7");
    sphere.setAttribute("scale", "20 20 20");
    // this.el.appendChild(sphere);
    this.setRandomPosition();
    this.nextShotTime = this.createNextShotTime();
    this.gunshotSoundPreload = document.getElementById("gunshot-sound-preload") as HTMLAudioElement;
  },

  tick(this: TargetComponent, _time, timeDelta) {
    {
      // Move around player, preserve distance from ground
      const pos = this.el.object3D.position;
      const vector = new THREE.Vector3(pos.x, 0, pos.z);
      const rotation = new THREE.Quaternion();
      rotation.setFromAxisAngle(new THREE.Vector3(0, this.moveLeft ? 1 : -1, 0), Math.PI / 2);
      vector.applyQuaternion(rotation);
      vector.setLength(timeDelta * this.moveSpeed);
      this.el.object3D.position.add(vector);
    }

    const rotation = this.getBulletPosAndRotToPlayer()[1];
    const turnAround = new THREE.Quaternion();
    turnAround.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    rotation.multiply(turnAround);
    this.el.object3D.rotation.setFromQuaternion(rotation);

    // Shot towards player
    if (new Date().getTime() > this.nextShotTime) {
      this.createBullet();
      this.nextShotTime = this.createNextShotTime();
      // this.nextShotTime = new Date().getTime() * 3600 * 1000;
    }
  },

  setRandomPosition(this: TargetComponent) {
    const z = -(Math.random() * 15 + 5);
    const x = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? 1 : -1);
    const y = Math.random() * 10 + 0.25;
    this.el.object3D.position.set(x, y, z);
    this.moveLeft = Math.random() > 0.5;
    this.moveSpeed = Math.random() / 1000;
  },

  detectImpact(this: TargetComponent, bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3) {
    const line = new THREE.Line3(bulletPrevPosition, bulletPosition);
    const closestPoint = new THREE.Vector3();
    line.closestPointToPoint(this.el.object3D.position, true, closestPoint);
    const distance = closestPoint.distanceTo(this.el.object3D.position);
    // console.log(distance);

    if (distance < width / 2) {
      this.setRandomPosition();
      const scene = document.querySelector("a-scene")!;
      scene.components.game.targetHit();
    }
  },

  createNextShotTime(): number {
    // Shot every 3-8 seconds
    return new Date().getTime() + (5 + Math.random() * 5) * 1000;
  },

  createBullet(this: TargetComponent) {
    try {
      const scene = document.querySelector("a-scene")!;

      const [position, direction] = this.getBulletPosAndRotToPlayer();

      // How good eye has enemy. Higher = more accurate.
      const dispersion = 25.0;
      const randomizer = new THREE.Vector3((Math.random() - 0.5) / dispersion, (Math.random() - 0.5) / dispersion, 1).normalize();
      direction.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), randomizer));

      const bullet = document.createElement("a-sphere");
      bullet.setAttribute("bullet", { direction, speed: 0.003 });
      bullet.setAttribute("position", position);

      const shotSound = document.createElement("audio");
      shotSound.src = this.gunshotSoundPreload.src;
      shotSound.volume = 0.1;
      shotSound.load();

      shotSound.addEventListener("ended", function () {
        shotSound.remove();
      });
      shotSound.play();

      scene.appendChild(bullet);
    } catch (ex) {
      if (ex instanceof Error) {
        document.getElementById("text-score")?.setAttribute("value", ex.message);
      }
    }
  },

  getBulletPosAndRotToPlayer(this: TargetComponent): [AFRAME.THREE.Vector3, AFRAME.THREE.Quaternion] {
    const camera = document.getElementById("camera") as AFRAME.Entity;

    const offsetTowardsPlayer = new THREE.Vector3();
    offsetTowardsPlayer
      .copy(this.el.object3D.position)
      .sub(camera?.object3D.position)
      .negate()
      .setLength(width / 2 + 0.1);

    const bulletPosition = new THREE.Vector3();
    bulletPosition.copy(this.el.object3D.position);
    bulletPosition.add(offsetTowardsPlayer);

    const directionAroundY = new THREE.Vector3(offsetTowardsPlayer.x, 0, offsetTowardsPlayer.z).normalize();
    let direction = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), directionAroundY);
    direction = new THREE.Quaternion().setFromUnitVectors(directionAroundY, offsetTowardsPlayer.normalize()).multiply(direction);
    return [bulletPosition, direction];
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    target: InstanceType<ComponentConstructor<TargetComponent>>;
  }
}
