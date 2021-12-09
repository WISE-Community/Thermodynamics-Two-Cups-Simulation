import { Trial } from './trial';
import { WISEAPI } from './wiseAPI';

/**
 * The class that handles the temperature data points and sends them to WISE.
 */
export class DataPointHandler {
  // temperature limits in Celsius
  coldCupStartTemperature = 5;
  coldCupEndTemperature = 20;
  hotCupStartTemperature = 100;
  hotCupEndTemperature = 20;

  // the max time in minutes
  maxTime = 120;

  // the trial object that we will send to WISE
  trial: Trial;

  // the API we use to send data to WISE
  wiseAPI: WISEAPI;

  constructor() {
    this.trial = new Trial();
    this.wiseAPI = new WISEAPI();
  }

  getHotCupTemperature(time: number): number {
    const logisticYMax =
      this.hotCupStartTemperature + (this.hotCupStartTemperature - this.hotCupEndTemperature);
    return this.logisticFunction(this.hotCupEndTemperature, logisticYMax, -0.06, time);
  }

  getColdCupTemperature(time: number): number {
    const logisticYMin =
      this.coldCupStartTemperature - (this.coldCupEndTemperature - this.coldCupStartTemperature);
    return this.logisticFunction(logisticYMin, this.coldCupEndTemperature, 0.1, time);
  }

  /**
   * The logistic function looks like an S shape. We will only use the points on the right side of
   * the function. Since we only want the right side of the function, the data points we will
   * use will start from the middle of the S shape. This means in order to start our line at a
   * specific y value, we need the midpoint between yMin and yMax to equal the y starting
   * point that we want.
   *
   * For example for our hot cup, if we want our starting point to be y = 100 and our ending point
   * to be y = 20, we actually need yMin to be 20 and yMax to be 180 in the logistic function.
   * This is because the difference between 180 and 20 is 160. Half of 160 is 80. If we take 20 and
   * add 80, we will get 100.
   *
   * For example for our cold cup, if we want our starting point to be y = 5 and our ending point to
   * be y = 20, we need yMin to be -10 and yMax to be 20 in the logistic function.
   * This is because the difference between 20 and -10 is 30. Half of 30 is 15. If we take -10 and
   * add 15, we will get 5.
   *
   * https://en.wikipedia.org/wiki/Logistic_function
   *
   * @param yMin
   * @param yMax
   * @param curvature This determines which way the graph line will curve and how sharp it curves.
   * If the value is positive, the line values will increase.
   * If the value is negative, the line values will decrease.
   * The smaller the absolute value, the flatter the line will be.
   * The larger the absolute value, the sharper the line will be when it curves.
   * @param x The time value
   * @returns The temperature value
   */
  logisticFunction(yMin: number, yMax: number, curvature: number, x: number): number {
    return yMin + (yMax - yMin) / (1 + Math.exp(-curvature * x));
  }

  /**
   * Initialize the trial by clearing out the data in it.
   */
  initializeTrial(): void {
    this.trial.initialize();
  }

  /**
   * Get the hot cup temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getHotCupTemperatureDataPoint(time: number): number[] {
    return [time, this.getHotCupTemperature(time)];
  }

  /**
   * Get the cold cup temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getColdCupTemperatureDataPoint(time: number): number[] {
    return [time, this.getColdCupTemperature(time)];
  }

  /**
   * Add the data points at the given time to the trial object.
   * @param time Add the data points at this specific time.
   */
  addDataPointsToTrial(time: number): void {
    this.trial.addDataPointToHotCupSeries(time, this.getHotCupTemperature(time));
    this.trial.addDataPointToColdCupSeries(time, this.getColdCupTemperature(time));
  }

  /**
   * Update the trial and send it to WISE.
   * @param time Add the temperatures for this time point.
   */
  updateAndSendTrial(time: number): void {
    // update the trial to add the new temperature data points.
    this.addDataPointsToTrial(time);
    this.wiseAPI.save(this.trial.toJsonObject());
  }

  generateEasingFunction(label: string): any {
    if (label === 'hot') {
      return this.generateHotThermometerEasingFunction();
    } else if (label === 'cold') {
      return this.generateColdThermometerEasingFunction();
    } else {
      return null;
    }
  }

  generateHotThermometerEasingFunction(): any {
    const thisDataPointHandler = this;
    return (pos: number): number => {
      return (
        1 -
        (thisDataPointHandler.getHotCupTemperature(pos * this.maxTime) -
          this.hotCupEndTemperature) /
          (this.hotCupStartTemperature - this.hotCupEndTemperature)
      );
    };
  }

  generateColdThermometerEasingFunction(): any {
    const thisDataPointHandler = this;
    return (pos: number): number => {
      return (
        (thisDataPointHandler.getColdCupTemperature(pos * this.maxTime) -
          this.coldCupStartTemperature) /
        (this.coldCupEndTemperature - this.coldCupStartTemperature)
      );
    };
  }
}
