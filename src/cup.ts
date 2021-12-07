import { Image, Mask, Rect } from 'svg.js';
import { AnimationHandler } from './animationHandler';
import { DataPointHandler } from './dataPointHandler';
import { Item } from './item';
import { Thermometer } from './thermometer';

export class Cup extends Item {
  animationHandler: AnimationHandler;
  cupGroup: any;
  cupGroupStartingX: number;
  cupGroupStartingY: number;
  cupHandle: Image;
  cupStart: Image;
  cupMask: Mask;
  cupMaskRect: Rect;
  cupMaskRectStartingX: number;
  cupMaskRectStartingY: number;
  cupTemperatureDisplay: any;
  cupEnd: Image;
  dataPointHandler: DataPointHandler;
  draw: any;
  heatAnimation: any;
  loweringAnimation: any;
  thermometer: Thermometer;

  constructor(
    draw: any,
    x: number,
    y: number,
    startCupImage: string,
    endCupImage: string,
    startTemp: number,
    animationHandler: AnimationHandler,
    dataPointHandler: DataPointHandler,
    thermometer: Thermometer
  ) {
    super();
    this.draw = draw;
    let cupX = x;
    let cupY = y;
    let cupHandleX = cupX - 22;
    let cupHandleY = cupY + 3;
    this.cupHandle = this.draw.image('./images/cupHandle.svg').move(cupHandleX, cupHandleY);
    this.cupStart = this.draw.image(startCupImage).move(cupX, cupY);
    this.cupEnd = this.draw.image(endCupImage).move(cupX, cupY);
    this.animationHandler = animationHandler;
    this.dataPointHandler = dataPointHandler;
    this.thermometer = thermometer;

    // create the text that displays the temperature on the cup
    let cupTemperatureDisplayX = cupX + 12;
    let cupTemperatureDisplayY = cupY + 10;
    this.cupTemperatureDisplay = this.draw
      .text(`${startTemp}\u00B0C`)
      .move(cupTemperatureDisplayX, cupTemperatureDisplayY);
    this.cupTemperatureDisplay.font(this.getFontObject(16));

    /*
     * Create the hot cup mask that we will use to slowly wipe away the hot cup
     * which will then reveal the warm cup.
     */
    let cupMaskGradient = this.draw
      .gradient('linear', (stop) => {
        stop.at(0, 'white');
        stop.at(0.9, 'white');
        stop.at(1, 'black');
      })
      .rotate(90);
    this.cupMaskRectStartingX = cupX;
    this.cupMaskRectStartingY = cupY;
    this.cupMaskRect = this.draw
      .rect(62, 44)
      .fill(cupMaskGradient)
      .move(this.cupMaskRectStartingX, this.cupMaskRectStartingY);
    this.cupMask = this.draw.mask().add(this.cupMaskRect);
    this.cupStart.maskWith(this.cupMask);

    /*
     * Put all the elements into a group so that we can move them all at once
     * when we lower the cup.
     */
    this.cupGroup = this.draw.group();
    this.cupGroup.add(this.cupHandle);
    this.cupGroup.add(this.cupEnd);
    this.cupGroup.add(this.cupStart);
    this.cupGroup.add(this.cupTemperatureDisplay);
    this.cupGroupStartingX = this.cupGroup.x();
    this.cupGroupStartingY = this.cupGroup.y();
  }

  resetCupPosition() {
    this.cupGroup.move(this.cupGroupStartingX, this.cupGroupStartingY);
  }

  resetCupHeatMask() {
    this.cupMaskRect.move(this.cupMaskRectStartingX, this.cupMaskRectStartingY);
  }

  setCupTemperatureReadout(temp) {
    this.cupTemperatureDisplay.text(Math.floor(temp) + '\u00B0C');
  }

  startAnimation(lowerCupTime: number, heatChangeTime: number, tickCallback: any): any {
    this.loweringAnimation = this.startCupLowering(lowerCupTime, heatChangeTime, tickCallback);
  }

  startCupLowering(lowerCupTime: number, heatChangeTime: number, tickCallback: any): any {
    return this.cupGroup
      .animate(this.convertSecondsToMilliseconds(lowerCupTime))
      .move(0, 12)
      .after(() => {
        this.heatAnimation = this.startCupHeatTransfer(heatChangeTime, tickCallback);
      });
  }

  startCupHeatTransfer(animationDurationSeconds: number, tickCallback: any): any {
    const cupMaskAnimation: any = this.cupMaskRect
      .animate(this.convertSecondsToMilliseconds(animationDurationSeconds))
      .move(this.cupMaskRectStartingX, 18);
    this.thermometer.startAnimation(animationDurationSeconds);
    for (let t = 0; t <= animationDurationSeconds; t++) {
      cupMaskAnimation.once(t * (1 / animationDurationSeconds), () => {
        tickCallback();
      });
    }
    cupMaskAnimation.after(() => {
      this.animationHandler.setCompleted();
    });
    return cupMaskAnimation;
  }

  generateCupThermometerEasingFunction() {
    const thisDataPointHandler = this.dataPointHandler;
    return (pos) => {
      return thisDataPointHandler.getScaledCupPos(pos);
    };
  }

  pause() {
    if (this.loweringAnimation != null) {
      this.loweringAnimation.pause();
    }
    if (this.heatAnimation != null) {
      this.heatAnimation.pause();
    }
  }

  resume() {
    if (this.loweringAnimation != null && this.loweringAnimation.active) {
      this.loweringAnimation.play();
    }
    if (this.heatAnimation != null && this.heatAnimation.active) {
      this.heatAnimation.play();
    }
  }

  stop() {
    if (this.loweringAnimation != null) {
      this.loweringAnimation.stop();
    }
    if (this.heatAnimation != null) {
      this.heatAnimation.stop();
    }
  }
}
