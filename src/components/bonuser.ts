import AFRAME, { Component } from "aframe";
import { BonusBase } from "../bonuses";

interface BonuserComponent extends Component {
  chooseBonus(): Promise<BonusBase>;
}

AFRAME.registerComponent("bonuser", {
  schema: {},

  init() {},

  chooseBonus(): Promise<BonusBase> {
    return new Promise<BonusBase>((resolve) => {
      const camera = document.getElementById("camera") as AFRAME.Entity;

      const cursor = document.createElement("a-cursor");
      cursor.setAttribute("fuse", "false");
      cursor.setAttribute("objects", ".choise");
      cursor.setAttribute("material", "color: red; shader: flat");
      cursor.setAttribute("geometry", "primitive: ring; radiusInner: 0.007; radiusOuter: 0.012");

      camera.appendChild(cursor);

      this.createChoices(cursor, resolve, ["ahjp", "nazdar", "cest"]);
    });
  },

  createChoices(cursor: AFRAME.Entity, resolveFunc: (ret: BonusBase) => void, choices: string[]) {
    for (let index = 0; index < choices.length; index++) {
      const choice = choices[index];
      const plane = document.createElement("a-plane");
      plane.setAttribute("side", "double");
      plane.setAttribute("src", "#choise-texture");
      plane.setAttribute("width", "0.8");
      plane.setAttribute("height", "0.42");
      plane.setAttribute("class", "choise");
      plane.setAttribute("position", `${(index - (choices.length - 1) / 2) * 0.9} 0 0`);

      plane.addEventListener("click", () => {
        cursor.parentNode?.removeChild(cursor);
        const children = [...plane.parentNode!.childNodes.values()];
        const parent = plane.parentNode as AFRAME.Entity;
        for (const child of children) {
          parent.removeChild(child);
        }
        resolveFunc(choice);
      });

      const textShadow = document.createElement("a-text");
      textShadow.setAttribute("align", "center");
      textShadow.setAttribute("width", "0.7");
      textShadow.setAttribute("wrap-count", "20");
      textShadow.setAttribute("color", "black");
      textShadow.setAttribute("value", choice);
      textShadow.setAttribute("position", "0.002 -0.002 0");
      plane.appendChild(textShadow);

      const text = document.createElement("a-text");
      text.setAttribute("position", "0 0 0.001");
      text.setAttribute("align", "center");
      text.setAttribute("width", "0.7");
      text.setAttribute("wrap-count", "20");
      text.setAttribute("color", "white");
      text.setAttribute("value", choice);
      plane.appendChild(text);

      this.el.appendChild(plane);
    }
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    bonuser: InstanceType<ComponentConstructor<BonuserComponent>>;
  }
}
