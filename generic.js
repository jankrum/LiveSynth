console.log('IMPORTED GENERIC!!!');

// /**
//  * Makes an object of constants and functions for use in other scripts
//  * @returns {Object} exports
//  */
// function packageValues() {
//     //--------------- CONSTANTS THAT ARE A PART OF THE MIDI SPEC --------------
//     const NOTE_ON = 0x90
//     const NOTE_OFF = 0x80;
//     const CC_HEADER = 0xB0;
//     const SYSEX_HEADER = 0xF0;
//     const SYSEX_TERMINATOR = 0xF7;
//     const SONG_SELECT_HEADER = 0xF3;
//     const FULL = 0x7F;

//     //-------------- CONSTANTS THAT ARE SPECIFIC TO THIS PROJECT --------------
//     const LOOPBACK_REQUEST = [SONG_SELECT_HEADER, 0];
//     const LOOPBACK_CALL = [SONG_SELECT_HEADER, FULL];
//     const DEVICE_ID = 1;
//     const PREVIOUS_CC = 115;
//     const PLAY_CC = 116;
//     const PAUSE_CC = 117;
//     const NEXT_CC = 118;
//     const STOP_CC = 119;


//     //---------- FUNCTIONALITY FOR GETTING DESIRED MIDI PORTS BY NAME ---------
//     /**
//      * Find the desired port in the desired direction
//      * and complain if you can't find it
//      * @param {MIDIAccess} midiAccess
//      * @param {String} portName
//      * @param {String} direction
//      * @returns
//      */
//     function getPort(midiAccess, portName, direction) {
//         const midiMap = midiAccess[direction];

//         if (midiMap.size === 0) {
//             throw new Error(`No MIDI ${direction} ports available`);
//         }

//         for (const [key, { name }] of midiMap) {
//             if (name === portName) {
//                 const port = midiMap.get(key);
//                 return port;
//             }
//         }

//         throw new Error(`No port called '${portName}' was found in ${direction}`);
//     }

//     /**
//      * Gets the MIDI ports from the list in the arg
//      * @param {Object} listOfPortNamesAndDirections
//      * @returns
//      */
//     async function getDesiredPorts(listOfPortNamesAndDirections) {
//         const midiAccess = await navigator.requestMIDIAccess({ sysex: true });

//         const midiPorts = listOfPortNamesAndDirections.map(
//             ({ portName, direction }) => getPort(midiAccess, portName, direction)
//         );

//         return midiPorts;
//     }


//     //--------- FUNCTIONS FOR DETERMINING THE TYPE OF MESSAGE RECEIVED --------
//     /**
//      * Given the data from a MIDI message, determines if it is a loopback call
//      * @param {Int8Array} data
//      * @returns {Boolean} isLoopbackCall
//      */
//     function isLoopbackRequest(data) {
//         return data[0] === LOOPBACK_REQUEST[0] && data[1] === LOOPBACK_REQUEST[1];
//     }

//     /**
//      * Given the data from a MIDI message, determines if it is a loopback call
//      * @param {Int8Array} data
//      * @returns {Boolean} isLoopbackCall
//      */
//     function isLoopbackCall(data) {
//         return data[0] === LOOPBACK_CALL[0] && data[1] === LOOPBACK_CALL[1];
//     }

//     /**
//      * Given the data from a MIDI message, determines if it is a sysex message
//      * @param {Int8Array} data
//      * @returns {Boolean} isLoopbackCall
//      */
//     function isSysexMessage(data) {
//         return data[0] === SYSEX_HEADER && data[1] === DEVICE_ID;
//     }

//     /**
//      * Given the data from a MIDI message, determines if it is a command call
//      * @param {Int8Array} data
//      * @returns {Boolean} isLoopbackCall
//      */
//     function isCommandCall(data) {
//         return data[0] === CC_HEADER && data[2] === FULL;
//     }


//     //-------- FUNCTIONS FOR TRANSMITTING AND RECEIVING DATA OVER MIDI --------
//     /**
//      * Given an object to send, transforms it into a JSON string,
//      * converts it to an array of ascii bytes wraps it with a
//      * sysex header, device ID, and sysex terminator
//      * @param {Object} objectToSend - The object to be transformed into a sysex msg
//      * @returns {Int8Array} sysexMessage - A array of bytes to transmit over MIDI
//      */
//     function makeJSONSysexMessage(objectToSend) {
//         const text = JSON.stringify(objectToSend);
//         const charArray = text.split('');
//         const bytesArray = charArray.map(char => char.charCodeAt(0));
//         const sysexMessage = [SYSEX_HEADER, DEVICE_ID, ...bytesArray, SYSEX_TERMINATOR];
//         return sysexMessage;
//     }

//     /**
//      * Given an array representing a MIDI sysex message containing the
//      * text of a JSON object, decodes it and returns the object sent
//      * @param {Int8Array} sysexMessage - An array of bytes to decode into an object
//      * @returns {Object} objectFromMessage - An object to get from the JSON in the message
//      */
//     function getObjectFromJSONSysex(sysexMessage) {
//         const bytesArray = sysexMessage.slice(2, -1);
//         const text = String.fromCharCode.apply(null, bytesArray);
//         const objectFromMessage = JSON.parse(text);
//         return objectFromMessage;
//     }


//     //------------- FUNCTIONALITY FOR RESPONDING TO MIDI MESSAGES -------------
//     /**
//      * Makes a callback where data is destructured and passed into every
//      * handler function, where each one deals with it in their own special way
//      * @param {Array} handlerFunctions
//      * @returns {CallableFunction} onMIDIMessageCallback
//      */
//     function createCallbackFromHandlerFunctions(handlerFunctions) {
//         return ({ data }) => {
//             handlerFunctions.forEach(handlerFunction => {
//                 handlerFunction(data);
//             });
//         }
//     }


//     //----------------- THE CONSTANTS AND FUNCTIONS TO EXPORT -----------------
//     return {
//         NOTE_ON,
//         NOTE_OFF,
//         CC_HEADER,
//         SYSEX_HEADER,
//         SYSEX_TERMINATOR,
//         SONG_SELECT_HEADER,
//         FULL,
//         LOOPBACK_REQUEST,
//         DEVICE_ID,
//         LOOPBACK_CALL,
//         PREVIOUS_CC,
//         PLAY_CC,
//         PAUSE_CC,
//         NEXT_CC,
//         STOP_CC,
//         getDesiredPorts,
//         createCallbackFromHandlerFunctions,
//         isLoopbackRequest,
//         isLoopbackCall,
//         isSysexMessage,
//         isCommandCall,
//         makeJSONSysexMessage,
//         getObjectFromJSONSysex
//     }
// }

// const Exports = packageValues();