import { Trial } from './trial';
import { WISEAPI } from './wiseAPI';

/**
 * The class that handles the temperature data points and sends them to WISE.
 */
export class DataPointHandler {
  // an array of temperature data points for the hot cup
  hotCupTemperatures: any[];

  // an array of temperature data points for the cold cup
  coldCupTemperatures: any[];

  // the trial object that we will send to WISE
  trial: Trial;

  // the API we use to send data to WISE
  wiseAPI: WISEAPI;

  constructor() {
    this.trial = new Trial();
    this.wiseAPI = new WISEAPI();
    this.hotCupTemperatures = [
      [0, 100],
      [1, 90],
      [2, 82],
      [3, 74],
      [4, 68],
      [5, 60],
      [6, 53],
      [7, 46],
      [8, 40],
      [9, 35],
      [10, 31],
      [11, 27],
      [12, 24],
      [13, 22],
      [14, 21],
      [15, 20],
    ];
    this.coldCupTemperatures = [
      [0, 5],
      [1, 7],
      [2, 10],
      [3, 12],
      [4, 14],
      [5, 16],
      [6, 18],
      [7, 19],
      [8, 19.5],
      [9, 20],
      [10, 20],
      [11, 20],
      [12, 20],
      [13, 20],
      [14, 20],
      [15, 20],
    ];
  }

  /**
   * Initialize the trial by clearing out the data in it.
   */
  initializeTrial() {
    this.trial.initialize();
  }

  /**
   * Get the hot cup temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getHotCupTemperatureDataPoint(time) {
    return this.hotCupTemperatures[time];
  }

  /**
   * Get the cold cup temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getColdCupTemperatureDataPoint(time) {
    return this.coldCupTemperatures[time];
  }

  /**
   * Get the temperature of the hot cup at a specific time.
   * @param time The time we want the temperature for. This will be an integer.
   * @return A float value representing the temperature in Celsius like 31.8
   */
  getHotCupTemperature(time) {
    return this.getDataPointY(this.hotCupTemperatures[time]);
  }

  /**
   * Get the temperature of the cold cup at a specific time.
   * @param time The time we want the temperature for. This will be an integer.
   * @return A float value representing the temperature in Celsius like 29.3
   */
  getColdCupTemperature(time) {
    return this.getDataPointY(this.coldCupTemperatures[time]);
  }

  /**
   * Get the x value of the data point.
   * @param dataPoint An array containing two values. The first being x, and the
   * second being y like [x, y].
   * @return The x value of the data point.
   */
  getDataPointX(dataPoint) {
    return dataPoint[0];
  }

  /**
   * Get the y value of the data point.
   * @param dataPoint An array containing two values. The first being x, and the
   * second being y like [x, y].
   * @return the y value of the data point.
   */
  getDataPointY(dataPoint) {
    return dataPoint[1];
  }

  /**
   * Add the data points at the given time to the trial object.
   * @param time Add the data points at this specific time.
   */
  addDataPointsToTrial(time) {
    const hotCupTemperatureDataPoint = this.getHotCupTemperatureDataPoint(time);
    const coldCupTemperatureDataPoint = this.getColdCupTemperatureDataPoint(time);
    this.trial.addDataPointToHotCupSeries(
      this.getDataPointX(hotCupTemperatureDataPoint),
      this.getDataPointY(hotCupTemperatureDataPoint)
    );
    this.trial.addDataPointToColdCupSeries(
      this.getDataPointX(coldCupTemperatureDataPoint),
      this.getDataPointY(coldCupTemperatureDataPoint)
    );
  }

  /**
   * Update the trial and send it to WISE.
   * @param time Add the temperatures for this time point.
   */
  updateAndSendTrial(time) {
    // update the trial to add the new temperature data points.
    this.addDataPointsToTrial(time);
    this.wiseAPI.save(this.trial.toJsonObject());
  }

  /**
   * Get the slope of the line that intersects the two points.
   * @param x1 The x value of the first point.
   * @param y1 The y value of the first point.
   * @param x2 The x value of the second point.
   * @param y2 The y value of the second point.
   * @return The slope of the line.
   */
  getSlope(x1, y1, x2, y2) {
    return (y2 - y1) / (x2 - x1);
  }

  /**
   * Calculate the y intercept of the line that intersects the two points.
   * @param x1 The x value of the first point.
   * @param y1 The y value of the first point.
   * @param x2 The x value of the second point.
   * @param y2 The y value of the second point.
   * @return The y intercept of the line.
   */
  getYIntercept(x1, y1, x2, y2) {
    let slope = this.getSlope(x1, y1, x2, y2);
    return y1 - slope * x1;
  }

  /**
   * Calculate the value of y given the equation of a line.
   * @param m The slope of the line.
   * @param x Calculate the y value for this given value of x.
   * @param b The y intercept.
   * @return The calculated y value.
   */
  calculateY(m, x, b) {
    return m * x + b;
  }
}
