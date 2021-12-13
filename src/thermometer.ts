import { Image, Mask, Rect, Text } from 'svg.js';
import { DataPointHandler } from './dataPointHandler';
import { Item } from './item';
import { Util } from './util';

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
  label: string;

  constructor(
    draw: any,
    label: string,
    x: number,
    y: number,
    text: string,
    thermometerY: number,
    dataPointHandler: any
  ) {
    super();

    // the text label above the Cup thermometer
    this.draw = draw;
    let cupThermometerTextX = x - 20;
    let cupThermometerTextY = y - 24;
    this.cupThermometerText = this.draw.text(text);
    this.cupThermometerText.move(cupThermometerTextX, cupThermometerTextY);
    this.cupThermometerText.font(Util.getFontObject(14, '600'));
    this.dataPointHandler = dataPointHandler;
    this.label = label;

    // the mercury
    const cupThermometerRedBarX = x + 8;
    const cupThermometerRedBarY = y + 6;
    this.cupThermometerRedBar = this.draw
      .image('./images/thermometerRedBar.svg')
      .move(cupThermometerRedBarX, cupThermometerRedBarY);

    // the thermometer
    this.cupThermometer = this.draw.image('./images/thermometer.svg').move(x, y);

    // The mask for the mercury that we will use to change the height of the mercury.
    this.cupThermometerMaskRectStartingX = x + 7;
    this.cupThermometerMaskRectStartingY = y + thermometerY;
    this.cupThermometerMaskRect = this.draw
      .rect(9, 172)
      .fill('white')
      .move(this.cupThermometerMaskRectStartingX, this.cupThermometerMaskRectStartingY);
    this.cupThermometerMask = this.draw.mask().add(this.cupThermometerMaskRect);
    this.cupThermometerRedBar.maskWith(this.cupThermometerMask);
  }

  startAnimation(animationDurationSeconds: number) {
    const easingFunction = this.dataPointHandler.generateEasingFunction(this.label);
    this.animation = this.cupThermometerMaskRect
      .animate(this.convertSecondsToMilliseconds(animationDurationSeconds), easingFunction)
      .move(this.cupThermometerMaskRectStartingX, 221);
    return this.animation;
  }

  pause() {
    if (this.isPauseAllowed(this.animation)) {
      this.animation.pause();
    }
  }

  resume() {
    if (this.isResumeAllowed(this.animation)) {
      this.animation.play();
    }
  }

  stop() {
    if (this.animation != null) {
      this.animation.stop();
    }
  }

  reset() {
    this.resetMask();
    if (this.animation != null) {
      // setting paused to false prevents a bug that occurs sometimes when play is clicked but
      // the animation does not start playing
      this.animation.paused = false;
    }
    this.animation = null;
  }

  resetMask() {
    this.cupThermometerMaskRect.move(
      this.cupThermometerMaskRectStartingX,
      this.cupThermometerMaskRectStartingY
    );
  }
}
