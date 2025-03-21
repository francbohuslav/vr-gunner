export interface IRunSettings {
  level: number;
  targetMoveSpeed: number;
  targetBulletSpeed: number;
  targetShotDelay: number;
  targetDispersion: number;
  playerBulletSpeed: number;
  playerLives: number;
  bonusChoiceCount: number;
}

export const defaultRunSettings: IRunSettings = {
  level: 1,
  targetMoveSpeed: 0.0002,
  targetBulletSpeed: 0.003,
  targetShotDelay: 5,
  targetDispersion: 25,
  playerBulletSpeed: 0.005,
  playerLives: 3,
  bonusChoiceCount: 3,
};

// Maximum os 0.5 because of correct collision detection
export const maxBulletSpeed = 0.5;

class RunSettings {
  public current: IRunSettings = { ...defaultRunSettings };

  public reset() {
    this.current = { ...defaultRunSettings };
  }

  nextLevel() {
    this.current.level++;
    this.current.targetMoveSpeed = Math.min(this.interpolateValue(this.current.targetMoveSpeed, defaultRunSettings.targetMoveSpeed, 0.005), 0.03);
    this.current.targetBulletSpeed = Math.min(
      this.interpolateValue(this.current.targetBulletSpeed, defaultRunSettings.targetBulletSpeed, 0.02),
      maxBulletSpeed
    );
    this.current.targetShotDelay = Math.max(1, this.current.targetShotDelay - 0.4);
    this.current.targetDispersion = Math.min(this.interpolateValue(this.current.targetDispersion, defaultRunSettings.targetDispersion, 200), 500);
  }

  private interpolateValue(currentValue: number, startValue: number, valueIn10thLevel: number): number {
    const growCoef = Math.pow(valueIn10thLevel / startValue, 1 / (10 - 1));
    return currentValue * growCoef;
  }
}

export default new RunSettings();
