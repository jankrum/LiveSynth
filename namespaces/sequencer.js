import Device from '/namespaces/device.js';
import { LOOPBACK_REQUEST, isLoopbackCall, sendLoopbackCall } from '/namespaces/constants.js';

// An interface for the sequencer, from the perspective of a peripheral
export default class Sequencer extends Device {
    constructor(_sourceName) {
        // Things we always do when connecting to a sequencer
        super('Sequencer', _sourceName, LOOPBACK_REQUEST);

        // How we will always respond to sequencer
        this.addHandler(isLoopbackCall, sendLoopbackCall);
    }
}