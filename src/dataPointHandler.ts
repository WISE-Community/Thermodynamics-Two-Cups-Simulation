import { Trial } from './trial';
import { WISEAPI } from './wiseAPI';

/**
 * The class that handles the temperature data points and sends them to WISE.
 */
export class DataPointHandler {

  // an array of temperature data points for the cup
  cupTemperatures: any[];

  // an array of temperature data points for the counter
  counterTemperatures: any[];

  // the trial object that we will send to WISE
  trial: object;

  // the API we use to send data to WISE
  wiseAPI: object;

  constructor() {
    this.trial = new Trial();
    this.wiseAPI = new WISEAPI();
    this.cupTemperatures = [[0,60],[1,53],[2,48],[3,44],[4,41],[5,39],[6,37],[7,35.5],[8,34],[9,32.8],[10,31.8],[11,31.2],[12,30.8],[13,30.5],[14,30.2],[15,30]];
    this.counterTemperatures = [[0,20],[1,23],[2,25],[3,26.5],[4,27.3],[5,27.8],[6,28.2],[7,28.5],[8,28.8],[9,29.1],[10,29.3],[11,29.5],[12,29.7],[13,29.8],[14,29.9],[15,30]];
  }

  /**
   * Initialize the trial by clearing out the data in it.
   */
  initializeTrial() {
    this.trial.initialize();
  }

  /**
   * Get the cup temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getCupTemperatureDataPoint(time) {
    return this.cupTemperatures[time];
  }

  /**
   * Get the counter temperature at a specific time.
   * @param time The time we want the data point for. This will be an integer.
   * @return An array containing the time and temperature like
   * [time, temperature]
   */
  getCounterTemperatureDataPoint(time) {
    return this.counterTemperatures[time];
  }

  /**
   * Get the temperature of the cup at a specific time.
   * @param time The time we want the temperature for. This will be an integer.
   * @return A float value representing the temperature in Celsius like 31.8
   */
  getCupTemperature(time) {
    return this.getDataPointY(this.cupTemperatures[time]);
  }

  /**
   * Get the temperature of the counter at a specific time.
   * @param time The time we want the temperature for. This will be an integer.
   * @return A float value representing the temperature in Celsius like 29.3
   */
  getCounterTemperature(time) {
    return this.getDataPointY(this.counterTemperatures[time]);
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
    let cupTemperatureDataPoint = this.getCupTemperatureDataPoint(time);
    let counterTemperatureDataPoint = this.getCounterTemperatureDataPoint(time);
    this.trial.addDataPointToCupSeries(this.getDataPointX(cupTemperatureDataPoint), this.getDataPointY(cupTemperatureDataPoint));
    this.trial.addDataPointToCounterSeries(this.getDataPointX(counterTemperatureDataPoint), this.getDataPointY(counterTemperatureDataPoint));
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
   * Scale the cup position so that it more accurately matches the cup
   * temperature.
   * @param pos A value between 0 and 1 inclusive. 0 represents the beginnning
   * position (0 seconds, 60 Celsius). 1 represents the end position
   * (15 seconds, 30 Celsius).
   * @return A scaled position that reflects the curved temperature line instead
   * of a straight line. This value will be between 0 and 1.
   */
  getScaledCupPos(pos) {
    if (pos == 1) {
      // the pos is at 1 (the end) so we don't need to perform any scaling
      return 1;
    } else {
      // get the time position as a value between 0 and 15
      let scaledX = pos * 15;

      /*
       * Get the point that comes before and the one that comes after at the
       * integer boundaries.
       * Example:
       * if scaledX == 3.3
       * then the point before will be at x = 3 and the point after will be at
       * x = 4
       */
      let points = this.getBeforeAndAfterCupPoints(scaledX);
      let x1 = points.x1;
      let y1 = points.y1;
      let x2 = points.x2;
      let y2 = points.y2;

      let slope = this.getSlope(x1, y1, x2, y2);
      let b = this.getYIntercept(x1, y1, x2, y2);

      // calculate the new temperature
      let newY = this.calculateY(slope, scaledX, b);

      // convert the new temperature back to a value between 0 and 1
      let newPos = (60 - newY) / (60 - 30);

      return newPos;
    }
  }

  /**
   * Scale the counter position so that it more accurately matches the counter
   * temperature.
   * @param pos A value between 0 and 1 inclusive. 0 represents the beginnning
   * position (0 seconds, 20 Celsius). 1 represents the end position
   * (15 seconds, 30 Celsius).
   * @return A scaled position that reflects the curved temperature line instead
   * of a straight line. This value will be between 0 and 1.
   */
  getScaledCounterPos(pos) {
    if (pos == 1) {
      // the pos is at 1 (the end) so we don't need to perform any scaling
      return 1;
    } else {
      // get the time position as a value between 0 and 15
      let scaledX = pos * 15;

      /*
       * Get the point that comes before and the one that comes after at the
       * integer boundaries.
       * Example:
       * if scaledX == 3.3
       * then the point before will be at x = 3 and the point after will be at
       * x = 4
       */
      let points = this.getBeforeAndAfterCounterPoints(scaledX);
      let x1 = points.x1;
      let y1 = points.y1;
      let x2 = points.x2;
      let y2 = points.y2;

      let slope = this.getSlope(x1, y1, x2, y2);
      let b = this.getYIntercept(x1, y1, x2, y2);

      // calculate the new temperature
      let newY = this.calculateY(slope, scaledX, b);

      // convert the new temperature back to a value between 0 and 1
      let newPos = (newY - 20) / (30 - 20);

      return newPos;
    }
  }

  /**
   * Get the cup temperature point that comes before and the point that comes
   * after at the integer boundaries.
   * Example:
   * if x == 3.3
   * then the point before will be at x = 3 and the point after will be at
   * x = 4
   * @param x Get the points that come before and after this x value.
   * @return An object that contains the x and y values of the point that comes
   * before our x and the x and y values of the point that comes after our x.
   */
  getBeforeAndAfterCupPoints(x) {
    // get the x integer values that come before and after our x
    let x1 = Math.floor(x);
    let x2 = Math.ceil(x);
    if (x1 == x2) {
      /*
       * If x is an exact integer, x1 and x2 will be the same so we need
       * to increment x2 by 1.
       */
      x2 += 1;
    }

    // get the temperature values for x1 and x2
    let y1 = this.cupTemperatures[x1][1];
    let y2 = this.cupTemperatures[x2][1];

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    }
  }

  /**
   * Get the couner temperature point that comes before and the point that comes
   * after at the integer boundaries.
   * Example:
   * if x == 3.3
   * then the point before will be at x = 3 and the point after will be at
   * x = 4
   * @param x Get the points that come before and after this x value.
   * @return An object that contains the x and y values of the point that comes
   * before our x and the x and y values of the point that comes after our x.
   */
  getBeforeAndAfterCounterPoints(x) {
    // get the x integer values that come before and after our x
    let x1 = Math.floor(x);
    let x2 = Math.ceil(x);
    if (x1 == x2) {
      /*
       * If x is an exact integer, x1 and x2 will be the same so we need
       * to increment x2 by 1.
       */
      x2 += 1;
    }

    // get the temperature values for x1 and x2
    let y1 = this.counterTemperatures[x1][1];
    let y2 = this.counterTemperatures[x2][1];

    return {
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2
    }
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
    return y1 - (slope * x1);
  }

  /**
   * Calculate the value of y given the equation of a line.
   * @param m The slope of the line.
   * @param x Calculate the y value for this given value of x.
   * @param b The y intercept.
   * @return The calculated y value.
   */
  calculateY(m, x, b) {
    return (m * x) + b;
  }
}
