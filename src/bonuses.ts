import runSettings, { maxBulletSpeed } from "./run-settings";

export interface IBonus {
  name: string;
  modify(): void;
  isAvailable?(): boolean;
}

export const allBonuses: IBonus[] = [
  {
    name: "Cíle jsou pomalejší",
    modify() {
      runSettings.current.targetMoveSpeed /= 1.5;
    },
  },
  {
    name: "Cíle jsou blíž k tobě",
    modify() {
      runSettings.current.targetDistance /= 1.5;
    },
  },
  {
    name: "Kulky cíle jsou pomalejší",
    modify() {
      runSettings.current.targetBulletSpeed /= 1.5;
    },
  },
  {
    name: "Cíle střílejí mene casto",
    isAvailable() {
      return runSettings.current.targetShotDelay < 10;
    },
    modify() {
      runSettings.current.targetShotDelay *= 2;
    },
  },
  {
    name: "Cíle neumí mířit",
    modify() {
      runSettings.current.targetDispersion /= 1.5;
    },
  },
  {
    name: "Tvoje kulky jsou rychlejší",
    isAvailable() {
      return runSettings.current.playerBulletSpeed < maxBulletSpeed;
    },
    modify() {
      runSettings.current.playerBulletSpeed *= 1.5;
    },
  },
  {
    name: "Jeden život navíc",
    isAvailable() {
      return runSettings.current.playerLives < 6;
    },
    modify() {
      runSettings.current.playerLives++;
    },
  },
  {
    name: "Více bonusů k výběru",
    isAvailable() {
      return runSettings.current.bonusChoiceCount < 5;
    },
    modify() {
      runSettings.current.bonusChoiceCount++;
    },
  },
];
