export interface IRunSettings {
  level: number;
  targetMoveSpeed: number;
  targetBulletSpeed: number;
  targetShotDelay: number;
  targetShotAfterStartDelay: number;
}

export const defaultRunSettings: IRunSettings = {
  level: 1,
  targetMoveSpeed: 0.0002,
  targetBulletSpeed: 0.003,
  targetShotDelay: 5,
  targetShotAfterStartDelay: 5,
};

class RunSettings {
  public current: IRunSettings = { ...defaultRunSettings };

  public reset() {
    this.current = { ...defaultRunSettings };
  }

  nextLevel() {
    this.current.level++;
    this.current.targetMoveSpeed = this.interpolateValue(this.current.targetMoveSpeed, defaultRunSettings.targetMoveSpeed, 0.005);
    this.current.targetBulletSpeed = this.interpolateValue(this.current.targetBulletSpeed, defaultRunSettings.targetBulletSpeed, 0.02);
    this.current.targetShotDelay = Math.max(1, this.current.targetShotDelay - 0.4);
    this.current.targetShotAfterStartDelay = Math.max(0, this.current.targetShotAfterStartDelay - 0.5);
  }

  private interpolateValue(currentValue: number, startValue: number, valueIn10thLevel: number): number {
    const growCoef = Math.pow(valueIn10thLevel / startValue, 1 / (10 - 1));
    return currentValue * growCoef;
  }
}

export default new RunSettings();
