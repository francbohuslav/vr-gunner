import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

interface TargetComponent extends Component {
  setRandomPosition(): void;
  createFirstShotTime(): number;
  createNextShotTime(): number;
  createBullet(): void;
  // detectImpact(bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3): void;
  getBulletPosAndRotToPlayer(): [AFRAME.THREE.Vector3, AFRAME.THREE.Quaternion];
  targetHit(): void;
  interpolateValue(startValue: number, valueIn10thLevel: number): number;

  moveLeft: boolean;
  moveSpeed: number;
  shotAfterStartDelay: number;
  shotDelay: number;
  nextShotTime: number;
  bulletSpeed: number;
  gunshotSoundPreload: HTMLAudioElement;
  box: AFRAME.THREE.Vector3;
}

AFRAME.registerComponent("target", {
  schema: {
    level: { type: "number", default: 1 },
  },

  init: function (this: TargetComponent) {
    this.el.setAttribute("id", "target");
    this.el.setAttribute("obb-collider", "centerModel: true");
    this.el.setAttribute("mixin", "mixin-target");
    this.box = new THREE.Vector3();

    this.el.addEventListener("object3dset", () => {
      new THREE.Box3().setFromObject(this.el.object3D, true).getSize(this.box);
    });

    this.setRandomPosition();
    this.nextShotTime = this.createFirstShotTime();
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

    {
      // Rotate towards player
      const targetRotation = this.getBulletPosAndRotToPlayer()[1];
      targetRotation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
      // Slow rotate to player
      this.el.object3D.quaternion.slerp(targetRotation, 0.01);
    }

    // Shot towards player
    if (new Date().getTime() > this.nextShotTime) {
      this.createBullet();
      this.nextShotTime = this.createNextShotTime();
    }
  },

  setRandomPosition(this: TargetComponent) {
    const z = -(Math.random() * 15 + 5);
    const x = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? 1 : -1);
    const y = Math.random() * 10 + 0.25;
    this.el.object3D.position.set(x, y, z);
    this.moveLeft = Math.random() > 0.5;
    this.moveSpeed = this.interpolateValue(0.0002, 0.005);
    this.shotAfterStartDelay = Math.max(0, 5.5 - 0.5 * this.data.level);
    this.shotDelay = Math.max(1, 5.4 - 0.4 * this.data.level);
    this.bulletSpeed = this.interpolateValue(0.003, 0.02);
    const text = [
      `Level: ${this.data.level}`,
      `Shot after start delay: ${this.shotAfterStartDelay.toFixed(2)}`,
      `Shot delay: ${this.shotDelay.toFixed(2)}`,
      `Move speed: ${(this.moveSpeed * 1000).toFixed(2)}`,
      `Bullet speed: ${(this.bulletSpeed * 1000).toFixed(2)}`,
      `IsMobile: ${AFRAME.utils.device.isMobile()}`,
    ];

    document.getElementById("text-console")?.setAttribute("value", text.join("\n"));
  },

  // detectImpact(this: TargetComponent, bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3) {
  //   const line = new THREE.Line3(bulletPrevPosition, bulletPosition);
  //   const closestPoint = new THREE.Vector3();
  //   line.closestPointToPoint(this.el.object3D.position, true, closestPoint);
  //   const distance = closestPoint.distanceTo(this.el.object3D.position);
  // console.log(distance);

  //TODO: BF: detekce
  // if (distance < width / 2) {
  // this.targetHit();
  // }
  // },

  targetHit(this: TargetComponent) {
    this.setRandomPosition();
    const scene = document.querySelector("a-scene")!;
    scene.components.game.targetHit();
  },

  createFirstShotTime(this: TargetComponent): number {
    return new Date().getTime() + (this.shotAfterStartDelay + Math.random() * this.shotAfterStartDelay) * 1000;
  },

  createNextShotTime(this: TargetComponent): number {
    return new Date().getTime() + (this.shotDelay + Math.random() * this.shotDelay) * 1000;
  },

  createBullet(this: TargetComponent) {
    try {
      const scene = document.querySelector("a-scene")!;

      const [position, direction] = this.getBulletPosAndRotToPlayer();

      // How good eye has enemy. Higher = more accurate.
      const dispersion = 25.0;
      const randomizer = new THREE.Vector3((Math.random() - 0.5) / dispersion, (Math.random() - 0.5) / dispersion, 1).normalize();
      direction.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), randomizer));

      const bullet = document.createElement("a-entity");
      bullet.setAttribute("bullet", { direction, speed: this.bulletSpeed });
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
        document.getElementById("text-message")?.setAttribute("value", ex.message);
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
      .setLength(this.box.z / 2 + 0.1);

    const bulletPosition = new THREE.Vector3();
    bulletPosition.copy(this.el.object3D.position);
    bulletPosition.add(offsetTowardsPlayer);

    const directionAroundY = new THREE.Vector3(offsetTowardsPlayer.x, 0, offsetTowardsPlayer.z).normalize();
    let direction = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), directionAroundY);
    direction = new THREE.Quaternion().setFromUnitVectors(directionAroundY, offsetTowardsPlayer.normalize()).multiply(direction);
    return [bulletPosition, direction];
  },

  interpolateValue(this: TargetComponent, startValue: number, valueIn10thLevel: number): number {
    const growCoef = Math.pow(valueIn10thLevel / startValue, 1 / (10 - 1));
    const value = startValue * Math.pow(growCoef, this.data.level - 1);
    return value;
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    target: InstanceType<ComponentConstructor<TargetComponent>>;
  }
}
