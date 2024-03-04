import Peripheral from '/namespaces/peripheral.js';

// An interface for the controller, from the perspective of the sequencer
export default class Transporter extends Peripheral {
    constructor() {
        super('Transporter');
    }
}