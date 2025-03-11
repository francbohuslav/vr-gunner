import AFRAME, { Component } from "aframe";
const THREE = AFRAME.THREE;

const width = 0.4;

let lowestDistance = 100;

interface PlayerComponent extends Component {
  detectImpact(bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3): boolean;
}

AFRAME.registerComponent("player", {
  schema: {},

  detectImpact(bulletPrevPosition: AFRAME.THREE.Vector3, bulletPosition: AFRAME.THREE.Vector3) {
    const bulletLine = new THREE.Line3(bulletPrevPosition, bulletPosition);
    const closestPointToHeadOnBulletLine = new THREE.Vector3();
    bulletLine.closestPointToPoint(this.el.object3D.position, true, closestPointToHeadOnBulletLine);

    const bodyLine = new THREE.Line3(new THREE.Vector3(this.el.object3D.position.x, 0, this.el.object3D.position.z), this.el.object3D.position);
    // console.log(JSON.stringify(bulletLine));
    const closestPointOnBody = new THREE.Vector3();
    bodyLine.closestPointToPoint(closestPointToHeadOnBulletLine, true, closestPointOnBody);
    const distance = closestPointOnBody.distanceTo(closestPointToHeadOnBulletLine);
    lowestDistance = Math.min(lowestDistance, distance);
    // console.log("bulletId=" + bulletId, JSON.stringify(bulletLine), JSON.stringify(bodyLine), distance);
    if (distance < width / 2) {
      const scene = document.querySelector("a-scene")!;
      scene.components.game.playerHit();
      return true;
    } else {
      return false;
    }
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    player: InstanceType<ComponentConstructor<PlayerComponent>>;
  }
}
