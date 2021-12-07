import { DataPointHandler } from './dataPointHandler';
import * as SVG from 'svg.js';
import { CupCounterModel } from './cupCounterModel';
import { Cup } from './cup';
import { Counter } from './counter';
import { Thermometer } from './thermometer';

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
    this.draw = SVG('modelDiv').size(400, 200);
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
      50,
      70,
      './images/cupHot.svg',
      './images/cupWarm.svg',
      60,
      this,
      this.dataPointHandler,
      thermometer
    );
  }

  createColdCup(thermometer: Thermometer) {
    return new Cup(
      this.draw,
      260,
      70,
      './images/cupCold.svg',
      './images/cupWarm.svg',
      20,
      this,
      this.dataPointHandler,
      thermometer
    );
  }

  createLeftCounter() {
    return new Counter(this.draw, 42, 120);
  }

  createRightCounter() {
    return new Counter(this.draw, 252, 120);
  }

  createLeftThermometer() {
    return new Thermometer(this.draw, 140, 70, 'Left', 5, this.dataPointHandler);
  }

  createRightThermometer() {
    return new Thermometer(this.draw, 200, 70, 'Right', 68, this.dataPointHandler);
  }

  /**
   * Create the temperature markings for the thermometers that looks like
   * - 60°C -
   * - 50°C -
   * - 40°C -
   * - 30°C -
   * - 20°C -
   */
  createThermometerTemperatureMarks() {
    let text =
      ' - 60\u00B0C - \n - 50\u00B0C -  \n - 40\u00B0C -  \n - 30\u00B0C -  \n - 20\u00B0C - ';
    this.temperatureLabels = this.draw.text(text);
    this.temperatureLabels.move(162, 70);
    this.temperatureLabels.font(this.getFontObject(12));
  }

  /**
   * The done message that we will display when the simulation completes
   * running.
   */
  createDoneMessage() {
    this.doneText = this.draw.text('Done!');
    this.doneText.move(160, 25);
    this.doneText.font(this.getFontObject(16));
    this.doneText.hide();
  }

  /**
   * Get an object that contains specifications for a font.
   * @param size The font size.
   * @return A object containing font attributes.
   */
  getFontObject(size) {
    return { size: size, family: 'Times New Roman' };
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

  /**
   * Generate a function that scales the cup position.
   */
  generateCupThermometerEasingFunction() {
    let thisDataPointHandler = this.dataPointHandler;
    return (pos) => {
      return thisDataPointHandler.getScaledCupPos(pos);
    };
  }

  /**
   * Generate a function that scales the counter position.
   */
  generateCounterThermometerEasingFunction() {
    let thisDataPointHandler = this.dataPointHandler;
    return (pos) => {
      return thisDataPointHandler.getScaledCounterPos(pos);
    };
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
    const cupTemperature = this.dataPointHandler.getCupTemperature(time);
    const counterTemperature = this.dataPointHandler.getCounterTemperature(time);
    this.hotCup.setCupTemperatureReadout(cupTemperature);
    this.coldCup.setCupTemperatureReadout(counterTemperature);
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

    // reset all the animations
    this.resetCupPosition();
    this.resetCupHeatMask();
    this.resetCupThermometerMask();
    this.hideDoneMessage();

    /*
     * Set the cup and counter temperature displays back to their starting
     * temperatures.
     */
    let time = this.getTimeCounter();
    this.hotCup.setCupTemperatureReadout(this.dataPointHandler.getCupTemperature(time));
    this.coldCup.setCupTemperatureReadout(this.dataPointHandler.getCounterTemperature(time));
  }

  /**
   * Set the cup back to its starting position.
   */
  resetCupPosition() {
    this.cups.forEach((cup) => {
      cup.resetCupPosition();
    });
  }

  /**
   * Set the cup heat mask back to its starting position so that the hot cup
   * is fully displayed.
   */
  resetCupHeatMask() {
    this.cups.forEach((cup) => {
      cup.resetCupHeatMask();
    });
  }

  /**
   * Set the cup thermometer mask back to its starting position so that the
   * thermometer is at 60C.
   */
  resetCupThermometerMask() {
    this.cups.forEach((cup) => {
      cup.thermometer.resetMask();
    });
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

  setCompleted() {
    this.cupCounterModel.setCompleted();
  }
}
