import Device from '/namespaces/device.js';
import { LOOPBACK_CALL, isLoopbackRequest, sendLoopbackCall, RESET } from '/namespaces/constants.js';

// An interface for a peripheral, from the perspective of the sequencer
export default class Peripheral extends Device {
    constructor(_targetName) {
        // Things we always do when connecting to a peripheral
        super(_targetName, 'Sequencer', LOOPBACK_CALL);

        // How we will always respond to peripherals
        this.addHandler(isLoopbackRequest, sendLoopbackCall);
    }

    remove() {
        this.outputToDevice.send([RESET]);
    }
}