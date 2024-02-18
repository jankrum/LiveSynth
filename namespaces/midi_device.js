class MidiDevice {
    static midiAccess = null;  // Holds the browser's MIDI access obj

    // Stores MIDI access as static property
    static async initialize() {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    constructor(inputName, outputName, handshakeInitiator) {
        this.inputConnection = new MidiConnection(inputName);
        this.outputConnection = new MidiConnection(outputName);
        this.handshakeInitiator = handshakeInitiator;
        this.handlerFunctions = [];
        this.inputFromDevice = null; // MIDI input object
        this.outputToDevice = null; // MIDI output object
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
        this.inputFromDevice = this.inputConnection.getConnectionFrom(MidiDevice.midiAccess.inputs);
        this.outputToDevice = this.outputConnection.getConnectionFrom(MidiDevice.midiAccess.outputs);

        this.inputFromDevice.onmidimessage = ({ data }) => {
            this.handlerFunctions.some(handlerFunction => handlerFunction(data));
        };

        this.outputToDevice.send(this.handshakeInitiator);
    }
}