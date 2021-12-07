import { Image, Mask, Rect, Text } from 'svg.js';
import { DataPointHandler } from './dataPointHandler';
import { Item } from './item';

export class Thermometer extends Item {
  animation: any;
  dataPointHandler: DataPointHandler;
  draw: any;
  cupThermometerText: Text;
  cupThermometerRedBar: Image;
  cupThermometer: Image;
  cupThermometerMaskRectStartingX: number;
  cupThermometerMaskRectStartingY: number;
  cupThermometerMaskRect: Rect;
  cupThermometerMask: Mask;

  constructor(
    draw: any,
    x: number,
    y: number,
    text: string,
    thermometerY: number,
    dataPointHandler: any
  ) {
    super();

    // the text label above the Cup thermometer
    this.draw = draw;
    let cupThermometerTextX = x;
    let cupThermometerTextY = y - 14;
    this.cupThermometerText = this.draw.text(text);
    this.cupThermometerText.move(cupThermometerTextX, cupThermometerTextY);
    this.cupThermometerText.font(this.getFontObject(14));
    this.dataPointHandler = dataPointHandler;

    // the mercury
    const cupThermometerRedBarX = x + 8;
    const cupThermometerRedBarY = y + 3;
    this.cupThermometerRedBar = this.draw
      .image('./images/thermometerRedBar.svg')
      .move(cupThermometerRedBarX, cupThermometerRedBarY);

    // the thermometer
    this.cupThermometer = this.draw.image('./images/thermometer.svg').move(x, y);

    // The mask for the mercury that we will use to change the height of the mercury.
    this.cupThermometerMaskRectStartingX = x + 7;
    this.cupThermometerMaskRectStartingY = y + thermometerY;
    this.cupThermometerMaskRect = this.draw
      .rect(9, 70)
      .fill('white')
      .move(this.cupThermometerMaskRectStartingX, this.cupThermometerMaskRectStartingY);
    this.cupThermometerMask = this.draw.mask().add(this.cupThermometerMaskRect);
    this.cupThermometerRedBar.maskWith(this.cupThermometerMask);
  }

  startAnimation(animationDurationSeconds: number) {
    this.animation = this.cupThermometerMaskRect
      .animate(
        this.convertSecondsToMilliseconds(animationDurationSeconds),
        this.generateEasingFunction()
      )
      .move(this.cupThermometerMaskRectStartingX, 122);
    return this.animation;
  }

  generateEasingFunction(): any {
    const thisDataPointHandler = this.dataPointHandler;
    return (pos) => {
      return thisDataPointHandler.getScaledCounterPos(pos);
    };
  }

  resetMask() {
    this.cupThermometerMaskRect.move(
      this.cupThermometerMaskRectStartingX,
      this.cupThermometerMaskRectStartingY
    );
  }

  pause() {
    if (this.animation != null) {
      this.animation.pause();
    }
  }

  resume() {
    if (this.animation != null && this.animation.active) {
      this.animation.play();
    }
  }

  stop() {
    if (this.animation != null) {
      this.animation.stop();
    }
  }
}
