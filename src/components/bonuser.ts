import AFRAME, { Component } from "aframe";
import { allBonuses, IBonus } from "../bonuses";
import runSettings from "../run-settings";

interface BonuserComponent extends Component {
  chooseBonus(): Promise<IBonus>;
}

AFRAME.registerComponent("bonuser", {
  schema: {},

  init() {},

  chooseBonus(): Promise<IBonus> {
    return new Promise<IBonus>((resolve) => {
      const camera = document.getElementById("camera") as AFRAME.Entity;

      const cursor = document.createElement("a-cursor");
      cursor.setAttribute("fuse", "false");
      cursor.setAttribute("objects", ".choise");
      cursor.setAttribute("material", "color: red; shader: flat");
      cursor.setAttribute("geometry", "primitive: ring; radiusInner: 0.007; radiusOuter: 0.012");

      camera.appendChild(cursor);

      const bonuses = [...allBonuses];
      const chosenBonuses = [] as IBonus[];
      for (let index = 0; index < runSettings.current.bonusChoiseCount; index++) {
        const randomIndex = Math.floor(Math.random() * bonuses.length);
        chosenBonuses.push(bonuses.splice(randomIndex, 1)[0]);
        if (bonuses.length === 0) {
          break;
        }
      }

      this.createChoices(cursor, resolve, chosenBonuses);
    });
  },

  createChoices(cursor: AFRAME.Entity, resolveFunc: (ret: IBonus) => void, bonuses: IBonus[]) {
    for (let index = 0; index < bonuses.length; index++) {
      const bonus = bonuses[index];
      const plane = document.createElement("a-plane");
      plane.setAttribute("side", "double");
      plane.setAttribute("src", "#choise-texture");
      plane.setAttribute("width", "0.8");
      plane.setAttribute("height", "0.42");
      plane.setAttribute("class", "choise");
      plane.setAttribute("position", `${(index - (bonuses.length - 1) / 2) * 0.9} 0 0`);

      plane.addEventListener("click", () => {
        cursor.parentNode?.removeChild(cursor);
        const children = [...plane.parentNode!.childNodes.values()];
        const parent = plane.parentNode as AFRAME.Entity;
        for (const child of children) {
          parent.removeChild(child);
        }
        resolveFunc(bonus);
      });

      const textShadow = document.createElement("a-text");
      textShadow.setAttribute("align", "center");
      textShadow.setAttribute("width", "0.7");
      textShadow.setAttribute("wrap-count", "20");
      textShadow.setAttribute("color", "black");
      textShadow.setAttribute("value", bonus.name);
      textShadow.setAttribute("position", "0.002 -0.002 0");
      plane.appendChild(textShadow);

      const text = document.createElement("a-text");
      text.setAttribute("position", "0 0 0.001");
      text.setAttribute("align", "center");
      text.setAttribute("width", "0.7");
      text.setAttribute("wrap-count", "20");
      text.setAttribute("color", "white");
      text.setAttribute("value", bonus.name);
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
