import Peripheral from '/sequencer/peripheral.js';
import { isLoopbackCall, isButtonPress } from '/namespaces/constants.js';

// An interface for the controller, from the perspective of the sequencer
export default class Transporter extends Peripheral {
    constructor(fsm) {
        super('Transporter');
        this.addHandler(isLoopbackCall, () => fsm.getState());
        this.addHandler(isButtonPress, data => fsm.handleButtonPress(data));
    }
}