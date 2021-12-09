import { Image, Mask, Rect } from 'svg.js';
import { AnimationHandler } from './animationHandler';
import { DataPointHandler } from './dataPointHandler';
import { Item } from './item';
import { Thermometer } from './thermometer';
import { Util } from './util';

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
  label: string;
  loweringAnimation: any;
  thermometer: Thermometer;

  constructor(
    draw: any,
    label: string,
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
    this.label = label;

    // create the text that displays the temperature on the cup
    let cupTemperatureDisplayX = cupX + 8;
    let cupTemperatureDisplayY = cupY + 10;
    this.cupTemperatureDisplay = this.draw
      .text(this.getCupTemperatureText(startTemp))
      .move(cupTemperatureDisplayX, cupTemperatureDisplayY);
    this.cupTemperatureDisplay.font(this.getFontObject(16));
    this.cupTemperatureDisplay.style('white-space', 'pre');

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

  getCupTemperatureText(temp) {
    return Util.getLeadingWhiteSpace(temp) + Math.floor(temp) + '\u00B0C';
  }

  setCupTemperatureReadout(temp) {
    this.cupTemperatureDisplay.text(this.getCupTemperatureText(temp));
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
      .attr({ opacity: 0 });
    this.thermometer.startAnimation(animationDurationSeconds);
    for (let t = 0; t <= animationDurationSeconds; t++) {
      cupMaskAnimation.once(t * (1 / animationDurationSeconds), () => {
        tickCallback();
      });
    }
    cupMaskAnimation.after(() => {
      this.animationHandler.setCompleted(this.label);
    });
    return cupMaskAnimation;
  }

  pause() {
    if (this.isPauseAllowed(this.loweringAnimation)) {
      this.loweringAnimation.pause();
    }
    if (this.isPauseAllowed(this.heatAnimation)) {
      this.heatAnimation.pause();
    }
  }

  resume() {
    if (this.isResumeAllowed(this.loweringAnimation)) {
      this.loweringAnimation.play();
    }
    if (this.isResumeAllowed(this.heatAnimation)) {
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

  reset() {
    this.resetCupPosition();
    this.resetCupHeatMask();
  }

  resetCupPosition() {
    this.cupGroup.move(this.cupGroupStartingX, this.cupGroupStartingY);
    if (this.loweringAnimation != null) {
      // setting paused to false prevents a bug that occurs sometimes when play is clicked but
      // the animation does not start playing
      this.loweringAnimation.paused = false;
    }
    this.loweringAnimation = null;
  }

  resetCupHeatMask() {
    this.cupMaskRect.opacity(1);
    if (this.heatAnimation != null) {
      // setting paused to false prevents a bug that occurs sometimes when play is clicked but
      // the animation does not start playing
      this.heatAnimation.paused = false;
    }
    this.heatAnimation = null;
  }
}
