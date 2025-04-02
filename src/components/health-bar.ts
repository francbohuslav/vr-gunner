import AFRAME, { Component } from "aframe";

interface HealthBarComponent extends Component {
  healthEntity: AFRAME.Entity;
}

AFRAME.registerComponent("health-bar", {
  schema: {
    percents: { type: "number", default: 100 },
  },

  init: function (this: HealthBarComponent) {
    this.el.setAttribute("geometry", "width: 1; height: 0.15; depth: 0.01;");
    this.el.setAttribute("material", "color: #333; shader: flat;");
    this.healthEntity = document.createElement("a-entity");
    this.healthEntity.setAttribute("position", "0 0 0.1");
    this.healthEntity.setAttribute("geometry", "width: 0.9; height: 0.08; depth: 0.01;");
    this.healthEntity.setAttribute("scale", "1 1 1");
    this.healthEntity.setAttribute("material", "color: red; shader: flat;");
    this.el.appendChild(this.healthEntity);
  },

  update: function (this: HealthBarComponent) {
    this.healthEntity.setAttribute("scale", (this.data.percents / 100).toFixed(2) + " 1 1");
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    ["health-bar"]: InstanceType<ComponentConstructor<HealthBarComponent>>;
  }
}
