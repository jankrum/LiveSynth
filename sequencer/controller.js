import Peripheral from '/sequencer/peripheral.js';

// An interface for the controller, from the perspective of the sequencer
export default class Controller extends Peripheral {
    constructor(partName) {
        const __targetName = partName + 'Controller';
        super(__targetName);
    }
}