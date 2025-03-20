import runSettings from "./run-settings";

export interface IBonus {
  name: string;
  modify(): void;
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
    name: "Cile po startu strileji pozdeji",
    modify() {
      runSettings.current.targetShotAfterStartDelay *= 2;
    },
  },
  {
    name: "Cile strileji mene casto",
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
    modify() {
      runSettings.current.playerBulletSpeed *= 1.5;
    },
  },
  {
    name: "Jeden zivot navic",
    modify() {
      runSettings.current.playerLives++;
    },
  },
  {
    name: "Vice bonusu k vyberu",
    modify() {
      runSettings.current.bonusChoiceCount++;
    },
  },
];
