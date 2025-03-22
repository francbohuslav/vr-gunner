import AFRAME, { Component } from "aframe";
import runSettings from "../run-settings";

interface LivesComponent extends Component {
  panel: AFRAME.Entity;
  updateLives(): void;
}

AFRAME.registerComponent("lives", {
  schema: {},

  init(this: LivesComponent) {
    const panel = (this.panel = document.createElement("a-entity"));
    panel.setAttribute("position", "0 0.01 0");
    this.el.appendChild(panel);
    for (let i = 0; i < 6; i++) {
      const live = document.createElement("a-box");
      live.setAttribute("width", "0.015");
      live.setAttribute("height", "0.0025");
      live.setAttribute("depth", "0.001");
      live.setAttribute("color", "gray");
      live.setAttribute("position", `0 -${i * 0.004} 0`);
      this.panel.appendChild(live);
    }
    this.updateLives();
  },

  updateLives(this: LivesComponent) {
    for (let i = 0; i < 6; i++) {
      const live = this.panel.childNodes[i] as AFRAME.Entity;
      live.setAttribute("color", i < runSettings.current.playerLives ? "red" : "gray");
    }
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    lives: InstanceType<ComponentConstructor<LivesComponent>>;
  }
}
