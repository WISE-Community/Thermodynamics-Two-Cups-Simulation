
/**
 * The class that sends data to WISE.
 */
export class WISEAPI {

  constructor() {

  }

  /**
   * Save the trial data to WISE.
   */
  save(trial: object) {
    let componentState = this.createComponentState(trial);
    this.saveWISE5State(componentState);
  }

  /**
   * Create a component state with the trial in it.
   * @param trial The trial object to save.
   */
  createComponentState(trial) {
    let trials = [trial];
    let componentState = {};
    componentState.isAutoSave = false;
    componentState.isSubmit = false;
    componentState.studentData = {
      'trials': trials
    };
    return componentState;
  }

  /**
   * Save the component state to WISE.
   */
  saveWISE5State(componentState: any) {
    componentState.messageType = 'studentWork';
    this.sendMessage(componentState);
  }

  /**
   * Send a post message to the parent of the iframe.
   */
  sendMessage(message: any) {
    window.postMessage(message, '*');
  }
}
