import runSettings from "./run-settings";

export interface IBonus {
  name: string;
  modify(): void;
}

export const allBonuses: IBonus[] = [
  {
    name: "Zpomal cile na polovicni rychlost",
    modify() {
      runSettings.current.targetMoveSpeed /= 2;
    },
  },
];
