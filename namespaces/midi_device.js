// A class for interacting with external MIDI devices
class MidiDevice {
    static midiAccess = null;  // Holds the browser's MIDI access obj

    static keyDelimiter = 'To';  // Used to create the storage keys for caching

    // Stores MIDI access as static property
    static async initialize() {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    // Device-to-connect-to 
    constructor(targetName, sourceName, handshakeInitiator) {
        this.inputConnection = new MidiConnection(targetName + MidiDevice.keyDelimiter + sourceName);
        this.outputConnection = new MidiConnection(sourceName + MidiDevice.keyDelimiter + targetName);
        this.handshakeInitiator = handshakeInitiator;  // The value to send when initiating handshake
        this.handlerFunctions = [];
        this.inputFromDevice = null; // MIDI input object that we don't have yet
        this.outputToDevice = null; // MIDI output object that we don't have yet
    }

    // Handlers for when a message is recieved on the input
    addHandler(predicate, response) {
        this.handlerFunctions.push((data) => {
            if (predicate(data)) {
                const responseData = response(data);
                if (responseData) {
                    this.outputToDevice.send(responseData);
                }
                return true;
            }
            return false;
        });
    }

    // Creates connection between device and interfaces
    createConnection() {
        // Incase we need to reference these directly
        this.inputFromDevice = this.inputConnection.getConnectionFrom(MidiDevice.midiAccess.inputs);
        this.outputToDevice = this.outputConnection.getConnectionFrom(MidiDevice.midiAccess.outputs);

        // Sets up handler functions as callback for when messages are recieved
        this.inputFromDevice.onmidimessage = ({ data }) => {
            this.handlerFunctions.some(handlerFunction => handlerFunction(data));
        };

        // Initiates handshake
        this.outputToDevice.send(this.handshakeInitiator);
    }
}

// An interface for the sequencer, from the perspective of a peripheral
class Sequencer extends MidiDevice {
    constructor(_sourceName) {
        // Things we always do when connecting to a sequencer
        super('Sequencer', _sourceName, MIDI_CONSTANTS.LOOPBACK_REQUEST);

        // How we will always respond to sequencer
        this.addHandler(MIDI_CONSTANTS.isLoopbackCall, MIDI_CONSTANTS.sendLoopbackCall);
    }
}

// An interface for a peripheral, from the perspective of the sequencer
class Peripheral extends MidiDevice {
    constructor(_targetName) {
        // Things we always do when connecting to a peripheral
        super(_targetName, 'Sequencer', MIDI_CONSTANTS.LOOPBACK_CALL);

        // How we will always respond to peripherals
        this.addHandler(MIDI_CONSTANTS.isLoopbackRequest, MIDI_CONSTANTS.sendLoopbackCall);
    }
}

class Transporter extends Peripheral {
    constructor() {
        super('Transporter');
    }
}

class Controller extends Peripheral {
    constructor(partName) {
        const __targetName = partName + 'Controller';
        super(__targetName);
    }
}

class Synthesizer {
    constructor(partName) {
        const sourceName = 'Sequencer';
        this.outputConnection = new MidiConnection(sourceName + MidiDevice.keyDelimiter + partName);
        this.outputToDevice = null; // MIDI output object that we don't have yet
    }

    createConnection() {
        this.outputToDevice = this.outputConnection.getConnectionFrom(MidiDevice.midiAccess.outputs);
    }
}