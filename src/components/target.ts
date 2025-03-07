import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

const width = 0.5;
const rounds = 5;

interface TargetComponent extends Component {
  impactCount: number;
  startTime: number;
  setRandomPosition(): void;
  getTime(): string;
  moveLeft: boolean;
  moveSpeed: number;
}

AFRAME.registerComponent("target", {
  schema: {},

  init: function (this: TargetComponent) {
    this.el.setAttribute("color", "red");
    this.el.setAttribute("radius", width);
    this.el.setAttribute("metalness", "0.7");
    this.setRandomPosition();
    this.impactCount = -1;
  },

  tick(this: TargetComponent, _time, timeDelta) {
    // Move around player, preserve distance from ground
    const pos = this.el.object3D.position;
    const vector = new THREE.Vector3(pos.x, 0, pos.z);
    const rotation = new THREE.Quaternion();
    rotation.setFromAxisAngle(new THREE.Vector3(0, this.moveLeft ? 1 : -1, 0), Math.PI / 2);
    vector.applyQuaternion(rotation);
    vector.setLength(timeDelta * this.moveSpeed);
    this.el.object3D.position.add(vector);
  },

  setRandomPosition(this: TargetComponent) {
    const z = -(Math.random() * 15 + 5);
    const x = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? 1 : -1);
    const y = Math.random() * 10 + 0.25;
    this.el.object3D.position.set(x, y, z);
    this.moveLeft = Math.random() > 0.5;
    this.moveSpeed = Math.random() / 500;
  },

  detectImpact(this: TargetComponent, bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3) {
    const line = new THREE.Line3(bulletPrevPosition, bulletPosition);
    const closestPoint = new THREE.Vector3();
    line.closestPointToPoint(this.el.object3D.position, true, closestPoint);
    const distance = closestPoint.distanceTo(this.el.object3D.position);
    // console.log(distance);

    if (distance < width) {
      this.impactCount++;
      let text;
      if (this.impactCount === 0) {
        this.startTime = new Date().getTime();
        text = "HRA JEDE, sestrel kouli";
      } else if (this.impactCount == rounds) {
        text = `Konec hry, tvuj cas je ${this.getTime()} sekund.\nStrel znova pro start`;
        this.impactCount = -1;
      } else {
        text = `${this.impactCount}/${rounds} - ${this.getTime()}`;
      }
      document.querySelector("a-text")?.setAttribute("value", text);
      this.setRandomPosition();
    }
  },

  getTime(this: TargetComponent) {
    return ((new Date().getTime() - this.startTime) / 1000).toFixed(3);
  },
});
