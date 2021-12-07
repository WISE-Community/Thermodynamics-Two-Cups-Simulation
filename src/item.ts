export abstract class Item {
  getFontObject(size) {
    return { size: size, family: 'Times New Roman' };
  }

  convertSecondsToMilliseconds(seconds: number): number {
    return seconds * 1000;
  }

  isPauseAllowed(animation: any): boolean {
    return animation != null && !animation.paused && animation.pos != 1;
  }

  isResumeAllowed(animation: any): boolean {
    return animation != null && animation.pos != 1;
  }
}
