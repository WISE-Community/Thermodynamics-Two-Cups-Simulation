import { AnimationHandler } from './animationHandler';
import { Button } from './button';
import { Util } from './util';
import * as $ from 'jquery';

/**
 * The class that orchestrates the model interactions and animations.
 */
export class CupCounterModel {
  // the url GET parameters, if any
  parameters: any;

  /*
   * the state of the model which can be
   * 'initialized', 'playing', 'paused', or 'completed'
   */
  state: string;

  // the object that handles animating elements
  animationHandler: AnimationHandler;

  // the button that performs play, pause, resume, restart
  button: Button;

  constructor() {
    // set the url parameters if there are any
    this.parameters = Util.parseURLParameters();
    this.setParameters(this.parameters);
    this.state = 'initialized';
    this.animationHandler = new AnimationHandler(this);
    this.button = new Button(this);
  }

  /**
   * Start playing the model from the beginning. This only gets called the first
   * time the model runs. For subsequent runs, restart() will be called.
   */
  play() {
    this.setState('playing');
    this.animationHandler.startAnimation();
  }

  /**
   * Pause the model.
   */
  pause() {
    this.setState('paused');
    this.animationHandler.pause();
    this.button.modelPaused();
  }

  /**
   * Resume playing the model after it has previously been paused.
   */
  resume() {
    this.setState('playing');
    this.animationHandler.resume();
    this.button.modelPlayed();
  }

  /**
   * Reset the model back to its initial state.
   */
  reset() {
    this.setState('initialized');

    this.animationHandler.stopAnimations();

    // move all the images back to their original positions and states
    this.animationHandler.resetAnimations();
  }

  /**
   * Reset the model and begin playing from the beginning.
   */
  restart() {
    this.setState('playing');

    // move all the images back to their original positions and states
    this.animationHandler.resetAnimations();

    this.animationHandler.startAnimation();
  }

  /**
   * Get the state of the model.
   * @return A string containing the state of the model. Possible values are
   * 'initialized', 'playing', 'paused', or 'completed'.
   */
  getState() {
    return this.state;
  }

  /**
   * Set the state of the model.
   * @param state A string specifying the state of the model. Possible values
   * are 'initialized', 'playing', 'paused', or 'completed'
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Check if the model is playing.
   * @return Whether the model is playing.
   */
  isStatePlaying() {
    return this.state == 'playing';
  }

  /**
   * Set the state of the model to completed.
   */
  setCompleted() {
    this.state = 'completed';
    this.button.modelCompleted();
    this.animationHandler.modelCompleted();
  }

  /**
   * Set the url parameters if there are any.
   * @parameters An object with key value pairs.
   */
  setParameters(parameters) {
    let top = parameters.top;
    let left = parameters.left;
    if (top != null) {
      // position the model vertically from the top of the screen
      $('#modelDiv').css('top', top);
      let buttonsTop = top + 20;
      $('#playPauseButton').css('top', buttonsTop);
      $('#resetButton').css('top', buttonsTop);
    }
    if (left != null) {
      // position the model horizontally from the left of the screen
      $('#modelDiv').css('left', left);
      let playPauseButtonLeft = left + 35;
      let resetButtonLeft = left + 85;
      $('#playPauseButton').css('left', playPauseButtonLeft);
      $('#resetButton').css('left', resetButtonLeft);
    }
  }
}
