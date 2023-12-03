//----------------- CONSTANTS THAT ARE A PART OF THE MIDI SPEC ----------------
const NOTE_ON = 0x90
const NOTE_OFF = 0x80;
const CC_HEADER = 0xB0;
const SYSEX_HEADER = 0xF0;
const SYSEX_TERMINATOR = 0xF7;
const SONG_SELECT_HEADER = 0xF3;
const FULL = 0x7F;

//---------------- CONSTANTS THAT ARE SPECIFIC TO THIS PROJECT ----------------
const LOOPBACK_REQUEST = [SONG_SELECT_HEADER, 0];
const LOOPBACK_CALL = [SONG_SELECT_HEADER, FULL];
const DEVICE_ID = 1;
const PREVIOUS_CC = 115;
const PLAY_CC = 116;
const PAUSE_CC = 117;
const NEXT_CC = 118;
const STOP_CC = 119;

//------------------- FUNCTIONS FOR GETTING MIDI CONNECTIONS ------------------
/**
 * Given a label, a list of objects, and potentially a transformer function,
 * will prompt the user to choose a choice.
 * If the user cancels, it throws an error.
 * If the user answers something other than a number, it recurs with a warning.
 * If the user enters a number outside the range, it recurs with a warning.
 * If the user makes a choice, but the transformer function returns undefined,
 * it recurs without that choice as a choice, for it was bad.
 * @param {string} label 
 * @param {*[]} choices 
 * @param {function} transformer 
 * @returns 
 */
function selectFromList(label, choices, transformer = x => x) {
    if (choices.length === 0) {
        throw new Error('outOfChoices');
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

/**
 * For a given relationship, checks to see if there is a value in local storage
 *   If there is, we pull the value and try to connect to it
 *     If we connect to it, we return it
 *     If we can't connect to it, we clear it from local storage and proceed
 *   If there is no value, we prompt the user to choose a port
 * @param {MIDIAccess} midiAccess
 * @param {String} relationship
 * @param {String} direction
 * @returns
 */
function getPort(midiAccess, relationship, direction) {
    const storageKey = `midiConnection_${relationship}`;
    const storedPortName = localStorage.getItem(storageKey);

    const midiMap = midiAccess[`${direction}`];
    const midiArray = Array.from(midiMap);

    function getPortByName(portName) {
        for (const [key, { name }] of midiMap) {
            if (name === portName) {
                try {
                    const port = midiMap.get(key);
                    return port;
                } catch {
                    return;
                }
            }
        }
    }

    if (storedPortName) {  // If there is a value
        console.debug(`%cFound a value (${storedPortName}) for the '${relationship}' relationship!`, 'color: lightgreen');
        const port = getPortByName(storedPortName);

        if (port) {
            console.debug('%cAnd it was good!', 'background-color: green;');
            return port;
        } else {
            console.debug('%cBut it was bad', 'color: orange;');
            localStorage.removeItem(storageKey);
        }
    }

    console.debug('%cAsking the user to choose a port', 'color: white; background-color: #333;');

    const label = `Choose a port for ${relationship}`;
    const allPortNames = midiArray.map(([_, { name }]) => name);

    function testPort(chosenPortName) {
        try {
            console.debug(`Trying ${chosenPortName}`);
            const port = getPortByName(chosenPortName);
            console.debug(port);
            if (port) {
                console.debug('Its real, TRYING TO STORE IT');
                localStorage.setItem(storageKey, chosenPortName);
                console.debug('IT IS STORED');
                return port;
            }
        } catch {
            console.debug('%cBut it was NO GOOD', 'background-color: fuchsia;');
            return;
        }
    }

    const userResponse = selectFromList(label, allPortNames, testPort);

    return userResponse;
}

/**
 * Gets the MIDI ports from the list in the arg
 * @param {Object} listOfPortNamesAndDirections
 * @returns {} midiPorts
 */
async function getDesiredPorts(listOfRelationshipsAndDirections) {
    const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

    const midiPorts = listOfRelationshipsAndDirections.map(
        ({ relationship, direction }) => getPort(midiAccess, relationship, direction)
    );

    return midiPorts;
}

//--------- FUNCTIONS FOR DETERMINING THE TYPE OF MESSAGE RECEIVED --------
/**
 * Given the data from a MIDI message, determines if it is a loopback call
 * @param {Int8Array} data
 * @returns {Boolean} isLoopbackRequest
 */
function isLoopbackRequest(data) {
    return data[0] === LOOPBACK_REQUEST[0] && data[1] === LOOPBACK_REQUEST[1];
}

/**
 * Given the data from a MIDI message, determines if it is a loopback call
 * @param {Int8Array} data
 * @returns {Boolean} isLoopbackCall
 */
function isLoopbackCall(data) {
    return data[0] === LOOPBACK_CALL[0] && data[1] === LOOPBACK_CALL[1];
}

/**
 * Given the data from a MIDI message, determines if it is a sysex message
 * @param {Int8Array} data
 * @returns {Boolean} isSysexMessage
 */
function isSysexMessage(data) {
    return data[0] === SYSEX_HEADER && data[1] === DEVICE_ID;
}

/**
 * Given the data from a MIDI message, determines if it is a command call
 * @param {Int8Array} data
 * @returns {Boolean} isCommandCall
 */
function isCommandCall(data) {
    return data[0] === CC_HEADER && data[2] === FULL;
}

//-------- FUNCTIONS FOR TRANSMITTING AND RECEIVING DATA OVER MIDI --------
/**
 * Given an object to send, transforms it into a JSON string,
 * converts it to an array of ascii bytes wraps it with a
 * sysex header, device ID, and sysex terminator
 * @param {Object} objectToSend - The object to be transformed into a sysex msg
 * @returns {Int8Array} sysexMessage - A array of bytes to transmit over MIDI
 */
function makeJSONSysexMessage(objectToSend) {
    const text = JSON.stringify(objectToSend);
    const charArray = text.split('');
    const bytesArray = charArray.map(char => char.charCodeAt(0));
    const sysexMessage = [SYSEX_HEADER, DEVICE_ID, ...bytesArray, SYSEX_TERMINATOR];
    return sysexMessage;
}

/**
 * Given an array representing a MIDI sysex message containing the
 * text of a JSON object, decodes it and returns the object sent
 * @param {Int8Array} sysexMessage - An array of bytes to decode into an object
 * @returns {Object} objectFromMessage - An object to get from the JSON in the message
 */
function getObjectFromJSONSysex(sysexMessage) {
    const bytesArray = sysexMessage.slice(2, -1);
    const text = String.fromCharCode.apply(null, bytesArray);
    const objectFromMessage = JSON.parse(text);
    return objectFromMessage;
}

//------------- FUNCTIONALITY FOR RESPONDING TO MIDI MESSAGES -------------
/**
 * Makes a callback where data is destructured and passed into every
 * handler function, where each one deals with it in their own special way
 * @param {Array} handlerFunctions
 * @returns {CallableFunction} onMIDIMessageCallback
 */
function createCallbackFromHandlerFunctions(handlerFunctions) {
    return ({ data }) => {
        handlerFunctions.some(handlerFunction =>
            handlerFunction(data)
        );
    };
}

console.debug('Imported Generic!');