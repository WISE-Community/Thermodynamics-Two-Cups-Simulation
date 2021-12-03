/**
 * The class that accumulates the temperature data points.
 */
export class Trial {
  id;
  trial;

  // the name of the trial
  name: string;

  // an array containing multiple series
  series: object[];

  constructor() {
    // get the current time in milliseconds to use as our trial id
    this.id = new Date().getTime();
    this.initialize();
  }

  /**
   * Initialize the series in the trial.
   */
  initialize() {
    this.trial = {};

    /*
     * Always use the same trial id so that when the student runs the model
     * again, the previous data points will be erased and the data points will
     * be drawn again as the model runs.
     */
    this.trial.id = this.id;
    this.trial.name = 'Cup and Counter Temperatures';
    this.trial.series = [];
    this.trial.series.push(this.createSeries('Cup', 'red', 'circle'));
    this.trial.series.push(this.createSeries('Counter', 'black', 'circle'));
  }

  /**
   * Get the trial JSON object.
   * @return The trial JSON Object.
   */
  toJsonObject() {
    return this.trial;
  }

  /**
   * Create a series object.
   * @param name The name of the series.
   * @param color The color of the series that will show up if it is diplayed on
   * a graph.
   * @param marker The symbol used for the data points on the graph.
   */
  createSeries(name, color, marker) {
    return {
      name: name,
      color: color,
      marker: { symbol: marker },
      data: [],
    };
  }

  /**
   * Add a data point to a series.
   * @param series The series object to add the data point to.
   * @param x The x value of the data point.
   * @param y The y value of the data point.
   */
  addDataPointToSeries(series, x, y) {
    series.data.push({ x: x, y: y });
  }

  /**
   * Add a data point to the cup series.
   * @param x The x value of the data point. This will be the time.
   * @param y The y value of the data point. This will be the temperature.
   */
  addDataPointToCupSeries(x, y) {
    this.addDataPointToSeries(this.getCupSeries(), x, y);
  }

  /**
   * Add a data point to the counter series.
   * @param x The x value of the data point. This will be the time.
   * @param y The y value of the data point. This will be the temperature.
   */
  addDataPointToCounterSeries(x, y) {
    this.addDataPointToSeries(this.getCounterSeries(), x, y);
  }

  /**
   * Get the cup series from the trial.
   * @return The cup series object.
   */
  getCupSeries() {
    return this.trial.series[0];
  }

  /**
   * Get the counter series from the trial.
   * @return The counter series object.
   */
  getCounterSeries() {
    return this.trial.series[1];
  }
}
