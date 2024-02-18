class MidiDevice {
    static midiAccess = null;  // Holds the browser's MIDI access obj

    // Stores MIDI access as static property
    static async initialize() {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    constructor(inputName, outputName, handshakeInitiator) {
        this.inputConnection = new MidiConnection(inputName);  // Lets us procrastinate on getting what is meant
        this.outputConnection = new MidiConnection(outputName);
        this.handshakeInitiator = handshakeInitiator;  // The value to send when initiating handsake
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