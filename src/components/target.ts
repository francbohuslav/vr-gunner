import AFRAME, { Component } from "aframe";
import runSettings from "../run-settings";
const THREE = AFRAME.THREE;

const bulletOffsetMap: Record<string, AFRAME.THREE.Vector3> = {
  "mixin-target-ufo": new THREE.Vector3(0, 0, 0),
  "mixin-target-mimon": new THREE.Vector3(0, -1, 0),
};

interface TargetComponent extends Component {
  setNewTarget(): void;
  createNextShotTime(): number;
  createBullet(): void;
  // detectImpact(bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3): void;
  getBulletPosAndRotToPlayer(): [AFRAME.THREE.Vector3, AFRAME.THREE.Quaternion];
  targetHit(): void;

  mixin: string;
  moveLeft: boolean;
  nextShotTime: number;
  prevTime: number;
  loadingSound: AFRAME.Entity;
  // box: AFRAME.THREE.Vector3;
}

AFRAME.registerComponent("target", {
  schema: {},

  init: function (this: TargetComponent) {
    this.el.setAttribute("id", "target");
    this.el.setAttribute("obb-collider", "centerModel: true");
    this.el.setAttribute("sound", "src: #gunshot-sound-preload; volume: 1;");

    this.loadingSound = document.createElement("a-entity");
    this.loadingSound.setAttribute("sound", "src: #loading-sound; volume: 2;");
    this.el.appendChild(this.loadingSound);

    // this.box = new THREE.Vector3();

    // this.el.addEventListener("object3dset", () => {
    //   new THREE.Box3().setFromObject(this.el.object3D, true).getSize(this.box);
    // });

    this.setNewTarget();
  },

  tick(this: TargetComponent, _time, timeDelta) {
    {
      // Move around player, preserve distance from ground
      const pos = this.el.object3D.position;
      const vector = new THREE.Vector3(pos.x, 0, pos.z);
      const rotation = new THREE.Quaternion();
      rotation.setFromAxisAngle(new THREE.Vector3(0, this.moveLeft ? 1 : -1, 0), Math.PI / 2);
      vector.applyQuaternion(rotation);
      vector.setLength(timeDelta * runSettings.current.targetMoveSpeed);
      this.el.object3D.position.add(vector);
    }

    {
      // Rotate towards player
      const targetRotation = this.getBulletPosAndRotToPlayer()[1];
      targetRotation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
      // Slow rotate to player
      this.el.object3D.quaternion.slerp(targetRotation, 0.01);
    }

    const now = new Date().getTime();
    const loadStartTime = this.nextShotTime - 700;

    if (this.prevTime < loadStartTime && loadStartTime <= now) {
      this.loadingSound.components.sound.playSound();
    }
    if (now > this.nextShotTime) {
      // Shot towards player
      this.createBullet();
      this.nextShotTime = this.createNextShotTime();
    }
    this.prevTime = now;
  },

  setNewTarget(this: TargetComponent) {
    const randomHorizontalRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * (Math.random() - 0.5));
    const randomVerticalRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (Math.PI * Math.random() * 0.25) / 4);
    const distance = new THREE.Vector3(0, 0, -runSettings.current.targetDistance).applyQuaternion(randomHorizontalRotation.multiply(randomVerticalRotation));
    // To be sure that we are above ground
    distance.add(new THREE.Vector3(0, 1, 0));

    this.mixin = Math.random() > 0.5 ? "mixin-target-mimon" : "mixin-target-ufo";
    this.el.setAttribute("mixin", this.mixin);

    this.el.object3D.position.copy(distance);
    this.moveLeft = Math.random() > 0.5;
    this.nextShotTime = this.createNextShotTime();
  },

  targetHit(this: TargetComponent) {
    this.setNewTarget();
    const scene = document.querySelector("a-scene")!;
    scene.components.game.targetHit();
  },

  createNextShotTime(this: TargetComponent): number {
    return new Date().getTime() + (runSettings.current.targetShotDelay + Math.random() * runSettings.current.targetShotDelay) * 1000;
  },

  createBullet(this: TargetComponent) {
    try {
      const scene = document.querySelector("a-scene")!;

      const [position, direction] = this.getBulletPosAndRotToPlayer();

      // How good eye has enemy. Higher = more accurate.
      const randomizer = new THREE.Vector3(
        (Math.random() - 0.5) / runSettings.current.targetDispersion,
        (Math.random() - 0.5) / runSettings.current.targetDispersion,
        1
      ).normalize();
      direction.multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), randomizer));

      const bullet = document.createElement("a-entity");
      bullet.setAttribute("bullet", { direction, speed: runSettings.current.targetBulletSpeed, color: "#FF0000", size: 0.06 });
      bullet.setAttribute("position", position);

      this.el.components.sound.playSound();

      scene.appendChild(bullet);
    } catch (ex) {
      if (ex instanceof Error) {
        document.getElementById("text-message")?.setAttribute("value", ex.message);
      }
    }
  },

  getBulletPosAndRotToPlayer(this: TargetComponent): [AFRAME.THREE.Vector3, AFRAME.THREE.Quaternion] {
    const camera = document.getElementById("camera") as AFRAME.Entity;

    const bulletStart = this.el.object3D.position.clone().add(bulletOffsetMap[this.mixin]);
    const offsetTowardsPlayer = new THREE.Vector3();
    offsetTowardsPlayer.copy(bulletStart).sub(camera?.object3D.position).negate().setLength(0.1);

    const bulletPosition = new THREE.Vector3();
    bulletPosition.copy(bulletStart);
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
