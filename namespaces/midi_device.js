class GenericMIDIDevice {
    static midiAccess = null;  // Holds the browser's MIDI access obj

    // Stores MIDI access as static property
    static async initialize() {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    constructor(inputName, outputName, handshakeInitiator) {
        this.inputConnection = new AnkrumMIDIConnection(inputName);
        this.outputConnection = new AnkrumMIDIConnection(outputName);
        this.handshakeInitiator = handshakeInitiator;
        this.handlerFunctions = [];
        this.inputFromDevice = null; // MIDI input object
        this.outputToDevice = null; // MIDI output object
    }

    addHandler(predicate, response) {
        this.handlerFunctions.push((data) => {
            if (predicate(data)) {
                const responseData = response(data);
                this.outputToDevice.send(responseData);
                return true;
            }
            return false;
        });
    }

    createConnection() {
        this.inputFromDevice = this.inputConnection.getFrom(GenericMIDIDevice.midiAccess.inputs);
        this.outputToDevice = this.outputConnection.getFrom(GenericMIDIDevice.midiAccess.outputs);

        this.inputFromDevice.onmidimessage = ({ data }) => {
            this.handlerFunctions.some(handlerFunction => handlerFunction(data));
        };

        this.outputToDevice.send(this.handshakeInitiator);
    }
}