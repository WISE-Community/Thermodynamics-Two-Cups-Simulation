export abstract class Item {
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
