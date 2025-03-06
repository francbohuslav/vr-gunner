import AFRAME from "aframe";
const THREE = AFRAME.THREE;

const width = 0.5;
const rounds = 5;

AFRAME.registerComponent("target", {
  schema: {},

  init: function () {
    this.el.setAttribute("color", "red");
    this.el.setAttribute("radius", width);
    this.el.setAttribute("metalness", "0.7");
    this.setRandomPosition();
    this.impactCount = -1;
  },

  setRandomPosition() {
    const z = -(Math.random() * 15 + 5);
    const x = (Math.random() * 15 + 5) * (Math.random() > 0.5 ? 1 : -1);
    const y = Math.random() * 10 + 0.25;
    this.el.object3D.position.set(x, y, z);
  },

  detectImpact(bulletPrevPosition, bulletPosition) {
    const line = new THREE.Line3(bulletPrevPosition, bulletPosition);
    const closestPoint = new THREE.Vector3();
    line.closestPointToPoint(this.el.object3D.position, true, closestPoint);
    const distance = closestPoint.distanceTo(this.el.object3D.position);
    // console.log(distance);

    if (distance < width ) {
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

  getTime() {
    return ((new Date().getTime() - this.startTime) / 1000).toFixed(3);
  },
});
