function selectFromList(label, choices, transformer) {
    if (choices.length === 0) {
        throw new Error('No choices');
    }

    const promptText = [label, ...choices.map((choice, index) => `[${index + 1}] ${choice}`)].join('\n');
    const userInput = prompt(promptText);

    console.debug(`User said ${userInput}`);

    if (userInput === null) {
        // User clicked cancel
        console.debug('%cUSER CANCELLED', 'background-color: orange;');
        throw new Error('cancelled');
    }

    // Gets the original label
    const baseLabel = label.split('\n').slice(-1)[0];

    const index = userResponse = parseInt(userInput, 10);

    if (isNaN(index)) {
        // If the user did not enter a number
        console.debug('%cWhich was not a number', 'background-color: orange;');
        const newLabel = `Please enter a number\n${baseLabel}`;
        return selectFromList(newLabel, choices, transformer);
    }

    if (index < 1 || index > choices.length) {
        // If the user entered a number outside the legal range
        console.debug('%cWhich was not in range', 'background-color: orange;');
        const newLabel = `Please enter a number in the range\n${baseLabel}`;
        return selectFromList(newLabel, choices, transformer);
    }

    const selectedItem = choices[index - 1];
    const result = transformer(selectedItem);

    if (result === undefined) {
        // If the user choose something that we couldn't use
        console.debug('%cWhich was not valid', 'background-color: firebrick;');
        const newLabel = `Invalid choice\n${baseLabel}`;
        const newChoices = choices.filter((_, iterIndex) => iterIndex !== index - 1);
        return selectFromList(newLabel, newChoices, transformer);
    }

    return result;
}

function getPortByName(midiMap, portName) {
    const midiArray = Array.from(midiMap);

    const foundPort = midiArray.find(([_, { name }]) => name === portName);

    if (foundPort) {
        const key = foundPort[0];
        try {
            const port = midiMap.get(key);
            return port;
        } catch {
            // Well we looked and we couldn't find it. Pack it up boys.
        }
    }
}

class AnkrumMIDIConnection {
    constructor(name) {
        this.name = name;
        this.storageKey = `midiConnection_${name}`;
    }

    getFrom(midiMap) {
        const storedPortName = localStorage.getItem(this.storageKey);

        if (storedPortName) {  // If there is a value
            console.debug(`%cFound a value (${storedPortName}) for the '${this.name}'!`, 'color: lightgreen');
            const port = getPortByName(midiMap, storedPortName);

            if (port) {
                console.debug('%cAnd it was good!', 'background-color: green;');
                return port;
            } else {
                console.debug('%cBut it was bad', 'color: orange;');
                localStorage.removeItem(this.storageKey);
            }
        }

        console.debug('%cAsking the user to choose a port', 'color: white; background-color: #333;');

        const label = `Choose a port for ${this.name}`;
        const allPortNames = Array.from(midiMap).map(([_, { name }]) => name);

        const userResponse = selectFromList(label, allPortNames, chosenPortName => {
            try {
                console.debug(`Trying ${chosenPortName}`);
                const port = getPortByName(midiMap, chosenPortName);
                console.debug(port);
                if (port) {
                    console.debug('Its real, TRYING TO STORE IT');
                    localStorage.setItem(this.storageKey, chosenPortName);
                    console.debug('IT IS STORED');
                    return port;
                }
            } catch (err) {
                console.debug('%cBut it was NO GOOD', 'background-color: fuchsia;');
                console.error(err.message)
                return;
            }
        });

        return userResponse;
    }
}

class GenericMIDIDevice {
    static midiAccess = null;

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


async function main() {
    // try {
    await GenericMIDIDevice.initialize();

    // Example usage
    const midiDevice = new GenericMIDIDevice("o2b", "b2o", [144, 60, 0]);

    // Example handler functions
    const noteOnPredicate = (data) => data[0] === 144; // MIDI note on message
    const noteOnResponse = (data) => [144, data[1], 127]; // Increase velocity

    const noteOffPredicate = (data) => data[0] === 128; // MIDI note off message
    const noteOffResponse = (data) => [128, data[1], 0]; // Set velocity to 0

    // Add handlers
    midiDevice.addHandler(noteOnPredicate, noteOnResponse);
    midiDevice.addHandler(noteOffPredicate, noteOffResponse);

    // At this point, you can call createConnection() to establish the MIDI connection
    midiDevice.createConnection();

    console.log('Done!');
}

window.addEventListener('load', main);