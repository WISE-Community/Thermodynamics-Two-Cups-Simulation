import { DataPointHandler } from './dataPointHandler';
import * as SVG from 'svg.js';
import { CupCounterModel } from './cupCounterModel';
import { Cup } from './cup';
import { Counter } from './counter';
import { Thermometer } from './thermometer';
import { Util } from './util';

/**
 * The class that moves and animates images.
 */
export class AnimationHandler {
  coldCup: Cup;
  // the model which we need a reference to in order to pause, resume, and stop it
  cupCounterModel: CupCounterModel;
  cups: Cup[] = [];
  // handles the temperature data points that are displayed and sent to WISE
  dataPointHandler: DataPointHandler;
  draw: any;
  doneText: SVG.Text;
  hotCup: Cup;
  items: any[] = [];
  cupToIsAnimationCompleted: any = {};
  temperatureLabels: SVG.Text;
  // keeps track of the time in integer seconds
  time: number;

  /**
   * Constructor that sets up event listeners.
   * @param cupCounterModel The cup counter model.
   */
  constructor(cupCounterModel: CupCounterModel) {
    this.time = 0;
    this.cupCounterModel = cupCounterModel;
    this.dataPointHandler = new DataPointHandler();
    this.draw = SVG('modelDiv').size(400, 300);
    this.initializeItems();
    this.createThermometerTemperatureMarks();
    this.createDoneMessage();
  }

  initializeItems() {
    const leftThermometer = this.createLeftThermometer();
    const rightThermometer = this.createRightThermometer();
    this.hotCup = this.createHotCup(leftThermometer);
    this.coldCup = this.createColdCup(rightThermometer);
    this.cups.push(this.hotCup, this.coldCup);
    this.addItems([leftThermometer, rightThermometer, this.hotCup, this.coldCup]);
    this.createLeftCounter();
    this.createRightCounter();
  }

  addItems(items: any[]): void {
    items.forEach((item) => {
      this.items.push(item);
    });
  }

  createHotCup(thermometer: Thermometer) {
    return new Cup(
      this.draw,
      'cold',
      50,
      120,
      './images/cupHot.svg',
      './images/cupWarm.svg',
      100,
      this,
      this.dataPointHandler,
      thermometer
    );
  }

  createColdCup(thermometer: Thermometer) {
    return new Cup(
      this.draw,
      'hot',
      260,
      120,
      './images/cupCold.svg',
      './images/cupWarm.svg',
      5,
      this,
      this.dataPointHandler,
      thermometer
    );
  }

  createLeftCounter() {
    return new Counter(this.draw, 42, 170);
  }

  createRightCounter() {
    return new Counter(this.draw, 252, 170);
  }

  createLeftThermometer() {
    return new Thermometer(this.draw, 'hot', 140, 90, 'Left Cup', 5, this.dataPointHandler);
  }

  createRightThermometer() {
    return new Thermometer(this.draw, 'cold', 208, 90, 'Right Cup', 155, this.dataPointHandler);
  }

  /**
   * Create the temperature markings for the thermometers that looks like
   * - 100°C -
   * -  90°C -
   * ...
   * -  10°C -
   * -   0°C -
   */
  createThermometerTemperatureMarks() {
    let text = '';
    for (let c = 100; c >= 0; c -= 10) {
      text += ' -';
      text += Util.getLeadingWhiteSpace(c);
      text += `${c}\u00B0C - \n`;
    }
    this.temperatureLabels = this.draw.text(text);
    this.temperatureLabels.style('white-space', 'pre');
    this.temperatureLabels.move(160, 90);
    this.temperatureLabels.font(Util.getFontObject(12));
  }

  /**
   * The done message that we will display when the simulation completes
   * running.
   */
  createDoneMessage() {
    this.doneText = this.draw.text('Done!');
    this.doneText.move(136, 28);
    this.doneText.font(Util.getFontObject(16));
    this.doneText.fill('royalblue');
    this.doneText.hide();
  }

  /**
   * Start the animation that lowers the cup onto the counter.
   */
  startAnimation() {
    this.dataPointHandler.initializeTrial();
    this.updateTemperatures();
    this.hotCup.startAnimation(1, 15, () => {
      // We will increment time and update temperature for both cups from the hot cup to keep it
      // simple. If we didn't, we would need to somehow synchronize the hot cup and cold cup
      // animations.
      this.incrementTimeAndUpdateTemperatures();
    });
    this.coldCup.startAnimation(1, 15, () => {});
  }

  incrementTimeAndUpdateTemperatures() {
    this.incrementTimeCounter();
    this.updateTemperatures();
  }

  /**
   * Update the temperatures on the display and send them to WISE.
   */
  updateTemperatures() {
    // send the updated trial to WISE
    this.dataPointHandler.updateAndSendTrial(this.getTimeCounter());

    // update the temperatures displayed on the cup and counter
    const time = this.getTimeCounter();
    const hotCupTemperature = this.dataPointHandler.getHotCupTemperature(time);
    const coldCupTemperature = this.dataPointHandler.getColdCupTemperature(time);
    this.hotCup.setCupTemperatureReadout(hotCupTemperature);
    this.coldCup.setCupTemperatureReadout(coldCupTemperature);
  }

  /**
   * Get the current time in the model.
   * @return An integer representing the amount of time the model has been
   * running. The value will be between 0-15 inclusive.
   */
  getTimeCounter() {
    return this.time;
  }

  /**
   * Increment the model timer by 1 second.
   */
  incrementTimeCounter() {
    this.time += 1;
  }

  /**
   * Set the model timer back to 0 seconds.
   */
  resetTimeCounter() {
    this.time = 0;
  }

  /**
   * Pause all the elements in the model.
   */
  pause() {
    this.items.forEach((item) => {
      item.pause();
    });
  }

  /**
   * Resume animating all the elements in the model.
   */
  resume() {
    this.items.forEach((item) => {
      item.resume();
    });
  }

  /**
   * Stop all the animations which consist of the cup movement animation,
   * heat transfer animations, and thermometer animations.
   */
  stopAnimations() {
    this.items.forEach((item) => {
      item.stop();
    });
  }

  /**
   * Reset all the elements back to their original positions and states.
   */
  resetAnimations() {
    // set the time back to 0
    this.resetTimeCounter();

    this.resetItemAnimations();
    this.hideDoneMessage();
    this.resetCupToIsAnimationCompleted();

    /*
     * Set the cup and counter temperature displays back to their starting
     * temperatures.
     */
    let time = this.getTimeCounter();
    this.hotCup.setCupTemperatureReadout(this.dataPointHandler.getHotCupTemperature(time));
    this.coldCup.setCupTemperatureReadout(this.dataPointHandler.getColdCupTemperature(time));
  }

  resetItemAnimations() {
    this.items.forEach((item) => {
      item.reset();
    });
  }

  resetCupToIsAnimationCompleted() {
    this.cupToIsAnimationCompleted = {};
  }

  /**
   * The model is done running.
   */
  modelCompleted() {
    this.showDoneMessage();
  }

  showDoneMessage() {
    this.doneText.show();
  }

  hideDoneMessage() {
    this.doneText.hide();
  }

  setCompleted(label: string): void {
    this.cupToIsAnimationCompleted[label] = true;
    if (this.cupToIsAnimationCompleted['cold'] && this.cupToIsAnimationCompleted['hot']) {
      this.cupCounterModel.setCompleted();
    }
  }
}
