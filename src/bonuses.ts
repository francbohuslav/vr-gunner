import runSettings, { maxBulletSpeed } from "./run-settings";

export interface IBonus {
  name: string;
  modify(): void;
  isAvailable?(): boolean;
}

export const allBonuses: IBonus[] = [
  {
    name: "Cile jsou pomalejsi",
    modify() {
      runSettings.current.targetMoveSpeed /= 1.5;
    },
  },
  {
    name: "Kulky cile jsou pomalejsi",
    modify() {
      runSettings.current.targetBulletSpeed /= 1.5;
    },
  },
  {
    name: "Cile strileji mene casto",
    isAvailable() {
      return runSettings.current.targetShotDelay < 10;
    },
    modify() {
      runSettings.current.targetShotDelay *= 2;
    },
  },
  {
    name: "Cile neumi mirit",
    modify() {
      runSettings.current.targetDispersion /= 1.5;
    },
  },
  {
    name: "Tvoje kulky jsou rychlejsi",
    isAvailable() {
      return runSettings.current.playerBulletSpeed < maxBulletSpeed;
    },
    modify() {
      runSettings.current.playerBulletSpeed *= 1.5;
    },
  },
  {
    name: "Jeden zivot navic",
    isAvailable() {
      return runSettings.current.playerLives < 6;
    },
    modify() {
      runSettings.current.playerLives++;
    },
  },
  {
    name: "Vice bonusu k vyberu",
    isAvailable() {
      return runSettings.current.bonusChoiceCount < 5;
    },
    modify() {
      runSettings.current.bonusChoiceCount++;
    },
  },
];
