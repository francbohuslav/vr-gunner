import AFRAME, { Component } from "aframe";
import { allBonuses, IBonus } from "../bonuses";
import runSettings from "../run-settings";

interface BonuserComponent extends Component {
  createChoices(chosenBonuses: IBonus[]): Promise<IBonus>;
  chooseBonus(): Promise<IBonus>;
  selectedBonus: IBonus | undefined;
  resolveSelectionPromise?(): void;
}

AFRAME.registerComponent("bonuser", {
  schema: {},

  init() {},

  async chooseBonus(this: BonuserComponent): Promise<IBonus> {
    const camera = document.getElementById("camera") as AFRAME.Entity;
    camera.setAttribute("raycaster", "objects: .choise");
    document.getElementById("crosshair")?.setAttribute("visible", "true");

    const bonuses = allBonuses.filter((b) => b.isAvailable?.() ?? true);
    const chosenBonuses: IBonus[] = [];
    for (let index = 0; index < runSettings.current.bonusChoiceCount; index++) {
      const randomIndex = Math.floor(Math.random() * bonuses.length);
      chosenBonuses.push(bonuses.splice(randomIndex, 1)[0]);
      if (bonuses.length === 0) {
        break;
      }
    }

    await this.createChoices(chosenBonuses);
    const bonus = this.selectedBonus;
    if (!bonus) {
      throw new Error("No bonus selected");
    }
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
    this.selectedBonus = undefined;
    this.resolveSelectionPromise = undefined;
    camera.removeAttribute("raycaster");
    document.getElementById("crosshair")?.setAttribute("visible", "false");
    return bonus;
  },

  createChoices(this: BonuserComponent, bonuses: IBonus[]): Promise<void> {
    return new Promise((resolveFunc) => {
      this.resolveSelectionPromise = resolveFunc;
      for (let index = 0; index < bonuses.length; index++) {
        const bonus = bonuses[index];
        const plane = document.createElement("a-plane");
        plane.setAttribute("side", "double");
        plane.setAttribute("src", "#choise-texture");
        plane.setAttribute("width", "0.8");
        plane.setAttribute("height", "0.42");
        plane.setAttribute("class", "choise");
        plane.setAttribute("position", `${(index - (bonuses.length - 1) / 2) * 0.9} 0 0`);

        plane.addEventListener("raycaster-intersected", (e) => {
          (e.target as AFRAME.Entity).setAttribute("material", "color: #FF3333");
          this.selectedBonus = bonus;
        });

        plane.addEventListener("raycaster-intersected-cleared", (e) => {
          (e.target as AFRAME.Entity).setAttribute("material", "color: white");
          this.selectedBonus = undefined;
        });

        const textShadow = document.createElement("a-text");
        textShadow.setAttribute("align", "center");
        textShadow.setAttribute("width", "0.7");
        textShadow.setAttribute("wrap-count", "20");
        textShadow.setAttribute("color", "black");
        textShadow.setAttribute("value", bonus.name);
        textShadow.setAttribute("position", "0.002 -0.002 0");
        textShadow.setAttribute("mixin", "mixin-font");
        textShadow.setAttribute("negate", "false");
        plane.appendChild(textShadow);

        const text = document.createElement("a-text");
        text.setAttribute("position", "0 0 0.001");
        text.setAttribute("align", "center");
        text.setAttribute("width", "0.7");
        text.setAttribute("wrap-count", "20");
        text.setAttribute("color", "white");
        text.setAttribute("value", bonus.name);
        text.setAttribute("mixin", "mixin-font");
        text.setAttribute("negate", "false");
        plane.appendChild(text);

        this.el.appendChild(plane);
      }
    });
  },
});

declare module "aframe" {
  export interface DefaultComponents {
    bonuser: InstanceType<ComponentConstructor<BonuserComponent>>;
  }
}
