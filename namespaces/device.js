import Connection from '/namespaces/connection.js';
import { SYSEX_HEADER, DEVICE_ID, SYSEX_TERMINATOR } from '/namespaces/constants.js';

// A class for interacting with external MIDI devices
export default class Device {
    static midiAccess = null;  // Holds the browser's MIDI access obj

    static keyDelimiter = 'To';  // Used to create the storage keys for caching

    // Stores MIDI access as static property
    static async initialize() {
        this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
    }

    // Device-to-connect-to 
    constructor(targetName, sourceName, handshakeInitiator) {
        this.inputConnection = new Connection(targetName + Device.keyDelimiter + sourceName);
        this.outputConnection = new Connection(sourceName + Device.keyDelimiter + targetName);
        this.handshakeInitiator = handshakeInitiator;  // The value to send when initiating handshake
        this.handlerFunctions = [];
        this.inputFromDevice = null; // MIDI input object that we don't have yet
        this.outputToDevice = null; // MIDI output object that we don't have yet
    }

    // Handlers for when a message is recieved on the input
    addHandler(predicate, response) {
        this.handlerFunctions.push([predicate, response])
    }

    // Creates connection between device and interfaces
    createConnection() {
        // Incase we need to reference these directly
        this.inputFromDevice = this.inputConnection.getConnectionFrom(Device.midiAccess.inputs);
        this.outputToDevice = this.outputConnection.getConnectionFrom(Device.midiAccess.outputs);

        const output = this.outputToDevice;
        const funcs = this.handlerFunctions;

        console.log(output.send)

        // Sets up handler functions as callback for when messages are recieved
        this.inputFromDevice.onmidimessage = async function ({ data }) {
            for (const [predicate, response] of funcs) {
                if (predicate(data)) {
                    const result = await response(data);
                    console.log({ result })
                    if (result) {
                        output.send(result);
                    }
                    break;
                }
            }
        };

        // Initiates handshake
        this.outputToDevice.send(this.handshakeInitiator);
    }

    static makeJsonSysexMessage(objectToSend) {
        const text = JSON.stringify(objectToSend);
        const charArray = text.split('');
        const byteArray = charArray.map(char => char.charCodeAt(0));
        const sysexMessage = [SYSEX_HEADER, DEVICE_ID, ...byteArray, SYSEX_TERMINATOR];
        return sysexMessage;
    }

    static getObjectFromJsonSysex(sysexMessage) {
        const byteArray = sysexMessage.slice(2, -1);
        const text = String.fromCharCode(...byteArray);
        const objectFromMessage = JSON.parse(text);
        return objectFromMessage;
    }
}