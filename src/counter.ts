import { Image } from 'svg.js';

export class Counter {
  counter: Image;
  draw: any;

  constructor(draw: any, x: number, y: number) {
    this.draw = draw;
    this.counter = this.draw.image('./images/counterCold.svg').move(x, y);
  }
}
