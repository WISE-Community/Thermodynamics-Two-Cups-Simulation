import * as $ from 'jquery';
import { CupCounterModel } from './cupCounterModel';

/**
 * The button that handles playing, pausing, resuming, and restarting the model.
 */
export class Button {
  /*
   * The model which we need a reference to in order to play, pause, resume, and
   * stop it.
   */
  cupCounterModel: CupCounterModel;

  /**
   * Constructor that sets up the button click event listener.
   * @param cupCounterModel The cup counter model.
   */
  constructor(cupCounterModel: CupCounterModel) {
    this.cupCounterModel = cupCounterModel;

    $('#playPauseButton').on('click', () => {
      let state: string = this.cupCounterModel.getState();
      if (state == 'initialized') {
        // the model is initialized so we will now start playing it
        this.cupCounterModel.play();
        this.showPauseButton();
      } else if (state == 'playing') {
        // the model is playing so we will now pause it
        this.cupCounterModel.pause();
        this.showPlayButton();
      } else if (state == 'paused') {
        // the model is paused so we will now resume playing it
        this.cupCounterModel.resume();
        this.showPauseButton();
      }
    });

    $('#resetButton').on('click', () => {
      this.cupCounterModel.reset();
      this.enablePlayPauseButton();
      this.showPlayButton();
    });
  }

  /**
   * Show the the play icon on the button.
   */
  showPlayButton() {
    this.setPlayPauseButtonIcon('play_arrow');
  }

  /**
   * Show the pause icon on the button.
   */
  showPauseButton() {
    this.setPlayPauseButtonIcon('pause');
  }

  /**
   * Allow the student to click on the play/pause button.
   */
  enablePlayPauseButton() {
    $('#playPauseButton').prop('disabled', null);
  }

  /**
   * Disallow the student from clicking on the play/pause button.
   */
  disablePlayPauseButton() {
    $('#playPauseButton').prop('disabled', true);
  }

  /**
   * Set the material design icon.
   * @param text The text for the material design icon.
   */
  setPlayPauseButtonIcon(text: string) {
    $('#playPauseButtonIcon').html(text);
  }

  /**
   * The model has been paused.
   */
  modelPaused() {
    this.showPlayButton();
  }

  /**
   * The model is now playing.
   */
  modelPlayed() {
    this.showPauseButton();
  }

  /**
   * The model is done running.
   */
  modelCompleted() {
    this.disablePlayPauseButton();
  }
}
