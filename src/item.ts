export abstract class Item {
  getFontObject(size) {
    return { size: size, family: 'Times New Roman' };
  }

  convertSecondsToMilliseconds(seconds: number): number {
    return seconds * 1000;
  }
}
