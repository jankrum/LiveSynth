import Connection from '/namespaces/connection.js';
import Device from '/namespaces/device.js';

export default class Synthesizer {
    constructor(partName) {
        const sourceName = 'Sequencer';
        this.outputConnection = new Connection(sourceName + Device.keyDelimiter + partName);
        this.outputToDevice = null; // MIDI output object that we don't have yet
    }

    createConnection() {
        this.outputToDevice = this.outputConnection.getConnectionFrom(Device.midiAccess.outputs);
    }
}